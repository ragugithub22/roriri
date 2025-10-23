import { Laptop, Users, Code, TrendingUp, Plus, Bug } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ITDashboard = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ["it-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_projects")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["it-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_clients")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["it-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_company")
        .single();
      
      if (!entityData) return [];

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("entity_id", entityData.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  const quickActions = [
    { label: "New Project", icon: Plus, onClick: () => {}, variant: "default" as const },
    { label: "Add Client", icon: Users, onClick: () => {} },
    { label: "Track Bugs", icon: Bug, onClick: () => {} },
    { label: "Code Review", icon: Code, onClick: () => {} },
  ];

  const projectColumns = [
    { key: "project_code", label: "Project Code" },
    { key: "name", label: "Name" },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
    { key: "technology_stack", label: "Tech Stack" },
  ];

  const projectStatusData = [
    { status: "Planning", count: 4 },
    { status: "Development", count: 12 },
    { status: "Testing", count: 6 },
    { status: "Deployed", count: 12 },
  ];

  return (
    <DashboardLayout
      entityName="RORIRI IT Company"
      entityIcon={Laptop}
      entityColor="from-indigo-500 to-blue-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Active Projects"
          value={projects.length}
          subtitle="In development"
          trend={25}
          icon={Code}
          color="from-indigo-500 to-blue-500"
        />
        <KPICard
          title="Total Clients"
          value={clients.length}
          subtitle="Active partnerships"
          trend={18}
          icon={Users}
          color="from-purple-500 to-violet-500"
        />
        <KPICard
          title="Deployments"
          value="34"
          subtitle="This quarter"
          trend={30}
          icon={TrendingUp}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Code Quality"
          value="A+"
          subtitle="Average rating"
          trend={8}
          icon={Laptop}
          color="from-cyan-500 to-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Project Pipeline"
          description="Projects by development stage"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Active Projects"
            description="Current software development projects"
            columns={projectColumns}
            data={projects}
            emptyMessage="No projects found"
          />
        </div>
        
        <ActivityFeed activities={activities} />
      </div>
    </DashboardLayout>
  );
};

export default ITDashboard;
