// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Users, Briefcase, DollarSign } from "lucide-react";
import { toast } from "sonner";

const ReportsManager = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ["consultancy-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_clients")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch job openings
  const { data: jobOpenings = [] } = useQuery({
    queryKey: ["consultancy-job-openings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_job_openings" as any)
        .select("*");
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch candidates
  const { data: candidates = [] } = useQuery({
    queryKey: ["consultancy-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_candidates" as any)
        .select("*");
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch placements
  const { data: placements = [] } = useQuery({
    queryKey: ["consultancy-placements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_placements" as any)
        .select("*");
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch payments
  const { data: payments = [] } = useQuery({
    queryKey: ["consultancy-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_payments" as any)
        .select("*");
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch interviews
  const { data: interviews = [] } = useQuery({
    queryKey: ["consultancy-interviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_interviews" as any)
        .select("*");
      if (error) throw error;
      return data as any;
    },
  });

  // Calculate metrics
  const activeClients = clients.filter(c => c.status === 'active').length;
  const openJobs = jobOpenings.filter(j => j.status === 'open').length;
  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(c => c.status === 'new' || c.status === 'shortlisted').length;
  const totalPlacements = placements.filter(p => p.placement_status === 'joined').length;
  const totalRevenue = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + (p.invoice_amount || 0), 0);
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const totalInterviews = interviews.length;

  // Filter data by date range
  const filteredPlacements = placements.filter(p => {
    const placementDate = new Date(p.placement_date);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return placementDate >= start && placementDate <= end;
  });

  const filteredPayments = payments.filter(p => {
    const paymentDate = new Date(p.payment_date || p.invoice_date);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return paymentDate >= start && paymentDate <= end;
  });

  const handleExportReport = (reportType: string) => {
    // In a real implementation, this would generate and download a report
    toast.success(`${reportType} report exported successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into consultancy operations</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select date range for reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setDateRange({
                    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                  });
                }}
                variant="outline"
              >
                Reset to Current Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">Current partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs}</div>
            <p className="text-xs text-muted-foreground">Available jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Placements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlacements}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCandidates > 0 ? Math.round((totalPlacements / totalCandidates) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCandidates}</div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>Generate and download detailed reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => handleExportReport("Client Report")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Client Report
            </Button>
            <Button
              onClick={() => handleExportReport("Candidate Report")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Candidate Report
            </Button>
            <Button
              onClick={() => handleExportReport("Placement Report")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Placement Report
            </Button>
            <Button
              onClick={() => handleExportReport("Revenue Report")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Revenue Report
            </Button>
            <Button
              onClick={() => handleExportReport("Performance Report")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Performance Report
            </Button>
            <Button
              onClick={() => handleExportReport("Comprehensive Report")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Comprehensive Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Period Summary ({dateRange.start} to {dateRange.end})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Placements in period:</span>
              <span className="font-medium">{filteredPlacements.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue in period:</span>
              <span className="font-medium">
                ₹{filteredPayments
                  .filter(p => p.payment_status === 'paid')
                  .reduce((sum, p) => sum + (p.invoice_amount || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Interviews conducted:</span>
              <span className="font-medium">
                {interviews.filter(i => {
                  const interviewDate = new Date(i.scheduled_date);
                  const start = new Date(dateRange.start);
                  const end = new Date(dateRange.end);
                  return interviewDate >= start && interviewDate <= end && i.status === 'completed';
                }).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Candidates by status:</span>
              <div className="text-right">
                <div className="text-sm">New: {candidates.filter(c => c.status === 'new').length}</div>
                <div className="text-sm">Shortlisted: {candidates.filter(c => c.status === 'shortlisted').length}</div>
                <div className="text-sm">Selected: {candidates.filter(c => c.status === 'selected').length}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Jobs by status:</span>
              <div className="text-right">
                <div className="text-sm">Open: {jobOpenings.filter(j => j.status === 'open').length}</div>
                <div className="text-sm">Closed: {jobOpenings.filter(j => j.status === 'closed').length}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Payments status:</span>
              <div className="text-right">
                <div className="text-sm">Paid: {payments.filter(p => p.payment_status === 'paid').length}</div>
                <div className="text-sm">Pending: {payments.filter(p => p.payment_status === 'pending').length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsManager;
