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
import { Plus, Pencil, Trash2, Car, Wrench, Fuel } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function VehicleManagementManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["tours-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_vehicles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      if (editingVehicle) {
        const { error } = await supabase
          .from("tours_vehicles")
          .update(vehicleData)
          .eq("id", editingVehicle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tours_vehicles")
          .insert(vehicleData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingVehicle ? "Vehicle updated" : "Vehicle created");
      queryClient.invalidateQueries({ queryKey: ["tours-vehicles"] });
      setIsOpen(false);
      setEditingVehicle(null);
    },
    onError: () => {
      toast.error("Failed to save vehicle");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours_vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-vehicles"] });
    },
    onError: () => {
      toast.error("Failed to delete vehicle");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vehicleData = {
      vehicle_code: formData.get("vehicle_code"),
      registration_number: formData.get("registration_number"),
      vehicle_type: formData.get("vehicle_type"),
      make: formData.get("make"),
      model: formData.get("model"),
      year: parseInt(formData.get("year") as string),
      seating_capacity: parseInt(formData.get("seating_capacity") as string),
      fuel_type: formData.get("fuel_type"),
      mileage: parseFloat(formData.get("mileage") as string) || null,
      insurance_expiry: formData.get("insurance_expiry") || null,
      pollution_certificate_expiry: formData.get("pollution_certificate_expiry") || null,
      permit_expiry: formData.get("permit_expiry") || null,
      last_service_date: formData.get("last_service_date") || null,
      next_service_due: formData.get("next_service_due") || null,
      status: formData.get("status"),
      notes: formData.get("notes"),
    };
    saveMutation.mutate(vehicleData);
  };

  const columns = [
    { key: "vehicle_code", label: "Vehicle Code" },
    { key: "registration_number", label: "Registration" },
    { key: "vehicle_type", label: "Type" },
    { key: "make", label: "Make" },
    { key: "model", label: "Model" },
    { key: "seating_capacity", label: "Capacity" },
    {
      key: "status",
      label: "Status",
      render: (value: any) => (
        <Badge variant={value === 'active' ? 'default' : value === 'maintenance' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    },
    {
      key: "insurance_expiry",
      label: "Insurance Expiry",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
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
              setEditingVehicle(row);
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
            <CardTitle>Vehicle Management</CardTitle>
            <CardDescription>Manage fleet vehicles, maintenance, and documentation</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingVehicle(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit" : "Add"} Vehicle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_code">Vehicle Code</Label>
                    <Input
                      id="vehicle_code"
                      name="vehicle_code"
                      defaultValue={editingVehicle?.vehicle_code}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      name="registration_number"
                      defaultValue={editingVehicle?.registration_number}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Select name="vehicle_type" defaultValue={editingVehicle?.vehicle_type || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="tempo">Tempo Traveller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      name="make"
                      defaultValue={editingVehicle?.make}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      name="model"
                      defaultValue={editingVehicle?.model}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      defaultValue={editingVehicle?.year}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seating_capacity">Seating Capacity</Label>
                    <Input
                      id="seating_capacity"
                      name="seating_capacity"
                      type="number"
                      defaultValue={editingVehicle?.seating_capacity}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuel_type">Fuel Type</Label>
                    <Select name="fuel_type" defaultValue={editingVehicle?.fuel_type || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="cng">CNG</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mileage">Mileage (km/l)</Label>
                    <Input
                      id="mileage"
                      name="mileage"
                      type="number"
                      step="0.1"
                      defaultValue={editingVehicle?.mileage}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                    <Input
                      id="insurance_expiry"
                      name="insurance_expiry"
                      type="date"
                      defaultValue={editingVehicle?.insurance_expiry}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pollution_certificate_expiry">Pollution Certificate Expiry</Label>
                    <Input
                      id="pollution_certificate_expiry"
                      name="pollution_certificate_expiry"
                      type="date"
                      defaultValue={editingVehicle?.pollution_certificate_expiry}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permit_expiry">Permit Expiry</Label>
                    <Input
                      id="permit_expiry"
                      name="permit_expiry"
                      type="date"
                      defaultValue={editingVehicle?.permit_expiry}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="last_service_date">Last Service Date</Label>
                    <Input
                      id="last_service_date"
                      name="last_service_date"
                      type="date"
                      defaultValue={editingVehicle?.last_service_date}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_service_due">Next Service Due</Label>
                    <Input
                      id="next_service_due"
                      name="next_service_due"
                      type="date"
                      defaultValue={editingVehicle?.next_service_due}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingVehicle?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      defaultValue={editingVehicle?.notes}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingVehicle ? "Update" : "Create"} Vehicle
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Vehicles"
          description="Manage fleet vehicles and maintenance"
          columns={columns}
          data={vehicles}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
