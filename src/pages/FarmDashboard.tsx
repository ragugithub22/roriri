import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sprout, Users, Calendar, Gamepad2, Utensils, CreditCard, TrendingUp, Plus, UserCheck, Ticket, BookOpen, ShoppingCart } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FarmEventsManager from "@/components/farm/FarmEventsManager";
import FarmGamesManager from "@/components/farm/FarmGamesManager";
import FarmFoodManager from "@/components/farm/FarmFoodManager";
import FarmVisitorEntryManager from "@/components/farm/FarmVisitorEntryManager";
import FarmTicketsManager from "@/components/farm/FarmTicketsManager";
import FarmBookingsManager from "@/components/farm/FarmBookingsManager";
import FarmFoodOrdersManager from "@/components/farm/FarmFoodOrdersManager";
import FarmPaymentsManager from "@/components/farm/FarmPaymentsManager";
import FarmExpensesManager from "@/components/farm/FarmExpensesManager";
import FarmAnnouncementsManager from "@/components/farm/FarmAnnouncementsManager";
import FarmReportsManager from "@/components/farm/FarmReportsManager";
import FarmSettingsManager from "@/components/farm/FarmSettingsManager";

const FarmDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'events', 'games', 'food', 'visitors', 'tickets', 'bookings', 'food-orders', 'payments', 'expenses', 'announcements', 'reports', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Today's visitors
  const { data: todayVisitors = [] } = useQuery({
    queryKey: ["today-visitors"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("farm_visitors")
        .select("*")
        .gte("entry_time", `${today}T00:00:00`)
        .lt("entry_time", `${today}T23:59:59`);
      if (error) throw error;
      return data || [];
    },
  });

  // Total events
  const { data: events = [] } = useQuery({
    queryKey: ["farm-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_events")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Total games
  const { data: games = [] } = useQuery({
    queryKey: ["farm-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_games")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Today's food orders
  const { data: todayFoodOrders = [] } = useQuery({
    queryKey: ["today-food-orders"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("farm_food_orders")
        .select("*")
        .gte("order_time", `${today}T00:00:00`)
        .lt("order_time", `${today}T23:59:59`);
      if (error) throw error;
      return data || [];
    },
  });

  // Total revenue today
  const { data: todayRevenue = [] } = useQuery({
    queryKey: ["today-revenue"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("farm_payments")
        .select("amount")
        .gte("payment_date", `${today}T00:00:00`)
        .lt("payment_date", `${today}T23:59:59`)
        .eq("status", "completed");
      if (error) throw error;
      return data || [];
    },
  });

  // Recent activities (visitors, orders, events)
  const { data: recentActivities = [] } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const activities = [];

      // Recent visitors
      const { data: visitors } = await supabase
        .from("farm_visitors")
        .select("visitor_name, entry_time, ticket_number")
        .order("entry_time", { ascending: false })
        .limit(5);

      // Recent orders
      const { data: orders } = await supabase
        .from("farm_food_orders")
        .select("visitor_name, order_time, total_amount")
        .order("order_time", { ascending: false })
        .limit(5);

      // Recent events
      const { data: events } = await supabase
        .from("farm_events")
        .select("title, event_date, status")
        .order("created_at", { ascending: false })
        .limit(5);

      if (visitors) {
        visitors.forEach(v => activities.push({
          id: `visitor-${v.ticket_number}`,
          type: "visitor",
          message: `${v.visitor_name} entered the farm`,
          time: v.entry_time,
          icon: UserCheck
        }));
      }

      if (orders) {
        orders.forEach(o => activities.push({
          id: `order-${o.order_time}`,
          type: "order",
          message: `Food order by ${o.visitor_name} - ₹${o.total_amount}`,
          time: o.order_time,
          icon: ShoppingCart
        }));
      }

      if (events) {
        events.forEach(e => activities.push({
          id: `event-${e.title}`,
          type: "event",
          message: `Event "${e.title}" ${e.status}`,
          time: e.event_date,
          icon: Calendar
        }));
      }

      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    },
  });

  const quickActions = [
    { label: "Add Visitor", icon: Plus, onClick: () => {}, variant: "default" as const },
    { label: "New Event", icon: Calendar, onClick: () => {} },
    { label: "Add Game", icon: Gamepad2, onClick: () => {} },
    { label: "Food Order", icon: Utensils, onClick: () => {} },
  ];

  // Visitor entry data for chart
  const visitorChartData = [
    { time: "9 AM", visitors: 12 },
    { time: "10 AM", visitors: 25 },
    { time: "11 AM", visitors: 38 },
    { time: "12 PM", visitors: 52 },
    { time: "1 PM", visitors: 45 },
    { time: "2 PM", visitors: 68 },
    { time: "3 PM", visitors: 72 },
    { time: "4 PM", visitors: 58 },
    { time: "5 PM", visitors: 35 },
  ];

  // Revenue breakdown
  const revenueData = [
    { name: "Entry Tickets", value: 45000, color: "#10b981" },
    { name: "Games", value: 25000, color: "#3b82f6" },
    { name: "Food", value: 18000, color: "#f59e0b" },
    { name: "Events", value: 12000, color: "#ef4444" },
  ];

  const totalRevenue = todayRevenue.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <DashboardLayout
      entityName="Rithish Farms - Super Admin"
      entityIcon={Sprout}
      entityColor="from-green-500 to-emerald-600"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" orientation="vertical">
        <div className="flex gap-6">
          <TabsList className="flex flex-col h-fit w-48 space-y-1">
            <TabsTrigger value="dashboard" className="w-full justify-start">Dashboard</TabsTrigger>
            <TabsTrigger value="visitors" className="w-full justify-start">Visitors</TabsTrigger>
            <TabsTrigger value="events" className="w-full justify-start">Events</TabsTrigger>
            <TabsTrigger value="games" className="w-full justify-start">Games</TabsTrigger>
            <TabsTrigger value="food" className="w-full justify-start">Food</TabsTrigger>
            <TabsTrigger value="tickets" className="w-full justify-start">Tickets</TabsTrigger>
            <TabsTrigger value="bookings" className="w-full justify-start">Bookings</TabsTrigger>
            <TabsTrigger value="food-orders" className="w-full justify-start">Food Orders</TabsTrigger>
            <TabsTrigger value="payments" className="w-full justify-start">Payments</TabsTrigger>
            <TabsTrigger value="expenses" className="w-full justify-start">Expenses</TabsTrigger>
            <TabsTrigger value="announcements" className="w-full justify-start">Announcements</TabsTrigger>
            <TabsTrigger value="reports" className="w-full justify-start">Reports</TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="dashboard" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Farm Dashboard</h1>
                  <p className="text-muted-foreground">Welcome to Rithish Farms Management System</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <KPICard
                    title="Visitors Today"
                    value={todayVisitors.length}
                    subtitle="Total entries"
                    trend={12}
                    icon={Users}
                    color="from-green-500 to-emerald-500"
                  />
                  <KPICard
                    title="Total Events"
                    value={events.length}
                    subtitle="Active events"
                    trend={8}
                    icon={Calendar}
                    color="from-blue-500 to-cyan-500"
                  />
                  <KPICard
                    title="Games Available"
                    value={games.length}
                    subtitle="Activities"
                    trend={5}
                    icon={Gamepad2}
                    color="from-purple-500 to-pink-500"
                  />
                  <KPICard
                    title="Food Orders Today"
                    value={todayFoodOrders.length}
                    subtitle="Orders placed"
                    trend={15}
                    icon={Utensils}
                    color="from-yellow-500 to-orange-500"
                  />
                  <KPICard
                    title="Revenue Today"
                    value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
                    subtitle="Total earnings"
                    trend={18}
                    icon={CreditCard}
                    color="from-cyan-500 to-blue-500"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard
                    title="Visitor Entry Timeline"
                    description="Hourly visitor entries today"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={visitorChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="visitors"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard
                    title="Revenue Breakdown"
                    description="Today's revenue by category"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenueData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                {/* Quick Actions and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <QuickActions actions={quickActions} />
                  </div>

                  <div className="lg:col-span-2">
                    <ActivityFeed activities={recentActivities} />
                  </div>
                </div>

                {/* Recent Visitors Table */}
                <DataTable
                  title="Recent Visitors"
                  description="Latest farm visitors today"
                  columns={[
                    { key: "ticket_number", label: "Ticket #" },
                    { key: "visitor_name", label: "Name" },
                    { key: "mobile", label: "Mobile" },
                    {
                      key: "entry_type",
                      label: "Type",
                      render: (value: string) => (
                        <Badge variant="outline">{value}</Badge>
                      )
                    },
                    {
                      key: "ticket_price",
                      label: "Amount",
                      render: (value: number) => `₹${value}`
                    },
                    {
                      key: "payment_status",
                      label: "Payment",
                      render: (value: string) => (
                        <Badge variant={value === "paid" ? "default" : "secondary"}>
                          {value}
                        </Badge>
                      )
                    },
                    {
                      key: "entry_time",
                      label: "Entry Time",
                      render: (value: string) => new Date(value).toLocaleTimeString()
                    }
                  ]}
                  data={todayVisitors.slice(0, 10)}
                  emptyMessage="No visitors today"
                />
              </div>
            </TabsContent>

            <TabsContent value="visitors" className="mt-0">
              <FarmVisitorEntryManager />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <FarmEventsManager />
            </TabsContent>

            <TabsContent value="games" className="mt-0">
              <FarmGamesManager />
            </TabsContent>

            <TabsContent value="food" className="mt-0">
              <FarmFoodManager />
            </TabsContent>

            <TabsContent value="tickets" className="mt-0">
              <FarmTicketsManager />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <FarmBookingsManager />
            </TabsContent>

            <TabsContent value="food-orders" className="mt-0">
              <FarmFoodOrdersManager />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <FarmPaymentsManager />
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <FarmExpensesManager />
            </TabsContent>

            <TabsContent value="announcements" className="mt-0">
              <FarmAnnouncementsManager />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <FarmReportsManager />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <FarmSettingsManager />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </DashboardLayout>
  );
};

export default FarmDashboard;
