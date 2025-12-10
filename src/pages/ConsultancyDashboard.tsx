import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EntitySidebarLayout, { SidebarNavItem } from "@/components/layouts/EntitySidebarLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Briefcase, Users, DollarSign, TrendingUp, UserCheck, Calendar, Award, Home, FileText, Settings, BarChart3, Users2, Clipboard, MessageSquare } from "lucide-react";
import ClientsManager from "@/components/consultancy/ClientsManager";
import JobOpeningsManager from "@/components/consultancy/JobOpeningsManager";
import CandidatesManager from "@/components/consultancy/CandidatesManager";
import ShortlistingManager from "@/components/consultancy/ShortlistingManager";
import InterviewsManager from "@/components/consultancy/InterviewsManager";
import PlacementsManager from "@/components/consultancy/PlacementsManager";
import PaymentsManager from "@/components/consultancy/PaymentsManager";
import EnquiriesManager from "@/components/consultancy/EnquiriesManager";
import DocumentsManager from "@/components/consultancy/DocumentsManager";
import ReportsManager from "@/components/consultancy/ReportsManager";
import SettingsManager from "@/components/consultancy/SettingsManager";

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", value: "dashboard", icon: Home },
  { label: "Clients", value: "clients", icon: Users },
  { label: "Job Openings", value: "job-openings", icon: Briefcase },
  { label: "Candidates", value: "candidates", icon: Users2 },
  { label: "Shortlisting", value: "shortlisting", icon: Clipboard },
  { label: "Interviews", value: "interviews", icon: MessageSquare },
  { label: "Placements", value: "placements", icon: Award },
  { label: "Payments", value: "payments", icon: DollarSign },
  { label: "Enquiries", value: "enquiries", icon: Calendar },
  { label: "Documents", value: "documents", icon: FileText },
  { label: "Reports", value: "reports", icon: BarChart3 },
  { label: "Settings", value: "settings", icon: Settings },
];

const ConsultancyDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'clients', 'job-openings', 'candidates', 'shortlisting', 'interviews', 'placements', 'payments', 'enquiries', 'documents', 'reports', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ["consultancy-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  // Placeholder KPIs since some consultancy tables don't exist
  const activeClients = clients.filter((c: any) => c.status === 'active').length;
  const openJobs = 0;
  const activeCandidates = 0;
  const totalPlacements = 0;
  const totalRevenue = 0;

  return (
    <EntitySidebarLayout
      entityName="RIYA Consultancy"
      entityIcon={Briefcase}
      navItems={navItems}
      activeItem={activeTab}
      onItemChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Active Clients"
                value={activeClients}
                subtitle="Current partnerships"
                trend={15}
                icon={Users}
                color="from-purple-500 to-violet-500"
              />
              <KPICard
                title="Open Positions"
                value={openJobs}
                subtitle="Available jobs"
                trend={8}
                icon={Briefcase}
                color="from-blue-500 to-cyan-500"
              />
              <KPICard
                title="Active Candidates"
                value={activeCandidates}
                subtitle="In pipeline"
                trend={12}
                icon={UserCheck}
                color="from-green-500 to-emerald-500"
              />
              <KPICard
                title="Successful Placements"
                value={totalPlacements}
                subtitle="This year"
                trend={25}
                icon={Award}
                color="from-orange-500 to-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Revenue Generated"
                value={`₹${totalRevenue.toLocaleString()}`}
                subtitle="Total earnings"
                trend={18}
                icon={DollarSign}
                color="from-emerald-500 to-teal-500"
              />
              <KPICard
                title="Interview Success Rate"
                value="78%"
                subtitle="Conversion rate"
                trend={5}
                icon={Calendar}
                color="from-indigo-500 to-purple-500"
              />
              <KPICard
                title="Client Satisfaction"
                value="94%"
                subtitle="Average rating"
                trend={3}
                icon={TrendingUp}
                color="from-pink-500 to-rose-500"
              />
              <KPICard
                title="Time to Hire"
                value="18 days"
                subtitle="Average duration"
                trend={-8}
                icon={Briefcase}
                color="from-cyan-500 to-blue-500"
              />
            </div>
          </>
        )}

        {activeTab === "clients" && <ClientsManager />}
        {activeTab === "job-openings" && <JobOpeningsManager />}
        {activeTab === "candidates" && <CandidatesManager />}
        {activeTab === "shortlisting" && <ShortlistingManager />}
        {activeTab === "interviews" && <InterviewsManager />}
        {activeTab === "placements" && <PlacementsManager />}
        {activeTab === "payments" && <PaymentsManager />}
        {activeTab === "enquiries" && <EnquiriesManager />}
        {activeTab === "documents" && <DocumentsManager />}
        {activeTab === "reports" && <ReportsManager />}
        {activeTab === "settings" && <SettingsManager />}
      </div>
    </EntitySidebarLayout>
  );
};

export default ConsultancyDashboard;