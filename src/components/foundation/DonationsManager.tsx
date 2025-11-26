import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, DollarSign, Calendar, Receipt, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Donation {
  id: string;
  donor_id?: string;
  donor_name?: string;
  amount: number;
  donation_date: string;
  payment_method: string;
  purpose?: string;
  receipt_number?: string;
  status: string;
  notes?: string;
  created_at: string;
}

const DonationsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [formData, setFormData] = useState({
    donor_id: "",
    amount: "",
    donation_date: "",
    payment_method: "",
    purpose: "",
    receipt_number: "",
    status: "received",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("donations")
        .select(`
          *,
          foundation_donors!donations_donor_id_fkey(full_name)
        `)
        .eq("entity_code", "foundation")
        .order("donation_date", { ascending: false });
      if (error) throw error;
      return ((data || []).map((donation: any) => ({
        ...donation,
        donor_name: donation.foundation_donors?.full_name || "Anonymous"
      }))) as any;
    },
  });

  const { data: donors = [] } = useQuery({
    queryKey: ["foundation-donors"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("foundation_donors")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return (data || []) as any;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("donations")
        .insert([{
          ...data,
          amount: parseFloat(data.amount),
          entity_code: "foundation"
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["foundation-donors"] });
      toast.success("Donation recorded successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to record donation: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("donations")
        .update({
          ...data,
          amount: parseFloat(data.amount)
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["foundation-donors"] });
      toast.success("Donation updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update donation: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("donations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["foundation-donors"] });
      toast.success("Donation deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete donation: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      donor_id: "",
      amount: "",
      donation_date: "",
      payment_method: "",
      purpose: "",
      receipt_number: "",
      status: "received",
      notes: ""
    });
    setEditingDonation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDonation) {
      updateMutation.mutate({ id: editingDonation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({
      donor_id: donation.donor_id || "",
      amount: donation.amount.toString(),
      donation_date: donation.donation_date,
      payment_method: donation.payment_method,
      purpose: donation.purpose || "",
      receipt_number: donation.receipt_number || "",
      status: donation.status,
      notes: donation.notes || ""
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "donor_name",
      label: "Donor",
      render: (value: string) => value || "Anonymous"
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: "donation_date",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "payment_method",
      label: "Payment Method",
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (value: string) => value || "General"
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "received" ? "default" :
          value === "pending" ? "secondary" :
          value === "cancelled" ? "destructive" :
          "outline"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Donation) => (
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
              if (confirm("Are you sure you want to delete this donation?")) {
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

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const thisMonthDonations = donations.filter(d =>
    new Date(d.donation_date).getMonth() === new Date().getMonth() &&
    new Date(d.donation_date).getFullYear() === new Date().getFullYear()
  ).reduce((sum, d) => sum + d.amount, 0);
  const receivedDonations = donations.filter(d => d.status === "received").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Donations Management</h2>
          <p className="text-muted-foreground">Record and track all foundation donations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Record Donation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDonation ? "Edit Donation" : "Record New Donation"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donor_id">Donor</Label>
                  <Select value={formData.donor_id} onValueChange={(value) => setFormData({ ...formData, donor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select donor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Anonymous</SelectItem>
                      {donors.map((donor) => (
                        <SelectItem key={donor.id} value={donor.id}>
                          {donor.full_name}
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
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donation_date">Donation Date *</Label>
                  <Input
                    id="donation_date"
                    type="date"
                    value={formData.donation_date}
                    onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g., Education, Medical, General"
                  />
                </div>
                <div>
                  <Label htmlFor="receipt_number">Receipt Number</Label>
                  <Input
                    id="receipt_number"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                    placeholder="Auto-generated or manual"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingDonation ? "Update" : "Record"} Donation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donations.length}</div>
            <p className="text-xs text-muted-foreground">All donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalDonations / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Funds received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(thisMonthDonations / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedDonations}</div>
            <p className="text-xs text-muted-foreground">Confirmed donations</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Donations"
        description="Track all foundation donations and their details"
        columns={columns}
        data={donations}
        emptyMessage="No donations found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default DonationsManager;
