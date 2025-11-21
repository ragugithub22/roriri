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
import { Plus, Edit, Trash2, Users, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const supabaseClient = supabase as any;

const LabourManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabour, setEditingLabour] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    skill: "",
    daily_wage: "",
    site_id: "",
    join_date: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  // Fetch labour with site info
  const { data: labour = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-labour"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_labour")
        .select(`
          *,
          builders_sites(site_name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch sites for dropdown
  const { data: sites = [] } = useQuery<any[]>({
    queryKey: ["builders-sites-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_sites")
        .select("id, site_name")
        .eq("status", "active")
        .order("site_name");
      if (error) throw error;
      return data;
    },
  });

  // Create labour mutation
  const createLabourMutation = useMutation<any, Error, any>({
    mutationFn: async (labourData: any) => {
      const { data, error } = await supabaseClient
        .from("builders_labour")
        .insert([labourData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-labour"] });
      toast.success("Labour added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add labour: " + error.message);
    },
  });

  // Update labour mutation
  const updateLabourMutation = useMutation<any, Error, any>({
    mutationFn: async ({ id, ...labourData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabaseClient
        .from("builders_labour")
        .update(labourData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-labour"] });
      toast.success("Labour updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update labour: " + error.message);
    },
  });

  // Delete labour mutation
  const deleteLabourMutation = useMutation<any, Error, any>({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("builders_labour")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-labour"] });
      toast.success("Labour removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove labour: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      skill: "",
      daily_wage: "",
      site_id: "",
      join_date: "",
      status: "active"
    });
    setEditingLabour(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const labourData = {
      ...formData,
      daily_wage: formData.daily_wage ? parseFloat(formData.daily_wage) : null,
    };

    if (editingLabour) {
      updateLabourMutation.mutate({ id: editingLabour.id, ...labourData });
    } else {
      createLabourMutation.mutate(labourData);
    }
  };

  const handleEdit = (labour) => {
    setEditingLabour(labour);
    setFormData({
      name: labour.name || "",
      phone: labour.phone || "",
      address: labour.address || "",
      skill: labour.skill || "",
      daily_wage: labour.daily_wage?.toString() || "",
      site_id: labour.site_id || "",
      join_date: labour.join_date || "",
      status: labour.status || "active"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this labour?")) {
      deleteLabourMutation.mutate(id);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      terminated: { variant: "destructive", label: "Terminated" }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const labourColumns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "skill", label: "Skill" },
    {
      key: "daily_wage",
      label: "Daily Wage",
      render: (value) => value ? `₹${value}` : "N/A"
    },
    {
      key: "site_name",
      label: "Site",
      render: (_, row) => row.builders_sites?.site_name || "Not assigned"
    },
    {
      key: "join_date",
      label: "Join Date",
      render: (value) => value ? new Date(value).toLocaleDateString() : "N/A"
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

  const skillOptions = [
    "mason", "carpenter", "electrician", "plumber", "painter", "laborer", "welder", "tile_worker", "helper"
  ];

  if (isLoading) {
    return <div>Loading labour...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Labour Management</h2>
          <p className="text-muted-foreground">Manage construction workers and their assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Labour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLabour ? "Edit Labour" : "Add New Labour"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
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
                <div>
                  <Label htmlFor="skill">Skill *</Label>
                  <Select value={formData.skill} onValueChange={(value) => setFormData({ ...formData, skill: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill.charAt(0).toUpperCase() + skill.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="daily_wage">Daily Wage (₹)</Label>
                  <Input
                    id="daily_wage"
                    type="number"
                    value={formData.daily_wage}
                    onChange={(e) => setFormData({ ...formData, daily_wage: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site_id">Assigned Site</Label>
                  <Select value={formData.site_id} onValueChange={(value) => setFormData({ ...formData, site_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.site_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="join_date">Join Date</Label>
                  <Input
                    id="join_date"
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                  />
                </div>
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
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLabourMutation.isPending || updateLabourMutation.isPending}>
                  {editingLabour ? "Update" : "Add"} Labour
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Labour Details"
        description="All construction workers and their assignments"
        columns={labourColumns}
        data={labour}
      />

      {/* Labour Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labour.map((worker) => (
          <Card key={worker.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {worker.name}
                </span>
                {getStatusBadge(worker.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {worker.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {worker.phone}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Skill: {worker.skill ? worker.skill.charAt(0).toUpperCase() + worker.skill.slice(1) : "Not specified"}
                </div>
                {worker.daily_wage && (
                  <div className="text-sm text-muted-foreground">
                    Daily Wage: ₹{worker.daily_wage}
                  </div>
                )}
                {worker.builders_sites?.site_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {worker.builders_sites.site_name}
                  </div>
                )}
                {worker.join_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined: {new Date(worker.join_date).toLocaleDateString()}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(worker)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(worker.id)}>
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

export default LabourManager;
