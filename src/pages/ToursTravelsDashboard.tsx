import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EntitySidebarLayout, { SidebarNavItem } from "@/components/layouts/EntitySidebarLayout";
import KPICard from "@/components/dashboard/KPICard";
import { MapPin, Users, Car, DollarSign, Calendar, TrendingUp, Home, Package, HelpCircle, BookOpen, Truck, UserCheck, FileText, Settings, BarChart3, CreditCard } from "lucide-react";
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

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", value: "dashboard", icon: Home },
  { label: "Tour Packages", value: "packages", icon: Package },
  { label: "Customers", value: "customers", icon: Users },
  { label: "Enquiries", value: "enquiries", icon: HelpCircle },
  { label: "Bookings", value: "bookings", icon: BookOpen },
  { label: "Trip Management", value: "trips", icon: Truck },
  { label: "Vehicles", value: "vehicles", icon: Car },
  { label: "Drivers", value: "drivers", icon: UserCheck },
  { label: "Quotations", value: "quotations", icon: FileText },
  { label: "Payments", value: "payments", icon: CreditCard },
  { label: "Expenses", value: "expenses", icon: DollarSign },
  { label: "Reports", value: "reports", icon: BarChart3 },
  { label: "Settings", value: "settings", icon: Settings },
];

const ToursTravelsDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'packages', 'customers', 'enquiries', 'bookings', 'trips', 'vehicles', 'drivers', 'quotations', 'payments', 'expenses', 'reports', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Placeholder stats since tours tables don't exist
  const stats = {
    totalBookings: 0,
    totalCustomers: 0,
    totalVehicles: 0,
    activeTrips: 0,
    totalRevenue: 0
  };

  // Placeholder data
  const recentBookings: any[] = [];
  const activeTripsData: any[] = [];

  return (
    <EntitySidebarLayout
      entityName="RITHISH Tours & Travels"
      entityIcon={MapPin}
      navItems={navItems}
      activeItem={activeTab}
      onItemChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Total Bookings"
                value={stats.totalBookings}
                subtitle="All time bookings"
                icon={Calendar}
                color="from-blue-500 to-indigo-600"
              />
              <KPICard
                title="Active Customers"
                value={stats.totalCustomers}
                subtitle="Registered customers"
                icon={Users}
                color="from-green-500 to-emerald-600"
              />
              <KPICard
                title="Fleet Size"
                value={stats.totalVehicles}
                subtitle="Available vehicles"
                icon={Car}
                color="from-purple-500 to-violet-600"
              />
              <KPICard
                title="Active Trips"
                value={stats.activeTrips}
                subtitle="Currently running"
                icon={MapPin}
                color="from-orange-500 to-amber-600"
              />
              <KPICard
                title="Total Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
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
                              <p className="font-medium">{booking.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{booking.package_name}</p>
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
                      {activeTripsData.length > 0 ? (
                        activeTripsData.map((trip: any) => (
                          <div key={trip.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{trip.vehicle_number}</p>
                              <p className="text-sm text-muted-foreground">{trip.driver_name}</p>
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
          </>
        )}

        {activeTab === "packages" && <TourPackagesManager />}
        {activeTab === "customers" && <CustomersManager />}
        {activeTab === "enquiries" && <EnquiriesManager />}
        {activeTab === "bookings" && <BookingsManager />}
        {activeTab === "trips" && <TripManagementManager />}
        {activeTab === "vehicles" && <VehicleManagementManager />}
        {activeTab === "drivers" && <DriverManagementManager />}
        {activeTab === "quotations" && <QuotationsManager />}
        {activeTab === "payments" && <PaymentsManager />}
        {activeTab === "expenses" && <ExpensesManager />}
        {activeTab === "reports" && <ReportsManager />}
        {activeTab === "settings" && <SettingsManager />}
      </div>
    </EntitySidebarLayout>
  );
};

export default ToursTravelsDashboard;