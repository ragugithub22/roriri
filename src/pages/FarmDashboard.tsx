import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sprout, Users, Calendar, Gamepad2, Utensils, CreditCard, TrendingUp, Plus, UserCheck, Ticket, BookOpen, ShoppingCart, Home, Bell, BarChart3, Settings } from "lucide-react";
import EntitySidebarLayout, { SidebarNavItem } from "@/components/layouts/EntitySidebarLayout";
import KPICard from "@/components/dashboard/KPICard";
import ChartCard from "@/components/dashboard/ChartCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
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

  // Placeholder KPIs since farm tables don't exist
  const todayVisitorsCount = 0;
  const eventsCount = 0;
  const gamesCount = 0;
  const todayFoodOrdersCount = 0;
  const totalRevenue = 0;

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
                value={todayVisitorsCount}
                subtitle="Total entries"
                trend={12}
                icon={Users}
                color="from-green-500 to-emerald-500"
              />
              <KPICard
                title="Total Events"
                value={eventsCount}
                subtitle="Active events"
                trend={8}
                icon={Calendar}
                color="from-blue-500 to-cyan-500"
              />
              <KPICard
                title="Games Available"
                value={gamesCount}
                subtitle="Activities"
                trend={5}
                icon={Gamepad2}
                color="from-purple-500 to-pink-500"
              />
              <KPICard
                title="Food Orders Today"
                value={todayFoodOrdersCount}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <QuickActions actions={quickActions} />
              </div>
            </div>
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