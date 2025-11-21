import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function PaymentsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["tours-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_payments")
        .select(`
          *,
          tours_bookings!inner(booking_code, tours_customers!inner(full_name))
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["tours-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_bookings")
        .select("id, booking_code, tours_customers!inner(full_name)")
        .order("booking_code");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      if (editingPayment) {
        const { error } = await supabase
          .from("tours_payments")
          .update(paymentData)
          .eq("id", editingPayment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tours_payments")
          .insert(paymentData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingPayment ? "Payment updated" : "Payment recorded");
      queryClient.invalidateQueries({ queryKey: ["tours-payments"] });
      setIsOpen(false);
      setEditingPayment(null);
    },
    onError: () => {
      toast.error("Failed to save payment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours_payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-payments"] });
    },
    onError: () => {
      toast.error("Failed to delete payment");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const paymentData = {
      booking_id: formData.get("booking_id"),
      payment_date: formData.get("payment_date"),
      amount: parseFloat(formData.get("amount") as string),
      payment_method: formData.get("payment_method"),
      payment_for: formData.get("payment_for"),
      transaction_id: formData.get("transaction_id"),
      payment_status: formData.get("payment_status"),
      received_by: formData.get("received_by"),
      notes: formData.get("notes"),
    };
    saveMutation.mutate(paymentData);
  };

  const columns = [
    {
      key: "booking",
      label: "Booking",
      render: (value: any, row: any) => row.tours_bookings?.booking_code || "-"
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: any, row: any) => row.tours_bookings?.tours_customers?.full_name || "-"
    },
    {
      key: "payment_date",
      label: "Payment Date",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: any) => `₹${value?.toLocaleString()}`
    },
    {
      key: "payment_method",
      label: "Method",
      render: (value: any) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "payment_for",
      label: "Purpose",
      render: (value: any) => (
        <Badge variant={value === 'refund' ? 'destructive' : 'default'}>
          {value}
        </Badge>
      )
    },
    {
      key: "payment_status",
      label: "Status",
      render: (value: any) => (
        <Badge variant={value === 'completed' ? 'default' : value === 'pending' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingPayment(row);
              setIsOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payments Management</CardTitle>
            <CardDescription>Track and manage all tour-related payments</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPayment(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPayment ? "Edit" : "Record"} Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="booking_id">Booking</Label>
                    <Select name="booking_id" defaultValue={editingPayment?.booking_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookings.map((booking: any) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.booking_code} - {booking.tours_customers?.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <Input
                      id="payment_date"
                      name="payment_date"
                      type="date"
                      defaultValue={editingPayment?.payment_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingPayment?.amount}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select name="payment_method" defaultValue={editingPayment?.payment_method || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_for">Payment For</Label>
                    <Select name="payment_for" defaultValue={editingPayment?.payment_for || "booking"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Booking</SelectItem>
                        <SelectItem value="advance">Advance</SelectItem>
                        <SelectItem value="balance">Balance</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="extra">Extra Charges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select name="payment_status" defaultValue={editingPayment?.payment_status || "completed"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transaction_id">Transaction ID</Label>
                    <Input
                      id="transaction_id"
                      name="transaction_id"
                      defaultValue={editingPayment?.transaction_id}
                    />
                  </div>
                  <div>
                    <Label htmlFor="received_by">Received By</Label>
                    <Input
                      id="received_by"
                      name="received_by"
                      defaultValue={editingPayment?.received_by}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    defaultValue={editingPayment?.notes}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingPayment ? "Update" : "Record"} Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Payments"
          description="Track all payments and transactions"
          columns={columns}
          data={payments}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
