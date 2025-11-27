import { useState, useEffect } from "react";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Building2, Hammer, Users, TrendingUp, MapPin, HardHat, Package, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectsManager from "@/components/builders/ProjectsManager";
import SitesManager from "@/components/builders/SitesManager";
import ContractorsManager from "@/components/builders/ContractorsManager";
import LabourManager from "@/components/builders/LabourManager";
import MaterialsManager from "@/components/builders/MaterialsManager";
import ClientsManager from "@/components/builders/ClientsManager";
import FinanceManager from "@/components/builders/FinanceManager";
import DocumentsManager from "@/components/builders/DocumentsManager";
import ReportsManager from "@/components/builders/ReportsManager";
import UsersRolesManager from "@/components/builders/UsersRolesManager";
import SettingsManager from "@/components/builders/SettingsManager";

const BuildersDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'projects', 'sites', 'contractors', 'labour', 'materials', 'clients', 'finance', 'documents', 'reports', 'users', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["builders-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch sites
  const { data: sites = [] } = useQuery({
    queryKey: ["builders-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_sites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch contractors
  const { data: contractors = [] } = useQuery({
    queryKey: ["builders-contractors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_contractors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ["builders-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch financial transactions
  const { data: financialTransactions = [] } = useQuery({
    queryKey: ["builders-financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_financial_transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate KPIs
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeSites = sites.filter(s => s.status === 'active').length;
  const activeContractors = contractors.filter(c => c.status === 'active').length;
  const totalClients = clients.length;
  const totalRevenue = financialTransactions
    .filter(t => t.transaction_type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <DashboardLayout
      entityName="Roshan Builders - Super Admin"
      entityIcon={Building2}
      entityColor="from-amber-500 to-orange-500"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" orientation="vertical">
        <div className="flex gap-6">
          <TabsList className="flex flex-col h-fit w-48 space-y-1">
            <TabsTrigger value="dashboard" className="w-full justify-start">Dashboard</TabsTrigger>
            <TabsTrigger value="projects" className="w-full justify-start">Projects</TabsTrigger>
            <TabsTrigger value="sites" className="w-full justify-start">Sites</TabsTrigger>
            <TabsTrigger value="contractors" className="w-full justify-start">Contractors</TabsTrigger>
            <TabsTrigger value="labour" className="w-full justify-start">Labour</TabsTrigger>
            <TabsTrigger value="materials" className="w-full justify-start">Materials</TabsTrigger>
            <TabsTrigger value="clients" className="w-full justify-start">Clients</TabsTrigger>
            <TabsTrigger value="finance" className="w-full justify-start">Finance</TabsTrigger>
            <TabsTrigger value="documents" className="w-full justify-start">Documents</TabsTrigger>
            <TabsTrigger value="reports" className="w-full justify-start">Reports</TabsTrigger>
            <TabsTrigger value="users" className="w-full justify-start">Users & Roles</TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="dashboard" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                  title="Active Projects"
                  value={activeProjects}
                  subtitle="Currently in progress"
                  trend={15}
                  icon={Building2}
                  color="from-amber-500 to-orange-500"
                />
                <KPICard
                  title="Active Sites"
                  value={activeSites}
                  subtitle="Construction sites"
                  trend={8}
                  icon={MapPin}
                  color="from-blue-500 to-cyan-500"
                />
                <KPICard
                  title="Active Contractors"
                  value={activeContractors}
                  subtitle="Working contractors"
                  trend={12}
                  icon={HardHat}
                  color="from-green-500 to-emerald-500"
                />
                <KPICard
                  title="Total Clients"
                  value={totalClients}
                  subtitle="Registered clients"
                  trend={25}
                  icon={Users}
                  color="from-purple-500 to-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Completed Projects"
                  value={completedProjects}
                  subtitle="Successfully delivered"
                  trend={18}
                  icon={Hammer}
                  color="from-emerald-500 to-teal-500"
                />
                <KPICard
                  title="Total Revenue"
                  value={`₹${totalRevenue.toLocaleString()}`}
                  subtitle="Total earnings"
                  trend={22}
                  icon={DollarSign}
                  color="from-indigo-500 to-purple-500"
                />
                <KPICard
                  title="Material Stock"
                  value="85%"
                  subtitle="Average stock level"
                  trend={5}
                  icon={Package}
                  color="from-pink-500 to-rose-500"
                />
                <KPICard
                  title="On-Time Delivery"
                  value="92%"
                  subtitle="Project completion rate"
                  trend={3}
                  icon={TrendingUp}
                  color="from-cyan-500 to-blue-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              <ProjectsManager />
            </TabsContent>

            <TabsContent value="sites" className="mt-0">
              <SitesManager />
            </TabsContent>

            <TabsContent value="contractors" className="mt-0">
              <ContractorsManager />
            </TabsContent>

            <TabsContent value="labour" className="mt-0">
              <LabourManager />
            </TabsContent>

            <TabsContent value="materials" className="mt-0">
              <MaterialsManager />
            </TabsContent>

            <TabsContent value="clients" className="mt-0">
              <ClientsManager />
            </TabsContent>

            <TabsContent value="finance" className="mt-0">
              <FinanceManager />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <DocumentsManager />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <ReportsManager />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersRolesManager />
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

export default BuildersDashboard;
