import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";
import { validateForm, getFormString, getFormNumber, getFormInt } from "@/lib/validation";

export default function BookingsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["tours-bookings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_bookings")
        .select(`
          *,
          tours_customers!inner(full_name, phone),
          tours_packages!inner(package_name, destination)
        `)
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["tours-customers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_customers")
        .select("id, full_name, customer_code")
        .eq("status", "active")
        .order("full_name");
      if (error) return [];
      return data || [];
    },
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["tours-packages"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_packages")
        .select("id, package_name, package_code")
        .eq("status", "active")
        .order("package_name");
      if (error) return [];
      return data || [];
    },
  });

  const { data: enquiries = [] } = useQuery({
    queryKey: ["tours-enquiries"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_enquiries")
        .select("id, customer_name, destination")
        .eq("status", "confirmed")
        .order("customer_name");
      if (error) return [];
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      if (editingBooking) {
        const { error } = await (supabase as any)
          .from("tours_bookings")
          .update(bookingData)
          .eq("id", editingBooking.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("tours_bookings")
          .insert(bookingData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingBooking ? "Booking updated" : "Booking created");
      queryClient.invalidateQueries({ queryKey: ["tours-bookings"] });
      setIsOpen(false);
      setEditingBooking(null);
    },
    onError: () => {
      toast.error("Failed to save booking");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("tours_bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-bookings"] });
    },
    onError: () => {
      toast.error("Failed to delete booking");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const bookingCode = getFormString(formData, "booking_code");
    const customerId = getFormString(formData, "customer_id");
    const packageId = getFormString(formData, "package_id");
    const travelDate = getFormString(formData, "travel_date");
    const totalAmount = getFormNumber(formData, "total_amount");

    // Validate form fields
    const isValid = validateForm([
      { value: bookingCode, fieldName: "Booking Code", rules: ["required", { minLength: 2 }] },
      { value: customerId, fieldName: "Customer", rules: ["required"] },
      { value: packageId, fieldName: "Tour Package", rules: ["required"] },
      { value: travelDate, fieldName: "Travel Date", rules: ["required", "date"] },
      { value: totalAmount, fieldName: "Total Amount", rules: ["required", "positiveNumber"] },
    ]);

    if (!isValid) return;

    const bookingData = {
      booking_code: bookingCode,
      customer_id: customerId,
      package_id: packageId,
      enquiry_id: getFormString(formData, "enquiry_id") || null,
      booking_date: getFormString(formData, "booking_date") || new Date().toISOString().split('T')[0],
      travel_date: travelDate,
      return_date: getFormString(formData, "return_date") || null,
      no_of_adults: getFormInt(formData, "no_of_adults") || 1,
      no_of_children: getFormInt(formData, "no_of_children") || 0,
      total_amount: totalAmount,
      advance_amount: getFormNumber(formData, "advance_amount") || 0,
      balance_amount: getFormNumber(formData, "balance_amount") || 0,
      payment_status: getFormString(formData, "payment_status") || "pending",
      booking_status: getFormString(formData, "booking_status") || "confirmed",
      special_requests: getFormString(formData, "special_requests"),
    };
    saveMutation.mutate(bookingData);
  };

  const columns = [
    { key: "booking_code", label: "Booking Code" },
    {
      key: "customer",
      label: "Customer",
      render: (value: any, row: any) => row.tours_customers?.full_name || "-"
    },
    {
      key: "package",
      label: "Package",
      render: (value: any, row: any) => row.tours_packages?.package_name || "-"
    },
    {
      key: "travel_date",
      label: "Travel Date",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "total_amount",
      label: "Total Amount",
      render: (value: any) => `₹${value?.toLocaleString()}`
    },
    {
      key: "payment_status",
      label: "Payment Status",
      render: (value: any) => (
        <Badge variant={value === 'paid' ? 'default' : value === 'partial' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    },
    {
      key: "booking_status",
      label: "Booking Status",
      render: (value: any) => (
        <Badge variant={value === 'confirmed' ? 'default' : value === 'cancelled' ? 'destructive' : 'secondary'}>
          {value}
        </Badge>
      )
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
              setEditingBooking(row);
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
            <CardTitle>Bookings Management</CardTitle>
            <CardDescription>Manage tour bookings and reservations</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBooking(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBooking ? "Edit" : "Add"} Booking</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="booking_code">Booking Code</Label>
                    <Input
                      id="booking_code"
                      name="booking_code"
                      defaultValue={editingBooking?.booking_code}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="booking_date">Booking Date</Label>
                    <Input
                      id="booking_date"
                      name="booking_date"
                      type="date"
                      defaultValue={editingBooking?.booking_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_id">Customer</Label>
                    <Select name="customer_id" defaultValue={editingBooking?.customer_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.full_name} ({customer.customer_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="package_id">Tour Package</Label>
                    <Select name="package_id" defaultValue={editingBooking?.package_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg: any) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.package_name} ({pkg.package_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enquiry_id">Related Enquiry (Optional)</Label>
                    <Select name="enquiry_id" defaultValue={editingBooking?.enquiry_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select enquiry" />
                      </SelectTrigger>
                      <SelectContent>
                        {enquiries.map((enquiry: any) => (
                          <SelectItem key={enquiry.id} value={enquiry.id}>
                            {enquiry.customer_name} - {enquiry.destination}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="travel_date">Travel Date</Label>
                    <Input
                      id="travel_date"
                      name="travel_date"
                      type="date"
                      defaultValue={editingBooking?.travel_date}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="return_date">Return Date</Label>
                    <Input
                      id="return_date"
                      name="return_date"
                      type="date"
                      defaultValue={editingBooking?.return_date}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="no_of_adults">Adults</Label>
                      <Input
                        id="no_of_adults"
                        name="no_of_adults"
                        type="number"
                        defaultValue={editingBooking?.no_of_adults || 1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="no_of_children">Children</Label>
                      <Input
                        id="no_of_children"
                        name="no_of_children"
                        type="number"
                        defaultValue={editingBooking?.no_of_children || 0}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="total_amount">Total Amount (₹)</Label>
                    <Input
                      id="total_amount"
                      name="total_amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingBooking?.total_amount}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="advance_amount">Advance Amount (₹)</Label>
                    <Input
                      id="advance_amount"
                      name="advance_amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingBooking?.advance_amount || 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="balance_amount">Balance Amount (₹)</Label>
                    <Input
                      id="balance_amount"
                      name="balance_amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingBooking?.balance_amount || 0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select name="payment_status" defaultValue={editingBooking?.payment_status || "pending"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="booking_status">Booking Status</Label>
                    <Select name="booking_status" defaultValue={editingBooking?.booking_status || "confirmed"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="special_requests">Special Requests</Label>
                  <Input
                    id="special_requests"
                    name="special_requests"
                    defaultValue={editingBooking?.special_requests}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingBooking ? "Update" : "Create"} Booking
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Bookings"
          description="Manage tour bookings and reservations"
          columns={columns}
          data={bookings}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
