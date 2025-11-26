import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface HostelPayment {
  id: string;
  payment_date: string;
  total_amount: number;
  received_amount: number;
  pending_amount: number;
  received_by: string | null;
  payment_mode: string | null;
}

interface HostelResidentDetailProps {
  residentId?: string;
  residentType?: string;
  onBack?: () => void;
}

export default function HostelResidentDetail({ residentId, residentType, onBack }: HostelResidentDetailProps) {
  const { id: paramId, type: paramType } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const id = residentId || paramId;
  const type = residentType || paramType;

  // Fetch resident details
  const { data: resident, isLoading: residentLoading } = useQuery({
    queryKey: ["hostel-resident", id, type],
    queryFn: async () => {
      if (type === "employee") {
        const { data, error } = await supabase
          .from("employees")
          .select(`
            *,
            profiles:profile_id (
              full_name,
              email,
              phone
            ),
            entities:entity_id (
              name
            )
          `)
          .eq("id", id)
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        return data;
      }
    },
  });

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["hostel-payments", id, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hostel_payments")
        .select("*")
        .eq("resident_id", id)
        .eq("resident_type", type || "employee")
        .order("payment_date", { ascending: false });
      
      if (error) throw error;
      return data as HostelPayment[];
    },
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const paymentData = {
        resident_id: id!,
        resident_type: type!,
        payment_date: formData.get("payment_date") as string,
        total_amount: parseFloat(formData.get("total_amount") as string),
        received_amount: parseFloat(formData.get("received_amount") as string),
        pending_amount: parseFloat(formData.get("total_amount") as string) - parseFloat(formData.get("received_amount") as string),
        received_by: formData.get("received_by") as string,
        payment_mode: formData.get("payment_mode") as string,
      };

      const { error } = await supabase
        .from("hostel_payments")
        .insert(paymentData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-payments"] });
      setIsPaymentDialogOpen(false);
      toast.success("Payment added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add payment: ${error.message}`);
    },
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("hostel_payments")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-payments"] });
      toast.success("Payment deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete payment: ${error.message}`);
    },
  });

  const handleSubmitPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPaymentMutation.mutate(formData);
  };

  if (residentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const residentName = type === "employee" 
    ? (resident as any)?.profiles?.full_name 
    : resident?.full_name;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack || (() => navigate(-1))}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Hostel Resident Details</h1>
          </div>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment</DialogTitle>
                <DialogDescription>Record a new hostel payment</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    name="payment_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    name="total_amount"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="received_amount">Received Amount</Label>
                  <Input
                    id="received_amount"
                    name="received_amount"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="received_by">Received By</Label>
                  <Input
                    id="received_by"
                    name="received_by"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_mode">Payment Mode</Label>
                  <Select name="payment_mode" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={addPaymentMutation.isPending}>
                  {addPaymentMutation.isPending ? "Adding..." : "Add Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-8 px-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{residentName}</CardTitle>
            <CardDescription>
              Type: {type === "employee" ? "Employee" : "Trainee"} • 
              {type === "employee" && ` Entity: ${(resident as any)?.entities?.name}`}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All hostel payments for this resident</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading payments...</p>
            ) : payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payment records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S. No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Received Amount</TableHead>
                    <TableHead>Pending Amount</TableHead>
                    <TableHead>Received By</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow key={payment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell>₹{payment.total_amount.toFixed(2)}</TableCell>
                      <TableCell>₹{payment.received_amount.toFixed(2)}</TableCell>
                      <TableCell>₹{payment.pending_amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.received_by || "-"}</TableCell>
                      <TableCell className="capitalize">{payment.payment_mode?.replace('_', ' ') || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePaymentMutation.mutate(payment.id)}
                          disabled={deletePaymentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
