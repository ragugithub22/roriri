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
import { Plus, Edit, Trash2, Ticket, DollarSign, Users, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface FarmTicket {
  id: string;
  ticket_type: string;
  adult_price: number;
  kid_price: number;
  description?: string;
  is_active: boolean;
  valid_days: string[];
  created_at: string;
}

const FarmTicketsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<FarmTicket | null>(null);
  const [formData, setFormData] = useState({
    ticket_type: "",
    adult_price: "",
    kid_price: "",
    description: "",
    is_active: "true",
    valid_days: [] as string[]
  });

  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["farm-tickets"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("farm_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any;
    },
  });

  const resetForm = () => {
    setFormData({
      ticket_type: "",
      adult_price: "",
      kid_price: "",
      description: "",
      is_active: "true",
      valid_days: []
    });
    setEditingTicket(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from("farm_tickets")
        .insert([{
          ...data,
          adult_price: parseFloat(data.adult_price),
          kid_price: parseFloat(data.kid_price),
          is_active: data.is_active === "true"
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-tickets"] });
      toast.success("Ticket type created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create ticket type: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any)
        .from("farm_tickets")
        .update({
          ...data,
          adult_price: parseFloat(data.adult_price),
          kid_price: parseFloat(data.kid_price),
          is_active: data.is_active === "true"
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-tickets"] });
      toast.success("Ticket type updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update ticket type: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("farm_tickets")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-tickets"] });
      toast.success("Ticket type deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete ticket type: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTicket) {
      updateMutation.mutate({ id: editingTicket.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (ticket: FarmTicket) => {
    setEditingTicket(ticket);
    setFormData({
      ticket_type: ticket.ticket_type,
      adult_price: ticket.adult_price.toString(),
      kid_price: ticket.kid_price.toString(),
      description: ticket.description || "",
      is_active: ticket.is_active.toString(),
      valid_days: ticket.valid_days || []
    });
    setIsDialogOpen(true);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      valid_days: prev.valid_days.includes(day)
        ? prev.valid_days.filter(d => d !== day)
        : [...prev.valid_days, day]
    }));
  };

  const columns = [
    { key: "ticket_type", label: "Ticket Type" },
    {
      key: "adult_price",
      label: "Adult Price",
      render: (value: number) => `₹${value}`
    },
    {
      key: "kid_price",
      label: "Kid Price",
      render: (value: number) => `₹${value}`
    },
    {
      key: "valid_days",
      label: "Valid Days",
      render: (value: string[]) => value?.length ? value.join(", ") : "All days"
    },
    {
      key: "is_active",
      label: "Active",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: FarmTicket) => (
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
              if (confirm("Are you sure you want to delete this ticket type?")) {
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

  const activeTickets = tickets.filter(ticket => ticket.is_active);
  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.adult_price, 0);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ticket Pricing & Packages</h2>
          <p className="text-muted-foreground">Manage ticket types, pricing, and validity periods</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Ticket Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTicket ? "Edit Ticket Type" : "Add New Ticket Type"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adult_price">Adult Price (₹) *</Label>
                  <Input
                    id="adult_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.adult_price}
                    onChange={(e) => setFormData({ ...formData, adult_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="kid_price">Kid Price (₹) *</Label>
                  <Input
                    id="kid_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.kid_price}
                    onChange={(e) => setFormData({ ...formData, kid_price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Valid Days (Optional - leave empty for all days)</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.valid_days.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day)}
                      className="text-xs"
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="is_active">Active</Label>
                <Select value={formData.is_active} onValueChange={(value) => setFormData({ ...formData, is_active: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTicket ? "Update" : "Create"} Ticket Type
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Types</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">Ticket categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Types</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTickets.length}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Adult Price</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{tickets.length > 0 ? (totalRevenue / tickets.length).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per ticket type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From adult tickets</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Ticket Types & Pricing"
        description="Manage different ticket types and their pricing structure"
        columns={columns}
        data={tickets}
        emptyMessage="No ticket types found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FarmTicketsManager;
