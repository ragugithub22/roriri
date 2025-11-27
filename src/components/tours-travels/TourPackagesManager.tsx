// @ts-nocheck
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
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function TourPackagesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["tours-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_packages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (packageData: any) => {
      if (editingPackage) {
        const { error } = await supabase
          .from("tours_packages")
          .update(packageData)
          .eq("id", editingPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tours_packages")
          .insert(packageData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingPackage ? "Package updated" : "Package created");
      queryClient.invalidateQueries({ queryKey: ["tours-packages"] });
      setIsOpen(false);
      setEditingPackage(null);
    },
    onError: () => {
      toast.error("Failed to save package");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Package deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-packages"] });
    },
    onError: () => {
      toast.error("Failed to delete package");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const packageData = {
      package_code: formData.get("package_code"),
      package_name: formData.get("package_name"),
      description: formData.get("description"),
      destination: formData.get("destination"),
      duration_days: parseInt(formData.get("duration_days") as string),
      duration_nights: parseInt(formData.get("duration_nights") as string),
      price_per_person: parseFloat(formData.get("price_per_person") as string),
      max_participants: parseInt(formData.get("max_participants") as string) || null,
      inclusions: (formData.get("inclusions") as string)?.split(',').map(s => s.trim()) || [],
      exclusions: (formData.get("exclusions") as string)?.split(',').map(s => s.trim()) || [],
      itinerary: formData.get("itinerary"),
      terms_conditions: formData.get("terms_conditions"),
      status: formData.get("status"),
    };
    saveMutation.mutate(packageData);
  };

  const columns = [
    { key: "package_code", label: "Code" },
    { key: "package_name", label: "Package Name" },
    { key: "destination", label: "Destination" },
    {
      key: "duration",
      label: "Duration",
      render: (value: any, row: any) => `${row.duration_days}D/${row.duration_nights}N`
    },
    {
      key: "price_per_person",
      label: "Price/Person",
      render: (value: any) => `₹${value?.toLocaleString()}`
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
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
              setEditingPackage(row);
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
            <CardTitle>Tour Packages Management</CardTitle>
            <CardDescription>Create and manage tour packages</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPackage(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPackage ? "Edit" : "Add"} Tour Package</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="package_code">Package Code</Label>
                    <Input
                      id="package_code"
                      name="package_code"
                      defaultValue={editingPackage?.package_code}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="package_name">Package Name</Label>
                    <Input
                      id="package_name"
                      name="package_name"
                      defaultValue={editingPackage?.package_name}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingPackage?.description}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      name="destination"
                      defaultValue={editingPackage?.destination}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingPackage?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="duration_days">Days</Label>
                    <Input
                      id="duration_days"
                      name="duration_days"
                      type="number"
                      defaultValue={editingPackage?.duration_days}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_nights">Nights</Label>
                    <Input
                      id="duration_nights"
                      name="duration_nights"
                      type="number"
                      defaultValue={editingPackage?.duration_nights}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_per_person">Price/Person (₹)</Label>
                    <Input
                      id="price_per_person"
                      name="price_per_person"
                      type="number"
                      step="0.01"
                      defaultValue={editingPackage?.price_per_person}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      name="max_participants"
                      type="number"
                      defaultValue={editingPackage?.max_participants}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inclusions">Inclusions (comma-separated)</Label>
                    <Textarea
                      id="inclusions"
                      name="inclusions"
                      defaultValue={editingPackage?.inclusions?.join(', ')}
                      placeholder="Hotel, Meals, Transport, Guide..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="exclusions">Exclusions (comma-separated)</Label>
                    <Textarea
                      id="exclusions"
                      name="exclusions"
                      defaultValue={editingPackage?.exclusions?.join(', ')}
                      placeholder="Flights, Personal expenses, Tips..."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="itinerary">Itinerary</Label>
                  <Textarea
                    id="itinerary"
                    name="itinerary"
                    defaultValue={editingPackage?.itinerary}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                  <Textarea
                    id="terms_conditions"
                    name="terms_conditions"
                    defaultValue={editingPackage?.terms_conditions}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingPackage ? "Update" : "Create"} Package
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Tour Packages"
          description="Manage your tour packages"
          columns={columns}
          data={packages}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
