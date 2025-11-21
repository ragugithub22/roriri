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
import { Plus, Edit, Trash2, Building2, MapPin, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const supabaseClient = supabase as any;

const ProjectsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    project_name: "",
    project_code: "",
    project_type: "",
    location: "",
    city: "",
    state: "",
    pincode: "",
    total_area: "",
    built_up_area: "",
    estimated_cost: "",
    actual_cost: "",
    start_date: "",
    completion_date: "",
    expected_completion_date: "",
    status: "planning",
    project_manager: "",
    description: ""
  });

  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-projects"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation<any, Error, any>({
    mutationFn: async (projectData) => {
      const { data, error } = await supabaseClient
        .from("builders_projects")
        .insert([projectData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-projects"] });
      toast.success("Project created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create project: " + error.message);
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation<any, Error, any>({
    mutationFn: async ({ id, ...projectData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabaseClient
        .from("builders_projects")
        .update(projectData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-projects"] });
      toast.success("Project updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update project: " + error.message);
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation<any, Error, any>({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("builders_projects")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-projects"] });
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete project: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      project_name: "",
      project_code: "",
      project_type: "",
      location: "",
      city: "",
      state: "",
      pincode: "",
      total_area: "",
      built_up_area: "",
      estimated_cost: "",
      actual_cost: "",
      start_date: "",
      completion_date: "",
      expected_completion_date: "",
      status: "planning",
      project_manager: "",
      description: ""
    });
    setEditingProject(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      total_area: formData.total_area ? parseFloat(formData.total_area) : null,
      built_up_area: formData.built_up_area ? parseFloat(formData.built_up_area) : null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, ...projectData });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      project_name: project.project_name || "",
      project_code: project.project_code || "",
      project_type: project.project_type || "",
      location: project.location || "",
      city: project.city || "",
      state: project.state || "",
      pincode: project.pincode || "",
      total_area: project.total_area?.toString() || "",
      built_up_area: project.built_up_area?.toString() || "",
      estimated_cost: project.estimated_cost?.toString() || "",
      actual_cost: project.actual_cost?.toString() || "",
      start_date: project.start_date || "",
      completion_date: project.completion_date || "",
      expected_completion_date: project.expected_completion_date || "",
      status: project.status || "planning",
      project_manager: project.project_manager || "",
      description: project.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      planning: { variant: "secondary", label: "Planning" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "default", label: "Completed" },
      on_hold: { variant: "destructive", label: "On Hold" },
      cancelled: { variant: "destructive", label: "Cancelled" }
    };
    const config = statusConfig[status] || statusConfig.planning;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const projectColumns = [
    { key: "project_name", label: "Project Name" },
    { key: "project_code", label: "Code" },
    { key: "project_type", label: "Type" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status", render: (value) => getStatusBadge(value) },
    { key: "project_manager", label: "Manager" },
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
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Projects Management</h2>
          <p className="text-muted-foreground">Manage construction projects and their details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_name">Project Name *</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project_code">Project Code</Label>
                  <Input
                    id="project_code"
                    value={formData.project_code}
                    onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="project_type">Project Type *</Label>
                  <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
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
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_area">Total Area (sq ft)</Label>
                  <Input
                    id="total_area"
                    type="number"
                    value={formData.total_area}
                    onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="built_up_area">Built-up Area (sq ft)</Label>
                  <Input
                    id="built_up_area"
                    type="number"
                    value={formData.built_up_area}
                    onChange={(e) => setFormData({ ...formData, built_up_area: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_cost">Estimated Cost (₹)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="actual_cost">Actual Cost (₹)</Label>
                  <Input
                    id="actual_cost"
                    type="number"
                    value={formData.actual_cost}
                    onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="expected_completion_date">Expected Completion</Label>
                  <Input
                    id="expected_completion_date"
                    type="date"
                    value={formData.expected_completion_date}
                    onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="completion_date">Actual Completion</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="project_manager">Project Manager</Label>
                <Input
                  id="project_manager"
                  value={formData.project_manager}
                  onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProjectMutation.isPending || updateProjectMutation.isPending}>
                  {editingProject ? "Update" : "Create"} Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Construction Projects"
        description="All construction projects and their current status"
        columns={projectColumns}
        data={projects}
      />

      {/* Project Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {project.project_name}
                </span>
                {getStatusBadge(project.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                </div>
                {project.estimated_cost && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    ₹{project.estimated_cost.toLocaleString()}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)}>
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

export default ProjectsManager;
