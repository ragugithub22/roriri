import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EntitySidebarLayout, { SidebarNavItem } from "@/components/layouts/EntitySidebarLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Building2, Hammer, Users, TrendingUp, MapPin, HardHat, Package, DollarSign, Home, FileText, Settings, BarChart3, Users2 } from "lucide-react";
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

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", value: "dashboard", icon: Home },
  { label: "Projects", value: "projects", icon: Building2 },
  { label: "Sites", value: "sites", icon: MapPin },
  { label: "Contractors", value: "contractors", icon: HardHat },
  { label: "Labour", value: "labour", icon: Users },
  { label: "Materials", value: "materials", icon: Package },
  { label: "Clients", value: "clients", icon: Users2 },
  { label: "Finance", value: "finance", icon: DollarSign },
  { label: "Documents", value: "documents", icon: FileText },
  { label: "Reports", value: "reports", icon: BarChart3 },
  { label: "Users & Roles", value: "users", icon: Users },
  { label: "Settings", value: "settings", icon: Settings },
];

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
    <EntitySidebarLayout
      entityName="Roshan Builders"
      entityIcon={Building2}
      navItems={navItems}
      activeItem={activeTab}
      onItemChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === "dashboard" && (
          <>
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
          </>
        )}

        {activeTab === "projects" && <ProjectsManager />}
        {activeTab === "sites" && <SitesManager />}
        {activeTab === "contractors" && <ContractorsManager />}
        {activeTab === "labour" && <LabourManager />}
        {activeTab === "materials" && <MaterialsManager />}
        {activeTab === "clients" && <ClientsManager />}
        {activeTab === "finance" && <FinanceManager />}
        {activeTab === "documents" && <DocumentsManager />}
        {activeTab === "reports" && <ReportsManager />}
        {activeTab === "users" && <UsersRolesManager />}
        {activeTab === "settings" && <SettingsManager />}
      </div>
    </EntitySidebarLayout>
  );
};

export default BuildersDashboard;
