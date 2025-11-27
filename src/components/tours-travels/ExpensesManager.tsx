// @ts-nocheck
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, DollarSign, Receipt } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function ExpensesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["tours-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      if (editingExpense) {
        const { error } = await supabase
          .from("tours_expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tours_expenses")
          .insert(expenseData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingExpense ? "Expense updated" : "Expense recorded");
      queryClient.invalidateQueries({ queryKey: ["tours-expenses"] });
      setIsOpen(false);
      setEditingExpense(null);
    },
    onError: () => {
      toast.error("Failed to save expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Expense deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-expenses"] });
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const expenseData = {
      expense_date: formData.get("expense_date"),
      category: formData.get("category"),
      description: formData.get("description"),
      amount: parseFloat(formData.get("amount") as string),
      payment_method: formData.get("payment_method"),
      vendor_supplier: formData.get("vendor_supplier"),
      bill_receipt_number: formData.get("bill_receipt_number"),
      trip_booking_id: formData.get("trip_booking_id") || null,
      approved_by: formData.get("approved_by"),
      status: formData.get("status"),
      notes: formData.get("notes"),
    };
    saveMutation.mutate(expenseData);
  };

  const columns = [
    {
      key: "expense_date",
      label: "Date",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (value: any) => `₹${value?.toLocaleString()}`
    },
    {
      key: "payment_method",
      label: "Payment Method",
      render: (value: any) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => (
        <Badge variant={value === 'approved' ? 'default' : value === 'pending' ? 'secondary' : 'outline'}>
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
              setEditingExpense(row);
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
            <CardTitle>Expenses Management</CardTitle>
            <CardDescription>Track and manage all tour-related expenses</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingExpense(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Edit" : "Add"} Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expense_date">Expense Date</Label>
                    <Input
                      id="expense_date"
                      name="expense_date"
                      type="date"
                      defaultValue={editingExpense?.expense_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={editingExpense?.category || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fuel">Fuel</SelectItem>
                        <SelectItem value="maintenance">Vehicle Maintenance</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="food">Food & Beverages</SelectItem>
                        <SelectItem value="guide">Guide Fees</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="office">Office Expenses</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="permits">Permits & Licenses</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingExpense?.description}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingExpense?.amount}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select name="payment_method" defaultValue={editingExpense?.payment_method || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor_supplier">Vendor/Supplier</Label>
                    <Input
                      id="vendor_supplier"
                      name="vendor_supplier"
                      defaultValue={editingExpense?.vendor_supplier}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bill_receipt_number">Bill/Receipt Number</Label>
                    <Input
                      id="bill_receipt_number"
                      name="bill_receipt_number"
                      defaultValue={editingExpense?.bill_receipt_number}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trip_booking_id">Related Trip/Booking ID</Label>
                    <Input
                      id="trip_booking_id"
                      name="trip_booking_id"
                      defaultValue={editingExpense?.trip_booking_id}
                      placeholder="Optional reference"
                    />
                  </div>
                  <div>
                    <Label htmlFor="approved_by">Approved By</Label>
                    <Input
                      id="approved_by"
                      name="approved_by"
                      defaultValue={editingExpense?.approved_by}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingExpense?.status || "pending"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      defaultValue={editingExpense?.notes}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingExpense ? "Update" : "Record"} Expense
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Expenses"
          description="Track all business expenses"
          columns={columns}
          data={expenses}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
