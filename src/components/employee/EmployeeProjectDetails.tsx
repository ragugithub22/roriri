import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Clock, User, Calendar } from "lucide-react";

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

interface EmployeeProjectDetailsProps {
  employeeId: string;
}

export default function EmployeeProjectDetails({ employeeId }: EmployeeProjectDetailsProps) {
  // Fetch projects assigned to this employee
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["employee-projects", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roriri_project_details")
        .select("*")
        .eq("assigned_to", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectDetail[];
    },
    enabled: !!employeeId,
  });

  // Fetch employees for displaying names
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, employee_code, profiles(full_name)");

      if (error) throw error;
      return data;
    },
  });

  const getEmployeeName = (empId: string | null) => {
    if (!empId) return "Not Assigned";
    const employee = employees.find((e: any) => e.id === empId);
    return employee?.profiles?.full_name || "Unknown";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "On Hold":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading your projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Projects Assigned</h3>
          <p className="text-muted-foreground text-center">
            You don't have any projects assigned to you yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {projects.filter(p => p.status === "In Progress").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === "Completed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Planning / On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {projects.filter(p => p.status === "Planning" || p.status === "On Hold").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                  <CardTitle className="text-lg">{project.project_name}</CardTitle>
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Duration: {project.duration_value} {project.duration_unit}
                    {project.duration_value > 1 ? "s" : ""}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Assigned by: {getEmployeeName(project.assigned_by)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>All Assigned Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">S. No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Assigned By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
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
                    <td className="px-4 py-3 text-sm">{getEmployeeName(project.assigned_by)}</td>
                    <td className="px-4 py-3 text-sm">
                      {project.duration_value} {project.duration_unit}
                      {project.duration_value > 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(project.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
