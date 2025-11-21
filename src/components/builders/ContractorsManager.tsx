import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, HardHat, Phone, Mail, Star } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const supabaseClient = supabase as any;

const ContractorsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [formData, setFormData] = useState({
    contractor_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
    pan_number: "",
    specialization: [],
    license_number: "",
    license_expiry: "",
    rating: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  // Fetch contractors
  const { data: contractors = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-contractors"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_contractors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create contractor mutation
  const createContractorMutation = useMutation<any, Error, any>({
    mutationFn: async (contractorData) => {
      const { data, error } = await supabaseClient
        .from("builders_contractors")
        .insert([contractorData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-contractors"] });
      toast.success("Contractor created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create contractor: " + error.message);
    },
  });

  // Update contractor mutation
  const updateContractorMutation = useMutation<any, Error, any>({
    mutationFn: async ({ id, ...contractorData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabaseClient
        .from("builders_contractors")
        .update(contractorData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-contractors"] });
      toast.success("Contractor updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update contractor: " + error.message);
    },
  });

  // Delete contractor mutation
  const deleteContractorMutation = useMutation<any, Error, any>({
    mutationFn: async (id) => {
      const { error } = await supabaseClient
        .from("builders_contractors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-contractors"] });
      toast.success("Contractor deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete contractor: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      contractor_name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      gst_number: "",
      pan_number: "",
      specialization: [],
      license_number: "",
      license_expiry: "",
      rating: "",
      status: "active"
    });
    setEditingContractor(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const contractorData = {
      ...formData,
      rating: formData.rating ? parseFloat(formData.rating) : null,
    };

    if (editingContractor) {
      updateContractorMutation.mutate({ id: editingContractor.id, ...contractorData });
    } else {
      createContractorMutation.mutate(contractorData);
    }
  };

  const handleEdit = (contractor) => {
    setEditingContractor(contractor);
    setFormData({
      contractor_name: contractor.contractor_name || "",
      contact_person: contractor.contact_person || "",
      email: contractor.email || "",
      phone: contractor.phone || "",
      address: contractor.address || "",
      gst_number: contractor.gst_number || "",
      pan_number: contractor.pan_number || "",
      specialization: contractor.specialization || [],
      license_number: contractor.license_number || "",
      license_expiry: contractor.license_expiry || "",
      rating: contractor.rating?.toString() || "",
      status: contractor.status || "active"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this contractor?")) {
      deleteContractorMutation.mutate(id);
    }
  };

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization]
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      blacklisted: { variant: "destructive", label: "Blacklisted" }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderRating = (rating) => {
    if (!rating) return "Not rated";
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{rating}/5</span>
      </div>
    );
  };

  const contractorColumns = [
    { key: "contractor_name", label: "Contractor Name" },
    { key: "contact_person", label: "Contact Person" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    {
      key: "specialization",
      label: "Specialization",
      render: (value) => value ? value.join(", ") : "N/A"
    },
    {
      key: "rating",
      label: "Rating",
      render: (value) => renderRating(value)
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value)
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
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

  const specializationOptions = [
    "civil", "electrical", "plumbing", "carpentry", "masonry", "painting", "flooring", "roofing"
  ];

  if (isLoading) {
    return <div>Loading contractors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contractors Management</h2>
          <p className="text-muted-foreground">Manage contractors and subcontractors</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contractor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContractor ? "Edit Contractor" : "Add New Contractor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractor_name">Contractor Name *</Label>
                  <Input
                    id="contractor_name"
                    value={formData.contractor_name}
                    onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
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
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input
                    id="pan_number"
                    value={formData.pan_number}
                    onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Specialization</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {specializationOptions.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialization.includes(spec)}
                        onChange={() => handleSpecializationChange(spec)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="license_expiry">License Expiry</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContractorMutation.isPending || updateContractorMutation.isPending}>
                  {editingContractor ? "Update" : "Create"} Contractor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Contractors"
        description="All contractors and subcontractors"
        columns={contractorColumns}
        data={contractors}
      />

      {/* Contractor Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.map((contractor) => (
          <Card key={contractor.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HardHat className="h-5 w-5" />
                  {contractor.contractor_name}
                </span>
                {getStatusBadge(contractor.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contractor.contact_person && (
                  <div className="text-sm text-muted-foreground">
                    Contact: {contractor.contact_person}
                  </div>
                )}
                {contractor.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {contractor.phone}
                  </div>
                )}
                {contractor.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {contractor.email}
                  </div>
                )}
                {contractor.specialization && contractor.specialization.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Specializations: {contractor.specialization.join(", ")}
                  </div>
                )}
                {contractor.rating && (
                  <div className="flex items-center gap-2">
                    {renderRating(contractor.rating)}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(contractor)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(contractor.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
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

export default ContractorsManager;
