import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, Users, CreditCard, Ticket, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface FarmVisitor {
  id: string;
  ticket_number: string;
  visitor_name: string;
  mobile: string;
  adults_count: number;
  kids_count: number;
  entry_type: string;
  event_id?: string;
  ticket_price: number;
  payment_status: string;
  entry_time: string;
  created_at: string;
}

const FarmVisitorEntryManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<FarmVisitor | null>(null);
  const [formData, setFormData] = useState({
    visitor_name: "",
    mobile: "",
    adults_count: "1",
    kids_count: "0",
    entry_type: "single",
    event_id: "",
    ticket_price: "",
    payment_status: "pending"
  });

  const queryClient = useQueryClient();

  const { data: visitors = [], isLoading } = useQuery({
    queryKey: ["farm-visitors"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("farm_visitors")
        .select(`
          *,
          farm_events(title)
        `)
        .order("entry_time", { ascending: false });
      if (error) throw error;
      return data as (FarmVisitor & { farm_events?: { title: string } })[];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["farm-events-active"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await (supabase as any)
        .from("farm_events")
        .select("id, title, event_date, ticket_price")
        .gte("event_date", today)
        .eq("status", "active")
        .order("event_date");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: ticketSettings = [] } = useQuery({
    queryKey: ["farm-tickets"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("farm_tickets")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Generate ticket number
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const timestamp = Date.now().toString().slice(-4);
      const ticketNumber = `RF${today}${timestamp}`;

      // Calculate ticket price based on type and counts
      let basePrice = 0;
      if (data.entry_type === "single") {
      const selectedTicket = ticketSettings.find((t: any) => t.ticket_type === "Regular Entry");
      const basePrice = (selectedTicket as any) ? (selectedTicket as any).adult_price : 100;
      } else if (data.entry_type === "family") {
      const selectedTicket = ticketSettings.find((t: any) => t.ticket_type === "Family Package");
      const basePrice = (selectedTicket as any) ? (selectedTicket as any).adult_price : 300;
      }

      const adults = parseInt(data.adults_count);
      const kids = parseInt(data.kids_count);
      const totalPrice = basePrice + (kids * 50); // Kids price

      const visitorData = {
        ticket_number: ticketNumber,
        visitor_name: data.visitor_name,
        mobile: data.mobile,
        adults_count: adults,
        kids_count: kids,
        entry_type: data.entry_type,
        event_id: data.event_id || null,
        ticket_price: totalPrice,
        payment_status: data.payment_status
      };

      const { data: result, error } = await (supabase as any)
        .from("farm_visitors")
        .insert([visitorData])
        .select()
        .single();

      if (error) throw error;

      // Create payment record if paid
      if (data.payment_status === "paid") {
        await (supabase as any)
          .from("farm_payments")
          .insert([{
            payment_code: `PAY${ticketNumber}`,
            payment_type: "entry_ticket",
            reference_id: (result as any).id,
            amount: totalPrice,
            payment_method: "cash",
            status: "completed"
          }]);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-visitors"] });
      queryClient.invalidateQueries({ queryKey: ["today-visitors"] });
      toast.success("Visitor entry created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create visitor entry: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any)
        .from("farm_visitors")
        .update({
          visitor_name: data.visitor_name,
          mobile: data.mobile,
          adults_count: parseInt(data.adults_count),
          kids_count: parseInt(data.kids_count),
          entry_type: data.entry_type,
          event_id: data.event_id || null,
          ticket_price: parseFloat(data.ticket_price),
          payment_status: data.payment_status
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-visitors"] });
      toast.success("Visitor entry updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update visitor entry: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("farm_visitors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-visitors"] });
      toast.success("Visitor entry deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete visitor entry: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      visitor_name: "",
      mobile: "",
      adults_count: "1",
      kids_count: "0",
      entry_type: "single",
      event_id: "",
      ticket_price: "",
      payment_status: "pending"
    });
    setEditingVisitor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVisitor) {
      updateMutation.mutate({ id: editingVisitor.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (visitor: FarmVisitor) => {
    setEditingVisitor(visitor);
    setFormData({
      visitor_name: visitor.visitor_name,
      mobile: visitor.mobile,
      adults_count: visitor.adults_count.toString(),
      kids_count: visitor.kids_count.toString(),
      entry_type: visitor.entry_type,
      event_id: visitor.event_id || "",
      ticket_price: visitor.ticket_price.toString(),
      payment_status: visitor.payment_status
    });
    setIsDialogOpen(true);
  };

  const calculatePrice = () => {
    const adults = parseInt(formData.adults_count);
    const kids = parseInt(formData.kids_count);
    const entryType = formData.entry_type;

    let basePrice = 0;
    if (entryType === "single") {
      const singleTicket = ticketSettings.find((t: any) => t.ticket_type === "Regular Entry");
      basePrice = (singleTicket as any) ? (singleTicket as any).adult_price : 100;
    } else if (entryType === "family") {
      const familyTicket = ticketSettings.find((t: any) => t.ticket_type === "Family Package");
      basePrice = (familyTicket as any) ? (familyTicket as any).adult_price : 300;
    }

    return basePrice + (kids * 50);
  };

  const columns = [
    { key: "ticket_number", label: "Ticket #" },
    { key: "visitor_name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    {
      key: "adults_count",
      label: "Adults",
      render: (value: number, row: FarmVisitor) => `${value}A + ${row.kids_count}K`
    },
    {
      key: "entry_type",
      label: "Type",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: "ticket_price",
      label: "Amount",
      render: (value: number) => `₹${value}`
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (value: string) => (
        <Badge variant={value === "paid" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
    {
      key: "entry_time",
      label: "Entry Time",
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: FarmVisitor) => (
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
              if (confirm("Are you sure you want to delete this visitor entry?")) {
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

  const todayVisitors = visitors.filter(v => {
    const today = new Date().toISOString().split('T')[0];
    return v.entry_time.startsWith(today);
  });

  const totalRevenue = todayVisitors
    .filter(v => v.payment_status === "paid")
    .reduce((sum, v) => sum + v.ticket_price, 0);

  const totalVisitors = todayVisitors.reduce((sum, v) => sum + v.adults_count + v.kids_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Visitor Entry Management</h2>
          <p className="text-muted-foreground">Track visitor entries, generate tickets, and manage payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Visitor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVisitor ? "Edit Visitor Entry" : "New Visitor Entry"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visitor_name">Visitor Name *</Label>
                  <Input
                    id="visitor_name"
                    value={formData.visitor_name}
                    onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adults_count">Adults</Label>
                  <Input
                    id="adults_count"
                    type="number"
                    min="1"
                    value={formData.adults_count}
                    onChange={(e) => setFormData({ ...formData, adults_count: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="kids_count">Kids</Label>
                  <Input
                    id="kids_count"
                    type="number"
                    min="0"
                    value={formData.kids_count}
                    onChange={(e) => setFormData({ ...formData, kids_count: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="entry_type">Entry Type</Label>
                  <Select value={formData.entry_type} onValueChange={(value) => setFormData({ ...formData, entry_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="package">Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="event_id">Associated Event (Optional)</Label>
                <Select value={formData.event_id} onValueChange={(value) => setFormData({ ...formData, event_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Event</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.event_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticket_price">Calculated Price</Label>
                  <Input
                    id="ticket_price"
                    value={`₹${calculatePrice()}`}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_status">Payment Status</Label>
                  <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingVisitor ? "Update" : "Create"} Entry
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors}</div>
            <p className="text-xs text-muted-foreground">Total people</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries Today</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayVisitors.length}</div>
            <p className="text-xs text-muted-foreground">Ticket entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayVisitors.filter(v => v.payment_status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Unpaid entries</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Visitor Entries"
        description="Track all visitor entries and ticket information"
        columns={columns}
        data={visitors}
        emptyMessage="No visitor entries found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FarmVisitorEntryManager;
