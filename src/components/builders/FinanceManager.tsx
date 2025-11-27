// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const supabaseClient = supabase as any;

const FinanceManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    transaction_date: "",
    transaction_type: "",
    amount: "",
    description: "",
    category: "",
    payment_method: "",
    reference_number: "",
    project_id: "",
    status: "pending"
  });

  const queryClient = useQueryClient();

  // Fetch financial transactions
  const { data: transactions = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_financial_transactions")
        .select(`
          *,
          builders_projects(project_name)
        `)
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["builders-projects-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_projects")
        .select("id, project_name")
        .order("project_name");
      if (error) throw error;
      return data;
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation<any, Error, any>({
    mutationFn: async (transactionData: any) => {
      const { data, error } = await supabaseClient
        .from("builders_financial_transactions")
        .insert([transactionData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-financial-transactions"] });
      toast.success("Transaction added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add transaction: " + error.message);
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation<any, Error, any>({
    mutationFn: async ({ id, ...transactionData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabaseClient
        .from("builders_financial_transactions")
        .update(transactionData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-financial-transactions"] });
      toast.success("Transaction updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update transaction: " + error.message);
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation<any, Error, any>({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("builders_financial_transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-financial-transactions"] });
      toast.success("Transaction removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove transaction: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      transaction_date: "",
      transaction_type: "",
      amount: "",
      description: "",
      category: "",
      payment_method: "",
      reference_number: "",
      project_id: "",
      status: "pending"
    });
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
    };

    if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, ...transactionData });
    } else {
      createTransactionMutation.mutate(transactionData);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      transaction_date: transaction.transaction_date || "",
      transaction_type: transaction.transaction_type || "",
      amount: transaction.amount?.toString() || "",
      description: transaction.description || "",
      category: transaction.category || "",
      payment_method: transaction.payment_method || "",
      reference_number: transaction.reference_number || "",
      project_id: transaction.project_id || "",
      status: transaction.status || "pending"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this transaction?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      failed: { variant: "destructive", label: "Failed" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === "income" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const transactionColumns = [
    {
      key: "transaction_date",
      label: "Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
    {
      key: "transaction_type",
      label: "Type",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getTransactionTypeIcon(value)}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => value ? `₹${value.toLocaleString()}` : "N/A"
    },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    {
      key: "project_name",
      label: "Project",
      render: (_: any, row: any) => row.builders_projects?.project_name || "Not assigned"
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const transactionTypeOptions = ["income", "expense"];
  const categoryOptions = [
    "salary", "materials", "equipment", "transportation", "utilities", "rent", "insurance",
    "marketing", "legal_fees", "consultation", "maintenance", "other"
  ];
  const paymentMethodOptions = [
    "cash", "bank_transfer", "cheque", "credit_card", "debit_card", "upi", "online"
  ];

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.transaction_type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.transaction_type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netProfit = totalIncome - totalExpenses;

  if (isLoading) {
    return <div>Loading financial transactions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Management</h2>
          <p className="text-muted-foreground">Manage financial transactions and budgets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transaction_date">Transaction Date *</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transaction_type">Transaction Type *</Label>
                  <Select value={formData.transaction_type} onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="project_id">Associated Project</Label>
                  <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTransactionMutation.isPending || updateTransactionMutation.isPending}>
                  {editingTransaction ? "Update" : "Add"} Transaction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Financial Transactions"
        description="All financial transactions and their details"
        columns={transactionColumns}
        data={transactions}
      />

      {/* Transaction Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactions.map((transaction: any) => (
          <Card key={transaction.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getTransactionTypeIcon(transaction.transaction_type)}
                  {transaction.transaction_type === "income" ? "Income" : "Expense"}
                </span>
                {getStatusBadge(transaction.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : "N/A"}
                </div>
                <div className="text-lg font-semibold">
                  ₹{transaction.amount?.toLocaleString() || "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {transaction.description}
                </div>
                <div className="text-sm text-muted-foreground">
                  Category: {transaction.category ? transaction.category.replace("_", " ").toUpperCase() : "Not specified"}
                </div>
                {transaction.builders_projects?.project_name && (
                  <div className="text-sm text-muted-foreground">
                    Project: {transaction.builders_projects.project_name}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(transaction.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FinanceManager;
