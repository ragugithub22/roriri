import { Briefcase, Users, DollarSign, TrendingUp, Plus, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const ConsultancyDashboard = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ["consultancy-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_projects")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["consultancy-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_clients")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["consultancy-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "consultancy")
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
    { label: "Reports", icon: FileText, onClick: () => {} },
    { label: "Contracts", icon: Briefcase, onClick: () => {} },
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
    { 
      key: "budget", 
      label: "Budget",
      render: (value: number) => `₹${value?.toLocaleString()}`
    },
  ];

  const statusData = [
    { name: "Planning", value: 3, color: "#3b82f6" },
    { name: "Active", value: 7, color: "#10b981" },
    { name: "Completed", value: 5, color: "#6366f1" },
  ];

  return (
    <DashboardLayout
      entityName="RIYA Consultancy"
      entityIcon={Briefcase}
      entityColor="from-purple-500 to-violet-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Active Projects"
          value={projects.length}
          subtitle="Ongoing engagements"
          trend={22}
          icon={Briefcase}
          color="from-purple-500 to-violet-500"
        />
        <KPICard
          title="Total Clients"
          value={clients.length}
          subtitle="Active partnerships"
          trend={15}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />
        <KPICard
          title="Revenue"
          value="₹8.5M"
          subtitle="This quarter"
          trend={28}
          icon={DollarSign}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Success Rate"
          value="96%"
          subtitle="Project completion"
          trend={5}
          icon={TrendingUp}
          color="from-orange-500 to-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Project Status Distribution"
          description="Current project pipeline"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Active Projects"
            description="Current consultancy engagements"
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

export default ConsultancyDashboard;
