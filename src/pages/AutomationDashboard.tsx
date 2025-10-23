import { Factory, Cog, TrendingUp, AlertTriangle, Plus, Wrench } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AutomationDashboard = () => {
  const { data: machines = [] } = useQuery({
    queryKey: ["machines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: productionLines = [] } = useQuery({
    queryKey: ["production-lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_lines")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["automation-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "automation")
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
    { label: "Add Machine", icon: Plus, onClick: () => {}, variant: "default" as const },
    { label: "Schedule Maintenance", icon: Wrench, onClick: () => {} },
    { label: "Production Report", icon: Factory, onClick: () => {} },
    { label: "Monitor Lines", icon: Cog, onClick: () => {} },
  ];

  const machineColumns = [
    { key: "machine_code", label: "Machine Code" },
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
  ];

  const productionData = [
    { day: "Mon", units: 1800 },
    { day: "Tue", units: 2100 },
    { day: "Wed", units: 1900 },
    { day: "Thu", units: 2300 },
    { day: "Fri", units: 2400 },
    { day: "Sat", units: 1600 },
  ];

  return (
    <DashboardLayout
      entityName="RORIRI Automation"
      entityIcon={Factory}
      entityColor="from-slate-500 to-zinc-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Active Machines"
          value={machines.length}
          subtitle="Operational units"
          trend={5}
          icon={Cog}
          color="from-slate-500 to-zinc-500"
        />
        <KPICard
          title="Production Lines"
          value={productionLines.length}
          subtitle="Running lines"
          trend={0}
          icon={Factory}
          color="from-blue-500 to-cyan-500"
        />
        <KPICard
          title="Output"
          value="12K"
          subtitle="Units/month"
          trend={9}
          icon={TrendingUp}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Efficiency"
          value="94%"
          subtitle="Machine uptime"
          trend={3}
          icon={AlertTriangle}
          color="from-yellow-500 to-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Production Output"
          description="Daily production units"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="units" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Machines"
            description="Manufacturing equipment status"
            columns={machineColumns}
            data={machines}
            emptyMessage="No machines found"
          />
        </div>
        
        <ActivityFeed activities={activities} />
      </div>
    </DashboardLayout>
  );
};

export default AutomationDashboard;
