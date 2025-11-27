import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sprout, Users, Calendar, Gamepad2, Utensils, CreditCard, TrendingUp, Plus, UserCheck, Ticket, BookOpen, ShoppingCart, Home, Bell, BarChart3, Settings } from "lucide-react";
import EntitySidebarLayout, { SidebarNavItem } from "@/components/layouts/EntitySidebarLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
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

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", value: "dashboard", icon: Home },
  { label: "Visitors", value: "visitors", icon: Users },
  { label: "Events", value: "events", icon: Calendar },
  { label: "Games", value: "games", icon: Gamepad2 },
  { label: "Food", value: "food", icon: Utensils },
  { label: "Tickets", value: "tickets", icon: Ticket },
  { label: "Bookings", value: "bookings", icon: BookOpen },
  { label: "Food Orders", value: "food-orders", icon: ShoppingCart },
  { label: "Payments", value: "payments", icon: CreditCard },
  { label: "Expenses", value: "expenses", icon: TrendingUp },
  { label: "Announcements", value: "announcements", icon: Bell },
  { label: "Reports", value: "reports", icon: BarChart3 },
  { label: "Settings", value: "settings", icon: Settings },
];

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
    <EntitySidebarLayout
      entityName="Rithish Farms"
      entityIcon={Sprout}
      navItems={navItems}
      activeItem={activeTab}
      onItemChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === "dashboard" && (
          <>
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
          </>
        )}

        {activeTab === "visitors" && <FarmVisitorEntryManager />}
        {activeTab === "events" && <FarmEventsManager />}
        {activeTab === "games" && <FarmGamesManager />}
        {activeTab === "food" && <FarmFoodManager />}
        {activeTab === "tickets" && <FarmTicketsManager />}
        {activeTab === "bookings" && <FarmBookingsManager />}
        {activeTab === "food-orders" && <FarmFoodOrdersManager />}
        {activeTab === "payments" && <FarmPaymentsManager />}
        {activeTab === "expenses" && <FarmExpensesManager />}
        {activeTab === "announcements" && <FarmAnnouncementsManager />}
        {activeTab === "reports" && <FarmReportsManager />}
        {activeTab === "settings" && <FarmSettingsManager />}
      </div>
    </EntitySidebarLayout>
  );
};

export default FarmDashboard;
