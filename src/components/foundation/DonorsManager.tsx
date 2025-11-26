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
import { Plus, Edit, Trash2, Users, DollarSign, Phone, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Donor {
  id: string;
  donor_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  donor_type: string;
  total_donations: number;
  last_donation_date?: string;
  status: string;
  created_at: string;
}

const DonorsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [formData, setFormData] = useState({
    donor_code: "",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    donor_type: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  const { data: donors = [], isLoading } = useQuery({
    queryKey: ["foundation-donors"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("foundation_donors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from("foundation_donors")
        .insert([{
          ...data,
          total_donations: 0
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foundation-donors"] });
      toast.success("Donor added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add donor: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any)
        .from("foundation_donors")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foundation-donors"] });
      toast.success("Donor updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update donor: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("foundation_donors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foundation-donors"] });
      toast.success("Donor deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete donor: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      donor_code: "",
      full_name: "",
      email: "",
      phone: "",
      address: "",
      donor_type: "",
      status: "active"
    });
    setEditingDonor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDonor) {
      updateMutation.mutate({ id: editingDonor.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (donor: Donor) => {
    setEditingDonor(donor);
    setFormData({
      donor_code: donor.donor_code,
      full_name: donor.full_name,
      email: donor.email || "",
      phone: donor.phone || "",
      address: donor.address || "",
      donor_type: donor.donor_type,
      status: donor.status
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: "donor_code", label: "Donor Code" },
    { key: "full_name", label: "Name" },
    {
      key: "donor_type",
      label: "Type",
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "total_donations",
      label: "Total Donations",
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: "last_donation_date",
      label: "Last Donation",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "Never"
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Donor) => (
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
              if (confirm("Are you sure you want to delete this donor?")) {
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

  const activeDonors = donors.filter(d => d.status === "active");
  const totalDonations = donors.reduce((sum, d) => sum + (d.total_donations || 0), 0);
  const avgDonation = activeDonors.length > 0
    ? Math.round(totalDonations / activeDonors.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Donors Management</h2>
          <p className="text-muted-foreground">Manage donor information and track their contributions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDonor ? "Edit Donor" : "Add New Donor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="donor_code">Donor Code *</Label>
                  <Input
                    id="donor_code"
                    value={formData.donor_code}
                    onChange={(e) => setFormData({ ...formData, donor_code: e.target.value })}
                    required
                    placeholder="DON-001"
                  />
                </div>
                <div>
                  <Label htmlFor="donor_type">Donor Type *</Label>
                  <Select value={formData.donor_type} onValueChange={(value) => setFormData({ ...formData, donor_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select donor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingDonor ? "Update" : "Add"} Donor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donors.length}</div>
            <p className="text-xs text-muted-foreground">Registered donors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDonors.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalDonations / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Funds raised</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Donation</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgDonation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per active donor</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Donors"
        description="Manage donor information and track their contribution history"
        columns={columns}
        data={donors}
        emptyMessage="No donors found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default DonorsManager;
