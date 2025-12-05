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
import { Plus, Edit, Trash2, Users, Clock, Award, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface Volunteer {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  skills?: string;
  availability?: string;
  status: string;
  created_at: string;
}

const VolunteersManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    skills: "",
    availability: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("volunteers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data || []) as any;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from("volunteers")
        .insert([{
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          skills: data.skills,
          availability: data.availability,
          status: data.status
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast.success("Volunteer added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add volunteer: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any)
        .from("volunteers")
        .update({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          skills: data.skills,
          availability: data.availability,
          status: data.status
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast.success("Volunteer updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update volunteer: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("volunteers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast.success("Volunteer deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete volunteer: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      skills: "",
      availability: "",
      status: "active"
    });
    setEditingVolunteer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVolunteer) {
      updateMutation.mutate({ id: editingVolunteer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      full_name: volunteer.full_name,
      email: volunteer.email || "",
      phone: volunteer.phone || "",
      skills: volunteer.skills || "",
      availability: volunteer.availability || "",
      status: volunteer.status
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: "full_name", label: "Name" },
    {
      key: "email",
      label: "Email",
      render: (value: string) => value || "N/A"
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: string) => value || "N/A"
    },
    {
      key: "skills",
      label: "Skills",
      render: (value: string) => value || "N/A"
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
      render: (_: any, row: Volunteer) => (
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
              if (confirm("Are you sure you want to delete this volunteer?")) {
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

  const activeVolunteers = volunteers.filter((v: any) => v.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Volunteers Management</h2>
          <p className="text-muted-foreground">Manage volunteer registrations and track their contributions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVolunteer ? "Edit Volunteer" : "Add New Volunteer"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              </div>

              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., Teaching, Medical, Technical"
                />
              </div>

              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="e.g., Weekends, Evenings"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingVolunteer ? "Update" : "Add"} Volunteer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteers.length}</div>
            <p className="text-xs text-muted-foreground">Registered volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVolunteers.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Hours contributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Years of experience</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Volunteers"
        description="Manage volunteer information and track their activities"
        columns={columns}
        data={volunteers}
        emptyMessage="No volunteers found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default VolunteersManager;