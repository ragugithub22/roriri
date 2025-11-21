import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package, DollarSign, Hash } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const MaterialsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    material_name: "",
    material_code: "",
    category: "",
    unit: "",
    current_stock: "",
    minimum_stock: "",
    unit_price: "",
    supplier: "",
    description: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  // Fetch materials
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["builders-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("builders_materials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async (materialData: any) => {
      const { data, error } = await supabase
        .from("builders_materials")
        .insert([materialData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-materials"] });
      toast.success("Material added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add material: " + error.message);
    },
  });

  // Update material mutation
  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, ...materialData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from("builders_materials")
        .update(materialData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-materials"] });
      toast.success("Material updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update material: " + error.message);
    },
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("builders_materials")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-materials"] });
      toast.success("Material removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove material: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      material_name: "",
      material_code: "",
      category: "",
      unit: "",
      current_stock: "",
      minimum_stock: "",
      unit_price: "",
      supplier: "",
      description: "",
      status: "active"
    });
    setEditingMaterial(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const materialData = {
      ...formData,
      current_stock: formData.current_stock ? parseFloat(formData.current_stock) : null,
      minimum_stock: formData.minimum_stock ? parseFloat(formData.minimum_stock) : null,
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
    };

    if (editingMaterial) {
      updateMaterialMutation.mutate({ id: editingMaterial.id, ...materialData });
    } else {
      createMaterialMutation.mutate(materialData);
    }
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      material_name: material.material_name || "",
      material_code: material.material_code || "",
      category: material.category || "",
      unit: material.unit || "",
      current_stock: material.current_stock?.toString() || "",
      minimum_stock: material.minimum_stock?.toString() || "",
      unit_price: material.unit_price?.toString() || "",
      supplier: material.supplier || "",
      description: material.description || "",
      status: material.status || "active"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this material?")) {
      deleteMaterialMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      discontinued: { variant: "destructive", label: "Discontinued" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (current <= minimum * 1.5) {
      return <Badge variant="secondary">Medium Stock</Badge>;
    }
    return <Badge variant="default">Good Stock</Badge>;
  };

  const materialColumns = [
    { key: "material_name", label: "Material Name" },
    { key: "material_code", label: "Code" },
    { key: "category", label: "Category" },
    { key: "unit", label: "Unit" },
    {
      key: "current_stock",
      label: "Current Stock",
      render: (value: number, row: any) => (
        <div className="flex items-center gap-2">
          <span>{value || 0}</span>
          {getStockStatus(value || 0, row.minimum_stock || 0)}
        </div>
      )
    },
    {
      key: "unit_price",
      label: "Unit Price",
      render: (value: number) => value ? `₹${value}` : "N/A"
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const categoryOptions = [
    "cement", "steel", "bricks", "sand", "aggregate", "paint", "electrical", "plumbing", "timber", "glass", "other"
  ];

  const unitOptions = [
    "kg", "ton", "cubic_meter", "square_meter", "liter", "pieces", "bags", "rolls"
  ];

  if (isLoading) {
    return <div>Loading materials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Materials Management</h2>
          <p className="text-muted-foreground">Manage construction materials and inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Edit Material" : "Add New Material"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="material_name">Material Name *</Label>
                  <Input
                    id="material_name"
                    value={formData.material_name}
                    onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="material_code">Material Code</Label>
                  <Input
                    id="material_code"
                    value={formData.material_code}
                    onChange={(e) => setFormData({ ...formData, material_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current_stock">Current Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_stock">Minimum Stock</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Unit Price (₹)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMaterialMutation.isPending || updateMaterialMutation.isPending}>
                  {editingMaterial ? "Update" : "Add"} Material
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Materials Inventory"
        description="All construction materials and their stock levels"
        columns={materialColumns}
        data={materials}
      />

      {/* Materials Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material: any) => (
          <Card key={material.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {material.material_name}
                </span>
                {getStatusBadge(material.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Category: {material.category ? material.category.charAt(0).toUpperCase() + material.category.slice(1) : "Not specified"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Stock: {material.current_stock || 0} {material.unit}
                </div>
                {material.unit_price && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    ₹{material.unit_price} per {material.unit}
                  </div>
                )}
                {getStockStatus(material.current_stock || 0, material.minimum_stock || 0)}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(material)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(material.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MaterialsManager;
