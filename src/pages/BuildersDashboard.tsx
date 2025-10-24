import { Building2, Hammer, Users, TrendingUp, PlusCircle, UserPlus, FileText, Eye } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import ChartCard from "@/components/dashboard/ChartCard";
import { DataTable } from "@/components/dashboard/DataTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BuildersDashboard = () => {
  // Fetch activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["activity-logs-builders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  const kpis = [
    {
      title: "Active Projects",
      value: "28",
      change: "+14%",
      trend: 14,
      icon: Building2,
    },
    {
      title: "Completed Units",
      value: "145",
      change: "+18%",
      trend: 18,
      icon: Hammer,
    },
    {
      title: "Total Clients",
      value: "312",
      change: "+10%",
      trend: 10,
      icon: Users,
    },
    {
      title: "Revenue",
      value: "₹48.2M",
      change: "+25%",
      trend: 25,
      icon: TrendingUp,
    },
  ];

  const projectData = [
    { month: "Jan", projects: 22 },
    { month: "Feb", projects: 24 },
    { month: "Mar", projects: 23 },
    { month: "Apr", projects: 26 },
    { month: "May", projects: 27 },
    { month: "Jun", projects: 28 },
  ];

  const projectColumns = [
    { key: "name", label: "Project Name" },
    { key: "location", label: "Location" },
    { key: "type", label: "Type" },
    { key: "units", label: "Units" },
    { key: "status", label: "Status" },
  ];

  const projectTableData = [
    { id: "1", name: "Roshan Heights", location: "Bangalore", type: "Residential", units: "120", status: "In Progress" },
    { id: "2", name: "Green Valley Villas", location: "Mysore", type: "Villas", units: "45", status: "Planning" },
    { id: "3", name: "Commercial Plaza", location: "Hubli", type: "Commercial", units: "80", status: "In Progress" },
  ];

  const quickActions = [
    { label: "New Project", icon: PlusCircle, onClick: () => console.log("New Project") },
    { label: "Add Client", icon: UserPlus, onClick: () => console.log("Add Client") },
    { label: "View Contracts", icon: Eye, onClick: () => console.log("View Contracts") },
    { label: "Generate Report", icon: FileText, onClick: () => console.log("Generate Report") },
  ];

  return (
    <DashboardLayout
      entityName="Roshan Builders"
      entityIcon={Building2}
      entityColor="from-amber-400 to-orange-600"
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Project Growth" description="Active projects over the last 6 months">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="projects" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ActivityFeed activities={activityLogs} />
        </div>

        {/* Data Table */}
        <DataTable
          title="Construction Projects"
          description="Manage all construction and real estate projects"
          columns={projectColumns}
          data={projectTableData}
        />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />
      </div>
    </DashboardLayout>
  );
};

export default BuildersDashboard;
