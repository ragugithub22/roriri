import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function PaymentsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: trainees = [] } = useQuery({
    queryKey: ["trainees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, student_code, full_name")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          students(full_name),
          classes(class_name)
        `)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["academy-payments"],
    queryFn: async () => {
      const { data: paymentsData, error } = await supabase
        .from("academy_payments" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const paymentsArray = (paymentsData as any[]) || [];

      const traineeIds = paymentsArray.map((p: any) => p.student_id).filter(Boolean);
      const { data: traineesData } = await supabase
        .from("students")
        .select("id, full_name, student_code")
        .in("id", traineeIds);

      const traineesMap = new Map(((traineesData || []) as any[]).map((s: any) => [s.id, s]));

      return paymentsArray.map((payment: any) => ({
        ...payment,
        trainee: traineesMap.get(payment.student_id)
      }));
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const { error } = await supabase
        .from("academy_payments" as any)
        .insert(paymentData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["academy-payments"] });
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const paymentData = {
      payment_code: `PAY-${Date.now()}`,
      student_id: formData.get("student_id"),
      enrollment_id: formData.get("enrollment_id") || null,
      amount: parseFloat(formData.get("amount") as string),
      payment_date: formData.get("payment_date"),
      payment_method: formData.get("payment_method"),
      transaction_id: formData.get("transaction_id") || null,
      status: formData.get("status"),
      notes: formData.get("notes"),
    };
    createPaymentMutation.mutate(paymentData);
  };

  const totalRevenue = (payments as any[])
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingRevenue = (payments as any[])
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">₹{pendingRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payments Management</CardTitle>
              <CardDescription>Track and manage trainee fee payments</CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="student_id">Trainee</Label>
                    <Select name="student_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trainee" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainees.map((trainee) => (
                          <SelectItem key={trainee.id} value={trainee.id}>
                            {trainee.full_name} ({trainee.student_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment_date">Payment Date</Label>
                      <Input
                        id="payment_date"
                        name="payment_date"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select name="payment_method">
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transaction_id">Transaction ID</Label>
                      <Input
                        id="transaction_id"
                        name="transaction_id"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue="completed">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Additional notes (optional)"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Record Payment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {(payments as any[]).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No payment records found
                </TableCell>
              </TableRow>
            ) : (
              (payments as any[]).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.trainee?.full_name || "-"}</TableCell>
                  <TableCell className="font-semibold">₹{Number(payment.amount).toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{payment.payment_method || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "completed" || payment.status === "paid"
                          ? "default"
                          : payment.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
