import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/DataTable";
import { BarChart3, Bug, Layers, Timer } from "lucide-react";

interface ITProject {
  id: string;
  project_code: string;
  name: string;
  description: string | null;
  technology_stack: string | null;
  status: string;
  deadline: string | null;
  created_at: string;
  it_clients?: {
    company_name: string | null;
  } | null;
}

interface Sprint {
  id: string;
  project_id: string;
  sprint_number: number;
  status: string;
  start_date: string;
  end_date: string;
  goals: string | null;
  it_projects?: {
    project_code: string;
    name: string;
  } | null;
}

interface BugRecord {
  id: string;
  project_id: string;
  title: string;
  severity: string | null;
  status: string | null;
  created_at: string;
  it_projects?: {
    project_code: string;
  } | null;
}

const ReportsPage = () => {
  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ["it-park-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_projects")
        .select("*, it_clients:client_id (company_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ITProject[]) ?? [];
    },
  });

  const {
    data: sprints = [],
    isLoading: sprintsLoading,
  } = useQuery({
    queryKey: ["it-park-sprints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sprints")
        .select("*, it_projects!inner(project_code,name)")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data as Sprint[]) ?? [];
    },
  });

  const {
    data: bugs = [],
    isLoading: bugsLoading,
  } = useQuery({
    queryKey: ["it-park-bugs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bugs")
        .select("*, it_projects!inner(project_code)")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data as BugRecord[]) ?? [];
    },
  });

  const statusDistribution = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, project) => {
      const status = (project.status || "planning").toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const sprintVelocity = useMemo(() => {
    if (!sprints.length) return 0;
    const totalDuration = sprints.reduce((sum, sprint) => {
      const start = new Date(sprint.start_date).getTime();
      const end = new Date(sprint.end_date).getTime();
      return sum + Math.max(end - start, 0);
    }, 0);
    const avgMillis = totalDuration / sprints.length;
    return Math.round(avgMillis / (1000 * 60 * 60 * 24));
  }, [sprints]);

  const criticalBugs = bugs.filter(
    (bug) => (bug.severity || "").toLowerCase() === "critical" && bug.status !== "resolved"
  ).length;

  const overdueProjects = projects.filter((project) => {
    if (!project.deadline) return false;
    const deadline = new Date(project.deadline);
    return deadline < new Date() && project.status !== "deployed";
  }).length;

  const projectColumns = [
    {
      key: "project_code",
      label: "Project",
      render: (_: string, row: ITProject) => (
        <div>
          <div className="font-semibold">{row.project_code}</div>
          <div className="text-sm text-muted-foreground">{row.name}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge
          variant={
            value === "deployed"
              ? "default"
              : value === "testing"
              ? "secondary"
              : value === "development"
              ? "outline"
              : "destructive"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "technology_stack",
      label: "Stack",
      render: (value: string) => value || "—",
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (value: string | null) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      key: "it_clients",
      label: "Client",
      render: (_: any, row: ITProject) => row.it_clients?.company_name || "—",
    },
  ];

  const sprintColumns = [
    {
      key: "sprint_number",
      label: "Sprint",
      render: (value: number, row: Sprint) => (
        <div>
          <div className="font-medium">Sprint {value}</div>
          <div className="text-sm text-muted-foreground">
            {row.it_projects?.project_code} · {row.it_projects?.name}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "completed" ? "default" : value === "active" ? "secondary" : "outline"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "start_date",
      label: "Window",
      render: (_: string, row: Sprint) =>
        `${new Date(row.start_date).toLocaleDateString()} - ${new Date(row.end_date).toLocaleDateString()}`,
    },
  ];

  const bugColumns = [
    {
      key: "title",
      label: "Issue",
      render: (value: string, row: BugRecord) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.it_projects?.project_code}</div>
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (value: string | null) => (
        <Badge variant={value === "critical" ? "destructive" : value === "high" ? "default" : "secondary"}>
          {value || "unassigned"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string | null) => value || "pending",
    },
    {
      key: "created_at",
      label: "Opened",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Portfolio size</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sprints</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sprints.filter((s) => s.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg duration {sprintVelocity || 0} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Bugs</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalBugs}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueProjects}</div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Project count by lifecycle stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusDistribution).map(([status, count]) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{status}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${(count / (projects.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!projects.length && (
              <p className="text-sm text-muted-foreground">No IT Park projects found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk & Velocity Summary</CardTitle>
            <CardDescription>Highlights from recent sprints and QA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Average sprint duration</p>
              <p className="text-2xl font-semibold">{sprintVelocity || 0} days</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-1">Open bug backlog</p>
              <p className="text-2xl font-semibold">
                {bugs.filter((bug) => bug.status !== "resolved").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Project Portfolio"
        description="IT Park software initiatives and health"
        columns={projectColumns}
        data={projects}
        isLoading={projectsLoading}
        emptyMessage="No IT projects available"
      />

      <DataTable
        title="Recent Sprints"
        description="Execution cadence across active teams"
        columns={sprintColumns}
        data={sprints.slice(0, 8)}
        isLoading={sprintsLoading}
        emptyMessage="No sprints recorded"
      />

      <DataTable
        title="Open Issues"
        description="Key bugs impacting IT Park deliverables"
        columns={bugColumns}
        data={bugs}
        isLoading={bugsLoading}
        emptyMessage="No open issues for IT Park"
      />
    </div>
  );
};

export default ReportsPage;
