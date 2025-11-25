import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectDetail {
  id: string;
  project_name: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  duration_value: number;
  duration_unit: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  employee_code: string;
  profiles: {
    full_name: string;
  };
}

const ProjectDetails = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDetail | null>(null);
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    assigned_to: "",
    assigned_by: "",
    duration_value: "",
    duration_unit: "Month",
    status: "Planning",
  });

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["roriri-project-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roriri_project_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectDetail[];
    },
  });

  // Fetch employees for dropdowns
  const { data: employees = [] } = useQuery({
    queryKey: ["it-company-employees"],
    queryFn: async () => {
      const itCompanyEntity = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_company")
        .single();

      if (itCompanyEntity.error) throw itCompanyEntity.error;

      const { data, error } = await supabase
        .from("employees")
        .select("id, employee_code, profiles(full_name)")
        .eq("entity_id", itCompanyEntity.data.id)
        .eq("status", "active");

      if (error) throw error;
      return data as Employee[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("roriri_project_details").insert([
        {
          project_name: data.project_name,
          description: data.description || null,
          assigned_to: data.assigned_to || null,
          assigned_by: data.assigned_by || null,
          duration_value: parseInt(data.duration_value),
          duration_unit: data.duration_unit,
          status: data.status,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roriri-project-details"] });
      toast.success("Project created successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from("roriri_project_details")
        .update({
          project_name: data.project_name,
          description: data.description || null,
          assigned_to: data.assigned_to || null,
          assigned_by: data.assigned_by || null,
          duration_value: parseInt(data.duration_value),
          duration_unit: data.duration_unit,
          status: data.status,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roriri-project-details"] });
      toast.success("Project updated successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("roriri_project_details").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roriri-project-details"] });
      toast.success("Project deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      project_name: "",
      description: "",
      assigned_to: "",
      assigned_by: "",
      duration_value: "",
      duration_unit: "Month",
      status: "Planning",
    });
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ ...formData, id: editingProject.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (project: ProjectDetail) => {
    setEditingProject(project);
    setFormData({
      project_name: project.project_name,
      description: project.description || "",
      assigned_to: project.assigned_to || "",
      assigned_by: project.assigned_by || "",
      duration_value: project.duration_value.toString(),
      duration_unit: project.duration_unit,
      status: project.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Planning: "outline",
      "In Progress": "default",
      Completed: "secondary",
      "On Hold": "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return "Not Assigned";
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.profiles?.full_name || "Unknown";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Details</h1>
          <p className="text-muted-foreground">Manage project assignments and tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                  >
                    <SelectTrigger id="assigned_to">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.profiles?.full_name || emp.employee_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assigned_by">Assigned By</Label>
                  <Select
                    value={formData.assigned_by}
                    onValueChange={(value) => setFormData({ ...formData, assigned_by: value })}
                  >
                    <SelectTrigger id="assigned_by">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.profiles?.full_name || emp.employee_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_value">Duration *</Label>
                  <Input
                    id="duration_value"
                    type="number"
                    min="1"
                    value={formData.duration_value}
                    onChange={(e) => setFormData({ ...formData, duration_value: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration_unit">Duration Unit *</Label>
                  <Select
                    value={formData.duration_unit}
                    onValueChange={(value) => setFormData({ ...formData, duration_unit: value })}
                  >
                    <SelectTrigger id="duration_unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Month">Month</SelectItem>
                      <SelectItem value="Week">Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProject ? "Update" : "Create"} Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No projects found. Click "Add Project" to create one.
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">S. No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Assigned To</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Assigned By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{project.project_name}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {project.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">{getEmployeeName(project.assigned_to)}</td>
                    <td className="px-4 py-3 text-sm">{getEmployeeName(project.assigned_by)}</td>
                    <td className="px-4 py-3 text-sm">
                      {project.duration_value} {project.duration_unit}
                      {project.duration_value > 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(project.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
