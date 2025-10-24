import { Plane, Users, MapPin, Calendar, PlusCircle, Package, Eye, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import ChartCard from "@/components/dashboard/ChartCard";
import { DataTable } from "@/components/dashboard/DataTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ToursTravelsDashboard = () => {
  // Fetch activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["activity-logs-tours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  const kpis = [
    {
      title: "Total Bookings",
      value: "523",
      change: "+16%",
      trend: 16,
      icon: Calendar,
    },
    {
      title: "Active Tours",
      value: "28",
      change: "+12%",
      trend: 12,
      icon: MapPin,
    },
    {
      title: "Customers",
      value: "1,247",
      change: "+8%",
      trend: 8,
      icon: Users,
    },
    {
      title: "Revenue",
      value: "₹12.5M",
      change: "+22%",
      trend: 22,
      icon: Plane,
    },
  ];

  const bookingData = [
    { month: "Jan", bookings: 42 },
    { month: "Feb", bookings: 38 },
    { month: "Mar", bookings: 52 },
    { month: "Apr", bookings: 61 },
    { month: "May", bookings: 75 },
    { month: "Jun", bookings: 68 },
  ];

  const tourColumns = [
    { key: "name", label: "Tour Package" },
    { key: "destination", label: "Destination" },
    { key: "duration", label: "Duration" },
    { key: "price", label: "Price" },
    { key: "status", label: "Status" },
  ];

  const tourData = [
    { id: "1", name: "Kerala Backwaters Tour", destination: "Kerala", duration: "5 Days", price: "₹25,000", status: "Active" },
    { id: "2", name: "Himalayan Adventure", destination: "Himachal Pradesh", duration: "7 Days", price: "₹35,000", status: "Active" },
    { id: "3", name: "Goa Beach Holiday", destination: "Goa", duration: "4 Days", price: "₹20,000", status: "Active" },
  ];

  const quickActions = [
    { label: "New Booking", icon: PlusCircle, onClick: () => console.log("New Booking") },
    { label: "Add Tour Package", icon: Package, onClick: () => console.log("Add Tour Package") },
    { label: "View Customers", icon: Eye, onClick: () => console.log("View Customers") },
    { label: "Generate Report", icon: FileText, onClick: () => console.log("Generate Report") },
  ];

  return (
    <DashboardLayout
      entityName="Rithish Tours and Travels"
      entityIcon={Plane}
      entityColor="from-sky-400 to-blue-600"
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly Bookings" description="Booking trends over the last 6 months">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ActivityFeed activities={activityLogs} />
        </div>

        {/* Data Table */}
        <DataTable
          title="Tour Packages"
          description="Manage all tour packages and destinations"
          columns={tourColumns}
          data={tourData}
        />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />
      </div>
    </DashboardLayout>
  );
};

export default ToursTravelsDashboard;
