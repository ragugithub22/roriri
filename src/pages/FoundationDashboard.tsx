import { Heart, Users, DollarSign, TrendingUp, Plus, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FoundationDashboard = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ["foundation-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foundation_projects")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: donations = [] } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("donation_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["foundation-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "foundation")
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
    { label: "Record Donation", icon: DollarSign, onClick: () => {} },
    { label: "Impact Report", icon: FileText, onClick: () => {} },
    { label: "Beneficiaries", icon: Users, onClick: () => {} },
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

  const donationData = [
    { month: "Jan", amount: 50000 },
    { month: "Feb", amount: 65000 },
    { month: "Mar", amount: 55000 },
    { month: "Apr", amount: 80000 },
    { month: "May", amount: 75000 },
    { month: "Jun", amount: 90000 },
  ];

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <DashboardLayout
      entityName="RORIRI Foundation"
      entityIcon={Heart}
      entityColor="from-pink-500 to-rose-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Active Projects"
          value={projects.length}
          subtitle="Social initiatives"
          trend={8}
          icon={Heart}
          color="from-pink-500 to-rose-500"
        />
        <KPICard
          title="Total Donations"
          value={`₹${(totalDonations / 1000000).toFixed(1)}M`}
          subtitle="Received this year"
          trend={22}
          icon={DollarSign}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Beneficiaries"
          value="1,245"
          subtitle="Lives impacted"
          trend={18}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />
        <KPICard
          title="Impact Score"
          value="94%"
          subtitle="Project success"
          trend={7}
          icon={TrendingUp}
          color="from-purple-500 to-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Donation Trends"
          description="Monthly donation flow"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={donationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Active Projects"
            description="Current social development initiatives"
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

export default FoundationDashboard;
