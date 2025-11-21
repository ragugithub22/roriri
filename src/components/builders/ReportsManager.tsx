import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, Users, Building2, DollarSign, Package, Calendar } from "lucide-react";
import { toast } from "sonner";

const ReportsManager = () => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["builders-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_projects")
        .select("*")
        .order("project_name");
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
        .select("*");
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
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch labour
  const { data: labour = [] } = useQuery({
    queryKey: ["builders-labour"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_labour")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch materials
  const { data: materials = [] } = useQuery({
    queryKey: ["builders-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_materials")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch financial transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["builders-financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_financial_transactions")
        .select("*");
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
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleExportReport = (reportType: string) => {
    // In a real implementation, this would generate and download the report
    toast.info(`${reportType} report export functionality would be implemented here`);
  };

  const getFilteredData = (data: any[], projectId?: string) => {
    if (!projectId) return data;
    return data.filter(item => item.project_id === projectId);
  };

  // Calculate KPIs
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeSites = sites.filter(s => s.status === 'active').length;
  const activeContractors = contractors.filter(c => c.status === 'active').length;
  const totalClients = clients.length;
  const totalLabour = labour.length;
  const lowStockMaterials = materials.filter(m => (m.current_stock || 0) <= (m.minimum_stock || 0)).length;

  const totalIncome = transactions
    .filter(t => t.transaction_type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netProfit = totalIncome - totalExpenses;

  const reportCards = [
    {
      title: "Project Summary Report",
      description: "Overview of all projects with status and progress",
      icon: Building2,
      color: "from-blue-500 to-cyan-500",
      action: () => handleExportReport("Project Summary")
    },
    {
      title: "Financial Report",
      description: "Income, expenses, and profit/loss analysis",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      action: () => handleExportReport("Financial")
    },
    {
      title: "Labour Report",
      description: "Workforce details and attendance records",
      icon: Users,
      color: "from-purple-500 to-violet-500",
      action: () => handleExportReport("Labour")
    },
    {
      title: "Materials Report",
      description: "Inventory levels and material usage",
      icon: Package,
      color: "from-orange-500 to-red-500",
      action: () => handleExportReport("Materials")
    },
    {
      title: "Site Progress Report",
      description: "Construction site status and updates",
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-500",
      action: () => handleExportReport("Site Progress")
    },
    {
      title: "Client Report",
      description: "Client information and project assignments",
      icon: Users,
      color: "from-pink-500 to-rose-500",
      action: () => handleExportReport("Client")
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate and export various reports for your construction business</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Custom Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From ₹{totalIncome.toLocaleString()} income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Labour</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLabour}</div>
            <p className="text-xs text-muted-foreground">
              {activeContractors} active contractors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockMaterials}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${report.color}`}>
                  <report.icon className="h-5 w-5 text-white" />
                </div>
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {report.description}
              </p>
              <Button onClick={report.action} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeSites}</div>
              <div className="text-sm text-muted-foreground">Active Sites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalClients}</div>
              <div className="text-sm text-muted-foreground">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{materials.length}</div>
              <div className="text-sm text-muted-foreground">Materials</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManager;
