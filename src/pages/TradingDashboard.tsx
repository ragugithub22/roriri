// @ts-nocheck
import { ShoppingCart, Package, TrendingUp, DollarSign, Plus, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TradingDashboard = () => {
  const { data: products = [] } = useQuery({
    queryKey: ["trading-inventory"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "trading")
        .single();
      
      if (!entityData) return [];

      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("entity_id", entityData.id)
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_orders")
        .select("*")
        .order("order_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["trading-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "trading")
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
    { label: "New Order", icon: Plus, onClick: () => {}, variant: "default" as const },
    { label: "Add Product", icon: Package, onClick: () => {} },
    { label: "Sales Report", icon: FileText, onClick: () => {} },
    { label: "Inventory", icon: ShoppingCart, onClick: () => {} },
  ];

  const productColumns = [
    { key: "item_code", label: "Item Code" },
    { key: "name", label: "Name" },
    { 
      key: "category", 
      label: "Category",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    { key: "unit", label: "Unit" },
  ];

  const salesData = [
    { month: "Jan", revenue: 3200000 },
    { month: "Feb", revenue: 3800000 },
    { month: "Mar", revenue: 3500000 },
    { month: "Apr", revenue: 4200000 },
    { month: "May", revenue: 4500000 },
    { month: "Jun", revenue: 5200000 },
  ];

  return (
    <DashboardLayout
      entityName="ROSHAN Traders"
      entityIcon={ShoppingCart}
      entityColor="from-orange-500 to-amber-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Products"
          value={products.length}
          subtitle="In catalog"
          trend={12}
          icon={Package}
          color="from-orange-500 to-amber-500"
        />
        <KPICard
          title="Monthly Revenue"
          value="₹45.2M"
          subtitle="This month"
          trend={18}
          icon={DollarSign}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Total Orders"
          value={orders.length}
          subtitle="Recent orders"
          trend={22}
          icon={ShoppingCart}
          color="from-blue-500 to-cyan-500"
        />
        <KPICard
          title="Growth Rate"
          value="24%"
          subtitle="Year over year"
          trend={24}
          icon={TrendingUp}
          color="from-purple-500 to-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Revenue Trend"
          description="Monthly sales performance"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Inventory Items"
            description="Current product catalog"
            columns={productColumns}
            data={products}
            emptyMessage="No items found"
          />
        </div>
        
        <ActivityFeed activities={activities} />
      </div>
    </DashboardLayout>
  );
};

export default TradingDashboard;
