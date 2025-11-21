import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { MapPin, Users, Car, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import all the manager components
import TourPackagesManager from "@/components/tours-travels/TourPackagesManager";
import CustomersManager from "@/components/tours-travels/CustomersManager";
import EnquiriesManager from "@/components/tours-travels/EnquiriesManager";
import BookingsManager from "@/components/tours-travels/BookingsManager";
import TripManagementManager from "@/components/tours-travels/TripManagementManager";
import VehicleManagementManager from "@/components/tours-travels/VehicleManagementManager";
import DriverManagementManager from "@/components/tours-travels/DriverManagementManager";
import QuotationsManager from "@/components/tours-travels/QuotationsManager";
import PaymentsManager from "@/components/tours-travels/PaymentsManager";
import ExpensesManager from "@/components/tours-travels/ExpensesManager";
import ReportsManager from "@/components/tours-travels/ReportsManager";
import SettingsManager from "@/components/tours-travels/SettingsManager";

const ToursTravelsDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'packages', 'customers', 'enquiries', 'bookings', 'trips', 'vehicles', 'drivers', 'quotations', 'payments', 'expenses', 'reports', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["tours-dashboard-stats"],
    queryFn: async () => {
      const [
        { count: totalBookings },
        { count: totalCustomers },
        { count: totalVehicles },
        { count: activeTrips },
        { data: revenue }
      ] = await Promise.all([
        supabase.from("tours_bookings").select("*", { count: 'exact', head: true }),
        supabase.from("tours_customers").select("*", { count: 'exact', head: true }),
        supabase.from("tours_vehicles").select("*", { count: 'exact', head: true }),
        supabase.from("tours_trip_management").select("*", { count: 'exact', head: true }).eq("trip_status", "ongoing"),
        supabase.from("tours_payments").select("amount").eq("payment_status", "completed")
      ]);

      const totalRevenue = revenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      return {
        totalBookings,
        totalCustomers,
        totalVehicles,
        activeTrips,
        totalRevenue
      };
    },
  });

  // Fetch recent bookings for dashboard
  const { data: recentBookings = [] } = useQuery({
    queryKey: ["tours-recent-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_bookings")
        .select(`
          *,
          tours_customers!inner(customer_name),
          tours_packages!inner(package_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Fetch active trips for dashboard
  const { data: activeTrips = [] } = useQuery({
    queryKey: ["tours-active-trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_trip_management")
        .select(`
          *,
          tours_vehicles!inner(vehicle_number),
          tours_drivers!inner(driver_name)
        `)
        .eq("trip_status", "ongoing")
        .order("start_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout
      entityName="RITHISH Tours & Travels - Super Admin"
      entityIcon={MapPin}
      entityColor="from-green-500 to-emerald-600"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" orientation="vertical">
        <div className="flex gap-6">
          <TabsList className="flex flex-col h-fit w-48 space-y-1">
            <TabsTrigger value="dashboard" className="w-full justify-start">Dashboard</TabsTrigger>
            <TabsTrigger value="packages" className="w-full justify-start">Tour Packages</TabsTrigger>
            <TabsTrigger value="customers" className="w-full justify-start">Customers</TabsTrigger>
            <TabsTrigger value="enquiries" className="w-full justify-start">Enquiries</TabsTrigger>
            <TabsTrigger value="bookings" className="w-full justify-start">Bookings</TabsTrigger>
            <TabsTrigger value="trips" className="w-full justify-start">Trip Management</TabsTrigger>
            <TabsTrigger value="vehicles" className="w-full justify-start">Vehicles</TabsTrigger>
            <TabsTrigger value="drivers" className="w-full justify-start">Drivers</TabsTrigger>
            <TabsTrigger value="quotations" className="w-full justify-start">Quotations</TabsTrigger>
            <TabsTrigger value="payments" className="w-full justify-start">Payments</TabsTrigger>
            <TabsTrigger value="expenses" className="w-full justify-start">Expenses</TabsTrigger>
            <TabsTrigger value="reports" className="w-full justify-start">Reports</TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="dashboard" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                  title="Total Bookings"
                  value={stats?.totalBookings || 0}
                  subtitle="All time bookings"
                  icon={Calendar}
                  color="from-blue-500 to-indigo-600"
                />
                <KPICard
                  title="Active Customers"
                  value={stats?.totalCustomers || 0}
                  subtitle="Registered customers"
                  icon={Users}
                  color="from-green-500 to-emerald-600"
                />
                <KPICard
                  title="Fleet Size"
                  value={stats?.totalVehicles || 0}
                  subtitle="Available vehicles"
                  icon={Car}
                  color="from-purple-500 to-violet-600"
                />
                <KPICard
                  title="Active Trips"
                  value={stats?.activeTrips || 0}
                  subtitle="Currently running"
                  icon={MapPin}
                  color="from-orange-500 to-amber-600"
                />
                <KPICard
                  title="Total Revenue"
                  value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                  subtitle="Completed payments"
                  icon={DollarSign}
                  color="from-teal-500 to-cyan-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Bookings</CardTitle>
                      <CardDescription>Latest booking activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentBookings.length > 0 ? (
                          recentBookings.map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium">{booking.tours_customers.customer_name}</p>
                                <p className="text-sm text-muted-foreground">{booking.tours_packages.package_name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{booking.total_amount?.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No recent bookings
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Trips</CardTitle>
                      <CardDescription>Currently running trips</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activeTrips.length > 0 ? (
                          activeTrips.map((trip: any) => (
                            <div key={trip.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium">{trip.tours_vehicles.vehicle_number}</p>
                                <p className="text-sm text-muted-foreground">{trip.tours_drivers.driver_name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{trip.trip_status}</p>
                                <p className="text-sm text-muted-foreground">{new Date(trip.start_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No active trips
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packages" className="mt-0">
              <TourPackagesManager />
            </TabsContent>

            <TabsContent value="customers" className="mt-0">
              <CustomersManager />
            </TabsContent>

            <TabsContent value="enquiries" className="mt-0">
              <EnquiriesManager />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <BookingsManager />
            </TabsContent>

            <TabsContent value="trips" className="mt-0">
              <TripManagementManager />
            </TabsContent>

            <TabsContent value="vehicles" className="mt-0">
              <VehicleManagementManager />
            </TabsContent>

            <TabsContent value="drivers" className="mt-0">
              <DriverManagementManager />
            </TabsContent>

            <TabsContent value="quotations" className="mt-0">
              <QuotationsManager />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsManager />
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <ExpensesManager />
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

export default ToursTravelsDashboard;
