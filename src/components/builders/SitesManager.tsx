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
import { Plus, Edit, Trash2, MapPin, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const supabaseClient = supabase as any;

const SitesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    project_id: "",
    site_name: "",
    site_code: "",
    location: "",
    area: "",
    site_supervisor: "",
    start_date: "",
    completion_date: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  // Fetch sites with project info
  const { data: sites = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-sites"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_sites")
        .select(`
          *,
          builders_projects(project_name)
        `)
        .order("created_at", { ascending: false });
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

  // Create site mutation
  const createSiteMutation = useMutation<any, Error, any>({
    mutationFn: async (siteData: any) => {
      const { data, error } = await supabaseClient
        .from("builders_sites")
        .insert([siteData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-sites"] });
      toast.success("Site created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create site: " + error.message);
    },
  });

  // Update site mutation
  const updateSiteMutation = useMutation<any, Error, any>({
    mutationFn: async ({ id, ...siteData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabaseClient
        .from("builders_sites")
        .update(siteData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-sites"] });
      toast.success("Site updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update site: " + error.message);
    },
  });

  // Delete site mutation
  const deleteSiteMutation = useMutation<any, Error, any>({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("builders_sites")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-sites"] });
      toast.success("Site deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete site: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      project_id: "",
      site_name: "",
      site_code: "",
      location: "",
      area: "",
      site_supervisor: "",
      start_date: "",
      completion_date: "",
      status: "active"
    });
    setEditingSite(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const siteData = {
      ...formData,
      area: formData.area ? parseFloat(formData.area) : null,
    };

    if (editingSite) {
      updateSiteMutation.mutate({ id: editingSite.id, ...siteData });
    } else {
      createSiteMutation.mutate(siteData);
    }
  };

  const handleEdit = (site) => {
    setEditingSite(site);
    setFormData({
      project_id: site.project_id || "",
      site_name: site.site_name || "",
      site_code: site.site_code || "",
      location: site.location || "",
      area: site.area?.toString() || "",
      site_supervisor: site.site_supervisor || "",
      start_date: site.start_date || "",
      completion_date: site.completion_date || "",
      status: site.status || "active"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this site?")) {
      deleteSiteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "default", label: "Active" },
      completed: { variant: "secondary", label: "Completed" },
      inactive: { variant: "destructive", label: "Inactive" }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const siteColumns = [
    { key: "site_name", label: "Site Name" },
    { key: "site_code", label: "Site Code" },
    {
      key: "project_name",
      label: "Project",
      render: (_, row) => row.builders_projects?.project_name || "N/A"
    },
    { key: "location", label: "Location" },
    {
      key: "area",
      label: "Area (sq ft)",
      render: (value) => value ? `${value.toLocaleString()}` : "N/A"
    },
    { key: "site_supervisor", label: "Supervisor" },
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

  if (isLoading) {
    return <div>Loading sites...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sites Management</h2>
          <p className="text-muted-foreground">Manage construction sites and their details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSite ? "Edit Site" : "Add New Site"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_id">Project *</Label>
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
                <div>
                  <Label htmlFor="site_name">Site Name *</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="site_code">Site Code</Label>
                  <Input
                    id="site_code"
                    value={formData.site_code}
                    onChange={(e) => setFormData({ ...formData, site_code: e.target.value })}
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="site_supervisor">Site Supervisor</Label>
                  <Input
                    id="site_supervisor"
                    value={formData.site_supervisor}
                    onChange={(e) => setFormData({ ...formData, site_supervisor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSiteMutation.isPending || updateSiteMutation.isPending}>
                  {editingSite ? "Update" : "Create"} Site
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Construction Sites"
        description="All construction sites and their current status"
        columns={siteColumns}
        data={sites}
      />

      {/* Site Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Card key={site.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {site.site_name}
                </span>
                {getStatusBadge(site.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {site.builders_projects?.project_name || "No Project"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {site.location}
                </div>
                {site.site_supervisor && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {site.site_supervisor}
                  </div>
                )}
                {site.area && (
                  <div className="text-sm text-muted-foreground">
                    Area: {site.area.toLocaleString()} sq ft
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(site)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(site.id)}>
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

export default SitesManager;
