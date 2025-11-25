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
import { Plus, Edit, Trash2, Calendar, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface FarmBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  number_of_guests: number;
  ticket_type: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: number;
  created_at: string;
}

const FarmBookingsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<FarmBooking | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    booking_date: "",
    booking_time: "",
    number_of_guests: "",
    ticket_type: "",
    special_requests: "",
    status: "pending",
    total_amount: ""
  });

  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["farm-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_bookings" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FarmBooking[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("farm_bookings" as any)
        .insert([{
          ...data,
          number_of_guests: parseInt(data.number_of_guests),
          total_amount: parseFloat(data.total_amount)
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-bookings"] });
      toast.success("Booking created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create booking: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("farm_bookings" as any)
        .update({
          ...data,
          number_of_guests: parseInt(data.number_of_guests),
          total_amount: parseFloat(data.total_amount)
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-bookings"] });
      toast.success("Booking updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update booking: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("farm_bookings" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-bookings"] });
      toast.success("Booking deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete booking: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      booking_date: "",
      booking_time: "",
      number_of_guests: "",
      ticket_type: "",
      special_requests: "",
      status: "pending",
      total_amount: ""
    });
    setEditingBooking(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (booking: FarmBooking) => {
    setEditingBooking(booking);
    setFormData({
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      number_of_guests: booking.number_of_guests.toString(),
      ticket_type: booking.ticket_type,
      special_requests: booking.special_requests || "",
      status: booking.status,
      total_amount: booking.total_amount.toString()
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const columns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "customer_email", label: "Email" },
    { key: "booking_date", label: "Date" },
    { key: "booking_time", label: "Time" },
    {
      key: "number_of_guests",
      label: "Guests",
      render: (value: number) => `${value} people`
    },
    { key: "ticket_type", label: "Ticket Type" },
    {
      key: "total_amount",
      label: "Amount",
      render: (value: number) => `₹${value}`
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: FarmBooking) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this booking?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bookings & Reservations</h2>
          <p className="text-muted-foreground">Manage customer bookings and reservations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBooking ? "Edit Booking" : "New Booking"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_phone">Phone *</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="number_of_guests">Number of Guests *</Label>
                  <Input
                    id="number_of_guests"
                    type="number"
                    min="1"
                    value={formData.number_of_guests}
                    onChange={(e) => setFormData({ ...formData, number_of_guests: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="booking_date">Booking Date *</Label>
                  <Input
                    id="booking_date"
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="booking_time">Booking Time *</Label>
                  <Input
                    id="booking_time"
                    type="time"
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticket_type">Ticket Type *</Label>
                  <Input
                    id="ticket_type"
                    value={formData.ticket_type}
                    onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
                    required
                    placeholder="Regular Entry"
                  />
                </div>
                <div>
                  <Label htmlFor="total_amount">Total Amount (₹) *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea
                  id="special_requests"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBooking ? "Update" : "Create"} Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings.length}</div>
            <p className="text-xs text-muted-foreground">Active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From all bookings</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Bookings & Reservations"
        description="Manage customer bookings and track reservation status"
        columns={columns}
        data={bookings}
        emptyMessage="No bookings found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FarmBookingsManager;
