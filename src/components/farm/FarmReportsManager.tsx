// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Download, FileText, TrendingUp, Users, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  totalVisitors: number;
  totalRevenue: number;
  totalEvents: number;
  totalBookings: number;
  dailyStats: any[];
  monthlyStats: any[];
  eventStats: any[];
  paymentStats: any[];
}

const FarmReportsManager = () => {
  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["farm-reports", reportType, dateRange],
    queryFn: async () => {
      // Get visitor entries
      const { data: visitors, error: visitorsError } = await supabase
        .from("farm_visitors" as any)
        .select("*")
        .gte("entry_time", dateRange.start)
        .lte("entry_time", dateRange.end);

      if (visitorsError) throw visitorsError;

      // Get payments
      const { data: payments, error: paymentsError } = await supabase
        .from("farm_payments" as any)
        .select("*")
        .gte("payment_date", dateRange.start)
        .lte("payment_date", dateRange.end);

      if (paymentsError) throw paymentsError;

      // Get events
      const { data: events, error: eventsError } = await supabase
        .from("farm_events" as any)
        .select("*");

      if (eventsError) throw eventsError;

      // Get bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("farm_bookings" as any)
        .select("*")
        .gte("booking_date", dateRange.start)
        .lte("booking_date", dateRange.end);

      if (bookingsError) throw bookingsError;

      // Calculate stats
      const totalVisitors = (visitors as any)?.length || 0;
      const totalRevenue = (payments as any)?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
      const totalEvents = (events as any)?.length || 0;
      const totalBookings = (bookings as any)?.length || 0;

      // Group by date for daily stats
      const dailyStats = (visitors as any)?.reduce((acc: any, visitor: any) => {
        const date = new Date(visitor.entry_time).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, visitors: 0, revenue: 0 };
        }
        acc[date].visitors += (visitor.adults_count || 0) + (visitor.kids_count || 0);
        acc[date].revenue += visitor.ticket_price || 0;
        return acc;
      }, {}) || {};

      return {
        totalVisitors,
        totalRevenue,
        totalEvents,
        totalBookings,
        dailyStats: Object.values(dailyStats),
        visitors: visitors || [],
        payments: payments || [],
        events: events || [],
        bookings: bookings || []
      } as ReportData & { visitors: any[], payments: any[], events: any[], bookings: any[] };
    },
  });

  const exportReport = () => {
    if (!reportData) return;

    const csvData = [
      ["Date Range", `${dateRange.start} to ${dateRange.end}`],
      ["Total Visitors", reportData.totalVisitors],
      ["Total Revenue", `₹${reportData.totalRevenue}`],
      ["Total Events", reportData.totalEvents],
      ["Total Bookings", reportData.totalBookings],
      [],
      ["Daily Statistics"],
      ["Date", "Visitors", "Revenue"],
      ...reportData.dailyStats.map((stat: any) => [stat.date, stat.visitors, `₹${stat.revenue}`]),
      [],
      ["Visitor Details"],
      ["Ticket Number", "Name", "Mobile", "Adults", "Kids", "Entry Time", "Amount"],
      ...reportData.visitors.map(v => [
        v.ticket_number,
        v.visitor_name,
        v.mobile,
        v.adults_count,
        v.kids_count,
        new Date(v.entry_time).toLocaleString(),
        `₹${v.ticket_price}`
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `farm-report-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  const columns = [
    {
      key: "ticket_number",
      label: "Ticket Number",
      render: (value: string) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: "visitor_name",
      label: "Visitor Name"
    },
    {
      key: "mobile",
      label: "Mobile"
    },
    {
      key: "adults_count",
      label: "Adults"
    },
    {
      key: "kids_count",
      label: "Kids"
    },
    {
      key: "entry_time",
      label: "Entry Time",
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      key: "ticket_price",
      label: "Amount",
      render: (value: number) => `₹${value}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Farm Reports</h2>
          <p className="text-muted-foreground">Generate and export comprehensive farm reports</p>
        </div>
        <Button onClick={exportReport} disabled={!reportData}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Statistics</SelectItem>
                  <SelectItem value="visitors">Visitor Details</SelectItem>
                  <SelectItem value="payments">Payment Records</SelectItem>
                  <SelectItem value="events">Event Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.totalVisitors || 0}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(reportData?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Active events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">Advance bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        title="Report Data"
        description={`Detailed ${reportType} report for the selected period`}
        columns={columns}
        data={reportData?.visitors || []}
        emptyMessage="No data found for the selected period"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FarmReportsManager;
