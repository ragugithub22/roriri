import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, MapPin, Clock, Car } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function TripManagementManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["tours-trip-management"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_trip_management")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["tours-bookings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_bookings")
        .select("id, booking_code")
        .order("booking_code");
      if (error) return [];
      return data || [];
    },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["tours-vehicles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_vehicles")
        .select("id, vehicle_code, registration_number, vehicle_type")
        .order("vehicle_code");
      if (error) return [];
      return data || [];
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["tours-drivers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_drivers")
        .select("id, full_name, driver_code, phone")
        .order("full_name");
      if (error) return [];
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (tripData: any) => {
      if (editingTrip) {
        const { error } = await (supabase as any)
          .from("tours_trip_management")
          .update(tripData)
          .eq("id", editingTrip.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("tours_trip_management")
          .insert(tripData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingTrip ? "Trip updated" : "Trip created");
      queryClient.invalidateQueries({ queryKey: ["tours-trip-management"] });
      setIsOpen(false);
      setEditingTrip(null);
    },
    onError: () => {
      toast.error("Failed to save trip");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("tours_trip_management").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trip deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-trip-management"] });
    },
    onError: () => {
      toast.error("Failed to delete trip");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tripData = {
      booking_id: formData.get("booking_id"),
      trip_status: formData.get("trip_status"),
      departure_date: formData.get("departure_date"),
      return_date: formData.get("return_date"),
      assigned_driver_id: formData.get("assigned_driver_id") || null,
      assigned_vehicle_id: formData.get("assigned_vehicle_id") || null,
      pickup_location: formData.get("pickup_location"),
      pickup_time: formData.get("pickup_time"),
      drop_location: formData.get("drop_location"),
      actual_departure_time: formData.get("actual_departure_time") || null,
      actual_return_time: formData.get("actual_return_time") || null,
      trip_notes: formData.get("trip_notes"),
    };
    saveMutation.mutate(tripData);
  };

  const columns = [
    {
      key: "booking_id",
      label: "Booking",
      render: (value: any) => {
        const booking = bookings.find((b: any) => b.id === value);
        return booking?.booking_code || "-";
      }
    },
    {
      key: "departure_date",
      label: "Departure Date",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "pickup_location",
      label: "Pickup Location",
      render: (value: any) => value || "-"
    },
    {
      key: "trip_status",
      label: "Status",
      render: (value: any) => {
        const variants: Record<string, any> = {
          planned: "outline",
          ongoing: "default",
          completed: "default",
          cancelled: "destructive"
        };
        return (
          <Badge variant={variants[value] || "secondary"}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingTrip(row);
              setIsOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Trip Management</CardTitle>
            <CardDescription>Manage trip assignments, vehicles, and drivers</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTrip(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTrip ? "Edit" : "Add"} Trip</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="booking_id">Booking</Label>
                    <Select name="booking_id" defaultValue={editingTrip?.booking_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookings.map((booking: any) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.booking_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trip_status">Trip Status</Label>
                    <Select name="trip_status" defaultValue={editingTrip?.trip_status || "planned"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departure_date">Departure Date</Label>
                    <Input
                      id="departure_date"
                      name="departure_date"
                      type="date"
                      defaultValue={editingTrip?.departure_date}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_date">Return Date</Label>
                    <Input
                      id="return_date"
                      name="return_date"
                      type="date"
                      defaultValue={editingTrip?.return_date}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assigned_vehicle_id">Vehicle</Label>
                    <Select name="assigned_vehicle_id" defaultValue={editingTrip?.assigned_vehicle_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.registration_number} ({vehicle.vehicle_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assigned_driver_id">Driver</Label>
                    <Select name="assigned_driver_id" defaultValue={editingTrip?.assigned_driver_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver: any) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.full_name} ({driver.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickup_location">Pickup Location</Label>
                    <Input
                      id="pickup_location"
                      name="pickup_location"
                      defaultValue={editingTrip?.pickup_location}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup_time">Pickup Time</Label>
                    <Input
                      id="pickup_time"
                      name="pickup_time"
                      type="time"
                      defaultValue={editingTrip?.pickup_time}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="drop_location">Drop Location</Label>
                    <Input
                      id="drop_location"
                      name="drop_location"
                      defaultValue={editingTrip?.drop_location}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="actual_departure_time">Actual Departure</Label>
                      <Input
                        id="actual_departure_time"
                        name="actual_departure_time"
                        type="time"
                        defaultValue={editingTrip?.actual_departure_time}
                      />
                    </div>
                    <div>
                      <Label htmlFor="actual_return_time">Actual Return</Label>
                      <Input
                        id="actual_return_time"
                        name="actual_return_time"
                        type="time"
                        defaultValue={editingTrip?.actual_return_time}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="trip_notes">Trip Notes</Label>
                  <Textarea
                    id="trip_notes"
                    name="trip_notes"
                    defaultValue={editingTrip?.trip_notes}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingTrip ? "Update" : "Create"} Trip
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Trip Management"
          description="Manage trip assignments and logistics"
          columns={columns}
          data={trips}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}