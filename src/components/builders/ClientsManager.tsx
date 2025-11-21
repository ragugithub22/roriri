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
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const supabaseClient = supabase as any;

const ClientsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    client_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    client_type: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-clients"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const { data, error } = await supabaseClient
        .from("builders_clients")
        .insert([clientData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-clients"] });
      toast.success("Client added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add client: " + error.message);
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabaseClient
        .from("builders_clients")
        .update(clientData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-clients"] });
      toast.success("Client updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update client: " + error.message);
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("builders_clients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-clients"] });
      toast.success("Client removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove client: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      client_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      client_type: "",
      status: "active"
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, ...formData });
    } else {
      createClientMutation.mutate(formData);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      client_name: client.client_name || "",
      contact_person: client.contact_person || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      pincode: client.pincode || "",
      client_type: client.client_type || "",
      status: client.status || "active"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      blacklisted: { variant: "destructive", label: "Blacklisted" }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const clientColumns = [
    { key: "client_name", label: "Client Name" },
    { key: "contact_person", label: "Contact Person" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "client_type", label: "Type" },
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

  const clientTypeOptions = [
    "individual", "company", "partnership", "trust", "society", "government"
  ];

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Clients Management</h2>
          <p className="text-muted-foreground">Manage construction clients and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="client_type">Client Type *</Label>
                  <Select value={formData.client_type} onValueChange={(value) => setFormData({ ...formData, client_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createClientMutation.isPending || updateClientMutation.isPending}>
                  {editingClient ? "Update" : "Add"} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Clients Directory"
        description="All registered clients and their contact information"
        columns={clientColumns}
        data={clients}
      />

      {/* Clients Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client: any) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {client.client_name}
                </span>
                {getStatusBadge(client.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.contact_person && (
                  <div className="text-sm text-muted-foreground">
                    Contact: {client.contact_person}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {client.address}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Type: {client.client_type ? client.client_type.charAt(0).toUpperCase() + client.client_type.slice(1) : "Not specified"}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)}>
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

export default ClientsManager;
