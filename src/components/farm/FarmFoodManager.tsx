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
import { Plus, Edit, Trash2, Utensils, DollarSign, Package, Leaf, Beef } from "lucide-react";
import { toast } from "sonner";

interface FarmFoodItem {
  id: string;
  item_code: string;
  name: string;
  category: string;
  veg_non_veg: string;
  price: number;
  description?: string;
  available: boolean;
  status: string;
  created_at: string;
}

const FarmFoodManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FarmFoodItem | null>(null);
  const [formData, setFormData] = useState({
    item_code: "",
    name: "",
    category: "",
    veg_non_veg: "veg",
    price: "",
    description: "",
    available: "true",
    status: "active"
  });

  const queryClient = useQueryClient();

  const { data: foodItems = [], isLoading } = useQuery({
    queryKey: ["farm-food-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_food_items" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FarmFoodItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from("farm_food_items")
        .insert([{
          ...data,
          price: parseFloat(data.price),
          available: data.available === "true"
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-food-items"] });
      toast.success("Food item created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create food item: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any)
        .from("farm_food_items")
        .update({
          ...data,
          price: parseFloat(data.price),
          available: data.available === "true"
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-food-items"] });
      toast.success("Food item updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update food item: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("farm_food_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-food-items"] });
      toast.success("Food item deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete food item: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      item_code: "",
      name: "",
      category: "",
      veg_non_veg: "veg",
      price: "",
      description: "",
      available: "true",
      status: "active"
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: FarmFoodItem) => {
    setEditingItem(item);
    setFormData({
      item_code: item.item_code,
      name: item.name,
      category: item.category,
      veg_non_veg: item.veg_non_veg,
      price: item.price.toString(),
      description: item.description || "",
      available: item.available.toString(),
      status: item.status
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: "item_code", label: "Item Code" },
    { key: "name", label: "Name" },
    {
      key: "category",
      label: "Category",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: "veg_non_veg",
      label: "Type",
      render: (value: string) => (
        <Badge variant={value === "veg" ? "default" : "secondary"}>
          {value === "veg" ? <Leaf className="w-3 h-3 mr-1" /> : <Beef className="w-3 h-3 mr-1" />}
          {value}
        </Badge>
      )
    },
    {
      key: "price",
      label: "Price",
      render: (value: number) => `₹${value}`
    },
    {
      key: "available",
      label: "Available",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "active" ? "default" :
          "secondary"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: FarmFoodItem) => (
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
              if (confirm("Are you sure you want to delete this food item?")) {
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

  const availableItems = foodItems.filter(item => item.available && item.status === "active");
  const totalRevenue = foodItems.reduce((sum, item) => sum + item.price, 0);
  const vegItems = foodItems.filter(item => item.veg_non_veg === "veg");
  const nonVegItems = foodItems.filter(item => item.veg_non_veg === "non-veg");

  const categories = [...new Set(foodItems.map(item => item.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Food & Beverages Management</h2>
          <p className="text-muted-foreground">Manage food items, beverages, and menu offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_code">Item Code *</Label>
                  <Input
                    id="item_code"
                    value={formData.item_code}
                    onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                    required
                    placeholder="FJ001"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Snacks">Snacks</SelectItem>
                      <SelectItem value="Meals">Meals</SelectItem>
                      <SelectItem value="Desserts">Desserts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="veg_non_veg">Type *</Label>
                  <Select value={formData.veg_non_veg} onValueChange={(value) => setFormData({ ...formData, veg_non_veg: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="available">Available</Label>
                  <Select value={formData.available} onValueChange={(value) => setFormData({ ...formData, available: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? "Update" : "Create"} Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{foodItems.length}</div>
            <p className="text-xs text-muted-foreground">All food items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableItems.length}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veg Items</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vegItems.length}</div>
            <p className="text-xs text-muted-foreground">Vegetarian options</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{foodItems.length > 0 ? (totalRevenue / foodItems.length).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per item</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Food & Beverages"
        description="Manage all food items and beverages available at the farm"
        columns={columns}
        data={foodItems}
        emptyMessage="No food items found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default FarmFoodManager;
