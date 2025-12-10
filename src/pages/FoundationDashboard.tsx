import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EntitySidebarLayout, { SidebarNavItem } from "@/components/layouts/EntitySidebarLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { Heart, Users, DollarSign, TrendingUp, Plus, FileText, Calendar, UserCheck, Award, BarChart3, Settings, Home } from "lucide-react";
import BeneficiariesManager from "@/components/foundation/BeneficiariesManager";
import VolunteersManager from "@/components/foundation/VolunteersManager";
import EventsManager from "@/components/foundation/EventsManager";
import DonorsManager from "@/components/foundation/DonorsManager";
import DonationsManager from "@/components/foundation/DonationsManager";
import ExpensesManager from "@/components/foundation/ExpensesManager";
import AnnouncementsManager from "@/components/foundation/AnnouncementsManager";
import CertificatesManager from "@/components/foundation/CertificatesManager";
import ReportsManager from "@/components/foundation/ReportsManager";
import SettingsManager from "@/components/foundation/SettingsManager";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Bell, Gift, Users2, CalendarDays } from "lucide-react";

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", value: "dashboard", icon: Home },
  { label: "Beneficiaries", value: "beneficiaries", icon: Users },
  { label: "Volunteers", value: "volunteers", icon: Users2 },
  { label: "Events", value: "events", icon: CalendarDays },
  { label: "Donors", value: "donors", icon: Gift },
  { label: "Donations", value: "donations", icon: DollarSign },
  { label: "Expenses", value: "expenses", icon: FileText },
  { label: "Announcements", value: "announcements", icon: Bell },
  { label: "Certificates", value: "certificates", icon: Award },
  { label: "Reports", value: "reports", icon: BarChart3 },
  { label: "Settings", value: "settings", icon: Settings },
];

const FoundationDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'beneficiaries', 'volunteers', 'events', 'donors', 'donations', 'expenses', 'announcements', 'certificates', 'reports', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Fetch foundation projects
  const { data: projects = [] } = useQuery({
    queryKey: ["foundation-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foundation_projects")
        .select("*")
        .limit(10);
      if (error) return [];
      return data || [];
    },
  });

  // Fetch donations
  const { data: donations = [] } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("donation_date", { ascending: false })
        .limit(10);
      if (error) return [];
      return data || [];
    },
  });

  // Fetch beneficiaries
  const { data: beneficiaries = [] } = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .limit(10);
      if (error) return [];
      return data || [];
    },
  });

  // Fetch activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["foundation-activity"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "foundation")
        .maybeSingle();

      if (!entity) return [];

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("entity_id", entity.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) return [];
      return data || [];
    },
  });

  // Placeholder values since some tables don't exist
  const totalVolunteers = 0;
  const totalEvents = 0;

  const quickActions = [
    { label: "New Beneficiary", icon: Users, onClick: () => {}, variant: "default" as const },
    { label: "Record Donation", icon: DollarSign, onClick: () => {} },
    { label: "Add Volunteer", icon: UserCheck, onClick: () => {} },
    { label: "Create Event", icon: Calendar, onClick: () => {} },
    { label: "Generate Certificate", icon: Award, onClick: () => {} },
    { label: "View Reports", icon: FileText, onClick: () => {} },
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

  const beneficiaryColumns = [
    { key: "full_name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "contact_info", label: "Contact" },
  ];

  const donationData = [
    { month: "Jan", amount: 50000 },
    { month: "Feb", amount: 65000 },
    { month: "Mar", amount: 55000 },
    { month: "Apr", amount: 80000 },
    { month: "May", amount: 75000 },
    { month: "Jun", amount: 90000 },
  ];

  const beneficiaryCategories = [
    { category: "Medical", count: 45 },
    { category: "Education", count: 78 },
    { category: "Financial", count: 32 },
    { category: "Housing", count: 15 },
    { category: "Nutrition", count: 28 },
  ];

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const totalBeneficiaries = beneficiaries.length;

  return (
    <EntitySidebarLayout
      entityName="RORIRI Foundation"
      entityIcon={Heart}
      navItems={navItems}
      activeItem={activeTab}
      onItemChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === "dashboard" && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Total Beneficiaries"
                value={totalBeneficiaries.toString()}
                subtitle="Lives impacted"
                trend={12}
                icon={Users}
                color="from-blue-500 to-cyan-500"
              />
              <KPICard
                title="Active Volunteers"
                value={totalVolunteers.toString()}
                subtitle="Community helpers"
                trend={8}
                icon={UserCheck}
                color="from-green-500 to-emerald-500"
              />
              <KPICard
                title="Total Donations"
                value={`₹${(totalDonations / 100000).toFixed(1)}L`}
                subtitle="Funds raised"
                trend={22}
                icon={DollarSign}
                color="from-purple-500 to-violet-500"
              />
              <KPICard
                title="Events Conducted"
                value={totalEvents.toString()}
                subtitle="Programs & activities"
                trend={15}
                icon={Calendar}
                color="from-orange-500 to-red-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <ChartCard
                title="Beneficiary Categories"
                description="Distribution by support type"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={beneficiaryCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Quick Actions */}
            <QuickActions actions={quickActions} />

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataTable
                title="Recent Beneficiaries"
                description="Latest beneficiary registrations"
                columns={beneficiaryColumns}
                data={beneficiaries}
                emptyMessage="No beneficiaries found"
              />

              <DataTable
                title="Active Projects"
                description="Current social development initiatives"
                columns={projectColumns}
                data={projects}
                emptyMessage="No projects found"
              />
            </div>

            {/* Activity Feed */}
            <ActivityFeed activities={activityLogs} />
          </>
        )}

        {activeTab === "beneficiaries" && <BeneficiariesManager />}
        {activeTab === "volunteers" && <VolunteersManager />}
        {activeTab === "events" && <EventsManager />}
        {activeTab === "donors" && <DonorsManager />}
        {activeTab === "donations" && <DonationsManager />}
        {activeTab === "expenses" && <ExpensesManager />}
        {activeTab === "announcements" && <AnnouncementsManager />}
        {activeTab === "certificates" && <CertificatesManager />}
        {activeTab === "reports" && <ReportsManager />}
        {activeTab === "settings" && <SettingsManager />}
      </div>
    </EntitySidebarLayout>
  );
};

export default FoundationDashboard;