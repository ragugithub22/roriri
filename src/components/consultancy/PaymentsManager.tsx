import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, DollarSign, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  client_id: string;
  invoice_number?: string;
  invoice_date: string;
  due_date?: string;
  invoice_amount: number;
  payment_status: string;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  consultancy_clients?: { company_name: string };
}

const PaymentsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    invoice_number: "",
    invoice_date: "",
    due_date: "",
    invoice_amount: 0,
    payment_status: "pending",
    payment_date: "",
    payment_method: "",
    transaction_id: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["consultancy-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_clients")
        .select("id, company_name")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["consultancy-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_payments")
        .select(`
          *,
          consultancy_clients (
            company_name
          )
        `)
        .order("invoice_date", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("consultancy_payments")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-payments"] });
      toast.success("Payment record created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create payment record: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("consultancy_payments")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-payments"] });
      toast.success("Payment record updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update payment record: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consultancy_payments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-payments"] });
      toast.success("Payment record deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete payment record: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      client_id: "",
      invoice_number: "",
      invoice_date: "",
      due_date: "",
      invoice_amount: 0,
      payment_status: "pending",
      payment_date: "",
      payment_method: "",
      transaction_id: "",
      notes: ""
    });
    setEditingPayment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayment) {
      updateMutation.mutate({ id: editingPayment.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      client_id: payment.client_id,
      invoice_number: payment.invoice_number || "",
      invoice_date: payment.invoice_date.split('T')[0],
      due_date: payment.due_date?.split('T')[0] || "",
      invoice_amount: payment.invoice_amount,
      payment_status: payment.payment_status,
      payment_date: payment.payment_date?.split('T')[0] || "",
      payment_method: payment.payment_method || "",
      transaction_id: payment.transaction_id || "",
      notes: payment.notes || ""
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "client_id",
      label: "Client",
      render: (_: any, row: Payment) => (
        <div>
          <div className="font-medium">{row.consultancy_clients?.company_name}</div>
        </div>
      )
    },
    {
      key: "invoice_number",
      label: "Invoice #",
      render: (value: string) => value || "N/A"
    },
    {
      key: "invoice_date",
      label: "Invoice Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "invoice_amount",
      label: "Amount",
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: "payment_status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "paid" ? "default" :
          value === "pending" ? "secondary" :
          value === "overdue" ? "destructive" : "outline"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "due_date",
      label: "Due Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Payment) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this payment record?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payments Management</h2>
          <p className="text-muted-foreground">Manage invoices, payments, and billing for clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? "Edit Payment Record" : "Add New Payment Record"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_id">Client *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="INV-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_date">Invoice Date *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_amount">Invoice Amount *</Label>
                  <Input
                    id="invoice_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.invoice_amount}
                    onChange={(e) => setFormData({ ...formData, invoice_amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="payment_status">Payment Status</Label>
                  <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.payment_status === "paid" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_date">Payment Date</Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="online">Online Payment</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="transaction_id">Transaction ID</Label>
                    <Input
                      id="transaction_id"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                      placeholder="Reference number or transaction ID"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional notes about the payment or invoice"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPayment ? "Update" : "Add"} Payment Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">Invoice records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{payments
                .filter(p => p.payment_status === "paid")
                .reduce((sum, p) => sum + p.invoice_amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.payment_status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Payments"
        description="Manage client invoices and payment tracking"
        columns={columns}
        data={payments}
        emptyMessage="No payment records found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default PaymentsManager;
