// @ts-nocheck
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { Heart, Users, DollarSign, TrendingUp, Plus, FileText, Calendar, UserCheck, Award, BarChart3, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      if (error) throw error;
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
      if (error) throw error;
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
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch volunteers
  const { data: volunteers = [] } = useQuery({
    queryKey: ["volunteers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ["foundation-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foundation_events")
        .select("*")
        .limit(10);
      if (error) throw error;
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

      if (error) throw error;
      return data;
    },
  });

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
    { key: "help_type", label: "Help Type" },
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
  const totalVolunteers = volunteers.length;
  const totalEvents = events.length;

  return (
    <DashboardLayout
      entityName="RORIRI Foundation - Super Admin"
      entityIcon={Heart}
      entityColor="from-pink-500 to-rose-600"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" orientation="vertical">
        <div className="flex gap-6">
          <TabsList className="flex flex-col h-fit w-48 space-y-1">
            <TabsTrigger value="dashboard" className="w-full justify-start">Dashboard</TabsTrigger>
            <TabsTrigger value="beneficiaries" className="w-full justify-start">Beneficiaries</TabsTrigger>
            <TabsTrigger value="volunteers" className="w-full justify-start">Volunteers</TabsTrigger>
            <TabsTrigger value="events" className="w-full justify-start">Events</TabsTrigger>
            <TabsTrigger value="donors" className="w-full justify-start">Donors</TabsTrigger>
            <TabsTrigger value="donations" className="w-full justify-start">Donations</TabsTrigger>
            <TabsTrigger value="expenses" className="w-full justify-start">Expenses</TabsTrigger>
            <TabsTrigger value="announcements" className="w-full justify-start">Announcements</TabsTrigger>
            <TabsTrigger value="certificates" className="w-full justify-start">Certificates</TabsTrigger>
            <TabsTrigger value="reports" className="w-full justify-start">Reports</TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="dashboard" className="mt-0">
              <div className="space-y-6">
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
              </div>
            </TabsContent>

            <TabsContent value="beneficiaries" className="mt-0">
              <BeneficiariesManager />
            </TabsContent>

            <TabsContent value="volunteers" className="mt-0">
              <VolunteersManager />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <EventsManager />
            </TabsContent>

            <TabsContent value="donors" className="mt-0">
              <DonorsManager />
            </TabsContent>

            <TabsContent value="donations" className="mt-0">
              <DonationsManager />
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <ExpensesManager />
            </TabsContent>

            <TabsContent value="announcements" className="mt-0">
              <AnnouncementsManager />
            </TabsContent>

            <TabsContent value="certificates" className="mt-0">
              <CertificatesManager />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <ReportsManager />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <SettingsManager />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </DashboardLayout>
  );
};

export default FoundationDashboard;
