// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Briefcase, Users, DollarSign, TrendingUp, UserCheck, Calendar, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      if (error) throw error;
      return data;
    },
  });

  // Fetch job openings
  const { data: jobOpenings = [] } = useQuery({
    queryKey: ["consultancy-job-openings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_job_openings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch candidates
  const { data: candidates = [] } = useQuery({
    queryKey: ["consultancy-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_candidates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch placements
  const { data: placements = [] } = useQuery({
    queryKey: ["consultancy-placements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_placements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch payments
  const { data: payments = [] } = useQuery({
    queryKey: ["consultancy-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate KPIs
  const activeClients = clients.filter(c => c.status === 'active').length;
  const openJobs = jobOpenings.filter(j => j.status === 'open').length;
  const activeCandidates = candidates.filter(c => c.status === 'new' || c.status === 'shortlisted').length;
  const totalPlacements = placements.filter(p => p.placement_status === 'joined').length;
  const totalRevenue = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + (p.invoice_amount || 0), 0);

  return (
    <DashboardLayout
      entityName="RIYA Consultancy - Super Admin"
      entityIcon={Briefcase}
      entityColor="from-purple-500 to-violet-600"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" orientation="vertical">
        <div className="flex gap-6">
          <TabsList className="flex flex-col h-fit w-48 space-y-1">
            <TabsTrigger value="dashboard" className="w-full justify-start">Dashboard</TabsTrigger>
            <TabsTrigger value="clients" className="w-full justify-start">Clients</TabsTrigger>
            <TabsTrigger value="job-openings" className="w-full justify-start">Job Openings</TabsTrigger>
            <TabsTrigger value="candidates" className="w-full justify-start">Candidates</TabsTrigger>
            <TabsTrigger value="shortlisting" className="w-full justify-start">Shortlisting</TabsTrigger>
            <TabsTrigger value="interviews" className="w-full justify-start">Interviews</TabsTrigger>
            <TabsTrigger value="placements" className="w-full justify-start">Placements</TabsTrigger>
            <TabsTrigger value="payments" className="w-full justify-start">Payments</TabsTrigger>
            <TabsTrigger value="enquiries" className="w-full justify-start">Enquiries</TabsTrigger>
            <TabsTrigger value="documents" className="w-full justify-start">Documents</TabsTrigger>
            <TabsTrigger value="reports" className="w-full justify-start">Reports</TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="dashboard" className="mt-0">
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
            </TabsContent>

            <TabsContent value="clients" className="mt-0">
              <ClientsManager />
            </TabsContent>

            <TabsContent value="job-openings" className="mt-0">
              <JobOpeningsManager />
            </TabsContent>

            <TabsContent value="candidates" className="mt-0">
              <CandidatesManager />
            </TabsContent>

            <TabsContent value="shortlisting" className="mt-0">
              <ShortlistingManager />
            </TabsContent>

            <TabsContent value="interviews" className="mt-0">
              <InterviewsManager />
            </TabsContent>

            <TabsContent value="placements" className="mt-0">
              <PlacementsManager />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsManager />
            </TabsContent>

            <TabsContent value="enquiries" className="mt-0">
              <EnquiriesManager />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <DocumentsManager />
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

export default ConsultancyDashboard;
