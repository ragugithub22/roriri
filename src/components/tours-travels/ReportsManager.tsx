import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Download, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function ReportsManager() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: bookingStats = [], isLoading: bookingLoading } = useQuery({
    queryKey: ["tours-booking-stats", dateRange],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_bookings")
        .select("total_amount, booking_status, created_at")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);
      if (error) return [];
      return data || [];
    },
  });

  const { data: paymentStats = [], isLoading: paymentLoading } = useQuery({
    queryKey: ["tours-payment-stats", dateRange],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_payments")
        .select("amount, payment_status, payment_date")
        .gte("payment_date", dateRange.start)
        .lte("payment_date", dateRange.end);
      if (error) return [];
      return data || [];
    },
  });

  const { data: expenseStats = [], isLoading: expenseLoading } = useQuery({
    queryKey: ["tours-expense-stats", dateRange],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_expenses")
        .select("amount, category, expense_date")
        .gte("expense_date", dateRange.start)
        .lte("expense_date", dateRange.end);
      if (error) return [];
      return data || [];
    },
  });

  const { data: enquiryStats = [], isLoading: enquiryLoading } = useQuery({
    queryKey: ["tours-enquiry-stats", dateRange],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_enquiries")
        .select("status, created_at")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);
      if (error) return [];
      return data || [];
    },
  });

  const calculateStats = () => {
    const totalBookings = bookingStats?.length || 0;
    const confirmedBookings = bookingStats?.filter((b: any) => b.booking_status === 'confirmed').length || 0;
    const totalRevenue = bookingStats?.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0) || 0;
    const totalPayments = paymentStats?.filter((p: any) => p.payment_status === 'completed').reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0) || 0;
    const totalExpenses = expenseStats?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0;
    const totalEnquiries = enquiryStats?.length || 0;
    const convertedEnquiries = enquiryStats?.filter((e: any) => e.status === 'confirmed').length || 0;

    return {
      totalBookings,
      confirmedBookings,
      totalRevenue,
      totalPayments,
      totalExpenses,
      netProfit: totalPayments - totalExpenses,
      totalEnquiries,
      convertedEnquiries,
      conversionRate: totalEnquiries > 0 ? ((convertedEnquiries / totalEnquiries) * 100).toFixed(1) : 0
    };
  };

  const stats = calculateStats();

  const exportReport = () => {
    const reportData = {
      dateRange,
      stats,
      bookingStats,
      paymentStats,
      expenseStats,
      enquiryStats
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tours-report-${dateRange.start}-to-${dateRange.end}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Report exported successfully");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Comprehensive tour business analytics and insights</CardDescription>
            </div>
            <Button onClick={exportReport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">{stats.confirmedBookings} confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">₹{stats.totalPayments.toLocaleString()} received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Operating costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{stats.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enquiry Conversion</CardTitle>
            <CardDescription>Lead conversion statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Enquiries</span>
                <Badge variant="outline">{stats.totalEnquiries}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Converted</span>
                <Badge variant="default">{stats.convertedEnquiries}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <Badge variant="secondary">{stats.conversionRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Payment collection overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Expected</span>
                <Badge variant="outline">₹{stats.totalRevenue.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Received</span>
                <Badge variant="default">₹{stats.totalPayments.toLocaleString()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="secondary">₹{(stats.totalRevenue - stats.totalPayments).toLocaleString()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Category</CardTitle>
          <CardDescription>Expenses categorized for better insights</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                expenseStats?.reduce((acc: any, expense: any) => {
                  acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
                  return acc;
                }, {}) || {}
              ).map(([category, amount]: [string, any]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
                  <Badge variant="outline">₹{amount.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}