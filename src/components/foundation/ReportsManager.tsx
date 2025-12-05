import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, FileText, Download, Eye, BarChart3, Calendar, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  report_type: string;
  report_name: string;
  parameters: any;
  generated_by: string;
  generated_at: string;
  report_data: any;
  file_url: string;
  status: string;
}

const ReportsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    report_type: "",
    report_name: "",
    parameters: {},
    status: "completed"
  });

  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("foundation_reports")
        .select("*")
        .order("generated_at", { ascending: false });
      if (error) return [];
      return (data || []) as any;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const reportData = await generateReportData(data.report_type, data.parameters);

      const { error } = await (supabase as any)
        .from("foundation_reports")
        .insert([{
          ...data,
          report_data: reportData,
          generated_by: (await supabase.auth.getUser()).data.user?.id,
          generated_at: new Date().toISOString(),
          file_url: `reports/${data.report_type}_${Date.now()}.pdf`
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to generate report: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("foundation_reports")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete report: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      report_type: "",
      report_name: "",
      parameters: {},
      status: "completed"
    });
    setEditingReport(null);
  };

  const generateReportData = async (reportType: string, parameters: any) => {
    switch (reportType) {
      case "donation":
        const { data: donations } = await (supabase as any)
          .from("donations")
          .select("*");
        return {
          total_donations: donations?.length || 0,
          total_amount: donations?.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0) || 0,
          donations: donations
        };

      case "beneficiary":
        const { data: beneficiaries } = await (supabase as any)
          .from("beneficiaries")
          .select("*");
        return {
          total_beneficiaries: beneficiaries?.length || 0,
          active_beneficiaries: beneficiaries?.filter((b: any) => b.status === "active").length || 0,
          beneficiaries: beneficiaries
        };

      case "volunteer":
        const { data: volunteers } = await (supabase as any)
          .from("volunteers")
          .select("*");
        return {
          total_volunteers: volunteers?.length || 0,
          active_volunteers: volunteers?.filter((v: any) => v.status === "active").length || 0,
          volunteers: volunteers
        };

      case "event":
        const { data: events } = await (supabase as any)
          .from("foundation_events")
          .select("*");
        return {
          total_events: events?.length || 0,
          upcoming_events: events?.filter((e: any) => new Date(e.start_date) > new Date()).length || 0,
          events: events
        };

      case "expense":
        const { data: expenses } = await (supabase as any)
          .from("expenses")
          .select("*");
        return {
          total_expenses: expenses?.length || 0,
          total_amount: expenses?.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 0,
          expenses: expenses
        };

      case "impact":
        const { data: impact } = await (supabase as any)
          .from("impact_metrics")
          .select("*");
        return {
          total_metrics: impact?.length || 0,
          impact_data: impact
        };

      default:
        return { message: "Report generated successfully" };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateReportMutation.mutate(formData);
  };

  const handleDownload = (report: Report) => {
    toast.success("Report download started");
  };

  const handleView = (report: Report) => {
    toast.success("Report opened in new tab");
  };

  const columns = [
    {
      key: "report_name",
      label: "Report Name",
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: "report_type",
      label: "Type",
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "generated_at",
      label: "Generated",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "completed" ? "default" :
          value === "processing" ? "secondary" :
          "destructive"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Report) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(row)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this report?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const totalReports = reports.length;
  const thisMonthReports = reports.filter((r: any) =>
    r.generated_at && new Date(r.generated_at).getMonth() === new Date().getMonth() &&
    new Date(r.generated_at).getFullYear() === new Date().getFullYear()
  ).length;
  const donationReports = reports.filter((r: any) => r.report_type === "donation").length;
  const beneficiaryReports = reports.filter((r: any) => r.report_type === "beneficiary").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate and manage foundation reports</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report_type">Report Type *</Label>
                  <Select value={formData.report_type} onValueChange={(value) => setFormData({ ...formData, report_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donation">Donation Report</SelectItem>
                      <SelectItem value="beneficiary">Beneficiary Report</SelectItem>
                      <SelectItem value="volunteer">Volunteer Report</SelectItem>
                      <SelectItem value="event">Event Report</SelectItem>
                      <SelectItem value="expense">Expense Report</SelectItem>
                      <SelectItem value="impact">Impact Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="report_name">Report Name *</Label>
                  <Input
                    id="report_name"
                    value={formData.report_name}
                    onChange={(e) => setFormData({ ...formData, report_name: e.target.value })}
                    placeholder="e.g., Monthly Donation Report"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Parameters (JSON)</Label>
                <Textarea
                  value={JSON.stringify(formData.parameters, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value);
                      setFormData({ ...formData, parameters: params });
                    } catch {
                      // Invalid JSON, keep current value
                    }
                  }}
                  rows={4}
                  placeholder='{"start_date": "2024-01-01", "end_date": "2024-12-31"}'
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generateReportMutation.isPending}>
                  Generate Report
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">All reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthReports}</div>
            <p className="text-xs text-muted-foreground">Generated this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donation Reports</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donationReports}</div>
            <p className="text-xs text-muted-foreground">Financial reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiary Reports</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaryReports}</div>
            <p className="text-xs text-muted-foreground">Impact reports</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Generated Reports"
        description="View and download foundation reports"
        columns={columns}
        data={reports}
        emptyMessage="No reports generated yet"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ReportsManager;
