import { Sprout, Droplet, Tractor, TrendingUp, Plus, MapPin } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FarmDashboard = () => {
  const { data: plots = [] } = useQuery({
    queryKey: ["farm-plots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_plots")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: harvests = [] } = useQuery({
    queryKey: ["harvests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("harvests")
        .select("*")
        .order("harvest_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["farm-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "farm")
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
    { label: "Add Plot", icon: Plus, onClick: () => {}, variant: "default" as const },
    { label: "Record Harvest", icon: Sprout, onClick: () => {} },
    { label: "View Plots", icon: MapPin, onClick: () => {} },
    { label: "Equipment", icon: Tractor, onClick: () => {} },
  ];

  const plotColumns = [
    { key: "plot_code", label: "Plot Code" },
    { key: "name", label: "Name" },
    { 
      key: "area_hectares", 
      label: "Area",
      render: (value: number) => `${value} ha`
    },
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

  const harvestData = [
    { crop: "Wheat", quantity: 1500 },
    { crop: "Rice", quantity: 2200 },
    { crop: "Corn", quantity: 1800 },
    { crop: "Vegetables", quantity: 900 },
  ];

  const totalArea = plots.reduce((sum, p) => sum + Number(p.area_hectares || 0), 0);

  return (
    <DashboardLayout
      entityName="Rithish Farms"
      entityIcon={Sprout}
      entityColor="from-green-500 to-emerald-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Plots"
          value={plots.length}
          subtitle="Active farmlands"
          trend={5}
          icon={MapPin}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Total Area"
          value={`${totalArea.toFixed(1)} ha`}
          subtitle="Under cultivation"
          trend={15}
          icon={Sprout}
          color="from-blue-500 to-cyan-500"
        />
        <KPICard
          title="Recent Harvests"
          value={harvests.length}
          subtitle="This season"
          trend={12}
          icon={TrendingUp}
          color="from-yellow-500 to-orange-500"
        />
        <KPICard
          title="Efficiency"
          value="92%"
          subtitle="Resource utilization"
          trend={8}
          icon={Droplet}
          color="from-cyan-500 to-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Crop Production"
          description="Harvest quantities by crop type"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={harvestData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Farm Plots"
            description="Active cultivation areas"
            columns={plotColumns}
            data={plots}
            emptyMessage="No plots found"
          />
        </div>
        
        <ActivityFeed activities={activities} />
      </div>
    </DashboardLayout>
  );
};

export default FarmDashboard;
