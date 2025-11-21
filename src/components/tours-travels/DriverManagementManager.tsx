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
import { Plus, Pencil, Trash2, User, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function DriverManagementManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["tours-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_drivers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (driverData: any) => {
      if (editingDriver) {
        const { error } = await supabase
          .from("tours_drivers")
          .update(driverData)
          .eq("id", editingDriver.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tours_drivers")
          .insert(driverData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingDriver ? "Driver updated" : "Driver created");
      queryClient.invalidateQueries({ queryKey: ["tours-drivers"] });
      setIsOpen(false);
      setEditingDriver(null);
    },
    onError: () => {
      toast.error("Failed to save driver");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours_drivers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Driver deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-drivers"] });
    },
    onError: () => {
      toast.error("Failed to delete driver");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const driverData = {
      driver_code: formData.get("driver_code"),
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      alternate_phone: formData.get("alternate_phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      date_of_birth: formData.get("date_of_birth") || null,
      license_number: formData.get("license_number"),
      license_expiry: formData.get("license_expiry"),
      experience_years: parseInt(formData.get("experience_years") as string) || 0,
      emergency_contact_name: formData.get("emergency_contact_name"),
      emergency_contact_phone: formData.get("emergency_contact_phone"),
      status: formData.get("status"),
      notes: formData.get("notes"),
    };
    saveMutation.mutate(driverData);
  };

  const columns = [
    { key: "driver_code", label: "Driver Code" },
    { key: "full_name", label: "Full Name" },
    { key: "phone", label: "Phone" },
    { key: "license_number", label: "License Number" },
    {
      key: "license_expiry",
      label: "License Expiry",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { key: "experience_years", label: "Experience (Years)" },
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
              setEditingDriver(row);
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
            <CardTitle>Driver Management</CardTitle>
            <CardDescription>Manage driver information, licenses, and assignments</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingDriver(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDriver ? "Edit" : "Add"} Driver</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="driver_code">Driver Code</Label>
                    <Input
                      id="driver_code"
                      name="driver_code"
                      defaultValue={editingDriver?.driver_code}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={editingDriver?.full_name}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingDriver?.phone}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="alternate_phone">Alternate Phone</Label>
                    <Input
                      id="alternate_phone"
                      name="alternate_phone"
                      defaultValue={editingDriver?.alternate_phone}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingDriver?.email}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      defaultValue={editingDriver?.date_of_birth}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      name="license_number"
                      defaultValue={editingDriver?.license_number}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_expiry">License Expiry</Label>
                    <Input
                      id="license_expiry"
                      name="license_expiry"
                      type="date"
                      defaultValue={editingDriver?.license_expiry}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      defaultValue={editingDriver?.experience_years || 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingDriver?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingDriver?.address}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={editingDriver?.city}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      defaultValue={editingDriver?.state}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      defaultValue={editingDriver?.pincode}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      name="emergency_contact_name"
                      defaultValue={editingDriver?.emergency_contact_name}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      name="emergency_contact_phone"
                      defaultValue={editingDriver?.emergency_contact_phone}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    defaultValue={editingDriver?.notes}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingDriver ? "Update" : "Create"} Driver
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Drivers"
          description="Manage driver information and licenses"
          columns={columns}
          data={drivers}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
