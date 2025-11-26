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
import { Plus, Edit, Trash2, ShoppingCart, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface FarmFoodOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: string;
  total_amount: number;
  order_date: string;
  delivery_time?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  special_instructions?: string;
  created_at: string;
}

const FarmFoodOrdersManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<FarmFoodOrder | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    order_items: "",
    total_amount: "",
    order_date: "",
    delivery_time: "",
    status: "pending",
    special_instructions: ""
  });

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["farm-food-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_food_orders" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FarmFoodOrder[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from("farm_food_orders")
        .insert([{
          ...data,
          total_amount: parseFloat(data.total_amount)
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-food-orders"] });
      toast.success("Food order created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create food order: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any)
        .from("farm_food_orders")
        .update({
          ...data,
          total_amount: parseFloat(data.total_amount)
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-food-orders"] });
      toast.success("Food order updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update food order: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("farm_food_orders")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-food-orders"] });
      toast.success("Food order deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete food order: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      order_items: "",
      total_amount: "",
      order_date: "",
      delivery_time: "",
      status: "pending",
      special_instructions: ""
    });
    setEditingOrder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (order: FarmFoodOrder) => {
    setEditingOrder(order);
    setFormData({
      ...formData,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      order_items: order.order_items,
      total_amount: order.total_amount.toString(),
      order_date: order.order_date,
      delivery_time: order.delivery_time || "",
      status: order.status,
      special_instructions: order.special_instructions || ""
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Preparing</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const columns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "customer_email", label: "Email" },
    { key: "order_items", label: "Order Items" },
    {
      key: "total_amount",
      label: "Amount",
      render: (value: number) => `₹${value}`
    },
    { key: "order_date", label: "Order Date" },
    { key: "delivery_time", label: "Delivery Time" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: FarmFoodOrder) => (
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
              if (confirm("Are you sure you want to delete this food order?")) {
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

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Food Orders</h2>
          <p className="text-muted-foreground">Manage food orders and delivery tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Food Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? "Edit Food Order" : "New Food Order"}
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
                <Label htmlFor="order_items">Order Items *</Label>
                <Textarea
                  id="order_items"
                  value={formData.order_items}
                  onChange={(e) => setFormData({ ...formData, order_items: e.target.value })}
                  required
                  rows={3}
                  placeholder="List the food items ordered..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="order_date">Order Date *</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_time">Delivery Time</Label>
                  <Input
                    id="delivery_time"
                    type="time"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
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
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingOrder ? "Update" : "Create"} Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">All food orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting preparation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preparingOrders.length}</div>
            <p className="text-xs text-muted-foreground">In preparation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From food orders</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Food Orders"
        description="Track and manage food orders, preparation status, and delivery"
        columns={columns}
        data={orders}
        emptyMessage="No food orders found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FarmFoodOrdersManager;
