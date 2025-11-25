import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, Settings, Mail, Bell, Shield } from "lucide-react";
import { toast } from "sonner";

interface ConsultancySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  category: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

const SettingsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<ConsultancySetting | null>(null);
  const [formData, setFormData] = useState({
    setting_key: "",
    setting_value: "",
    setting_type: "text",
    description: "",
    category: "general",
    is_system: false
  });

  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["consultancy-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_settings" as any)
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      return data as ConsultancySetting[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("consultancy_settings" as any)
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-settings"] });
      toast.success("Setting added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add setting: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("consultancy_settings" as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-settings"] });
      toast.success("Setting updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update setting: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consultancy_settings" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-settings"] });
      toast.success("Setting deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete setting: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      setting_key: "",
      setting_value: "",
      setting_type: "text",
      description: "",
      category: "general",
      is_system: false
    });
    setEditingSetting(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (setting: ConsultancySetting) => {
    setEditingSetting(setting);
    setFormData({
      setting_key: setting.setting_key,
      setting_value: setting.setting_value,
      setting_type: setting.setting_type,
      description: setting.description || "",
      category: setting.category,
      is_system: setting.is_system
    });
    setIsDialogOpen(true);
  };

  const handleQuickUpdate = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from("consultancy_settings" as any)
        .update({
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["consultancy-settings"] });
      toast.success("Setting updated successfully");
    } catch (error: any) {
      toast.error("Failed to update setting: " + error.message);
    }
  };

  const renderSettingValue = (setting: ConsultancySetting) => {
    switch (setting.setting_type) {
      case "boolean":
        return (
          <Switch
            checked={setting.setting_value === "true"}
            onCheckedChange={(checked) => handleQuickUpdate(setting.id, checked.toString())}
            disabled={setting.is_system}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={setting.setting_value}
            onChange={(e) => handleQuickUpdate(setting.id, e.target.value)}
            className="w-32"
            disabled={setting.is_system}
          />
        );
      case "email":
        return (
          <Input
            type="email"
            value={setting.setting_value}
            onChange={(e) => handleQuickUpdate(setting.id, e.target.value)}
            className="w-64"
            disabled={setting.is_system}
          />
        );
      default:
        return (
          <Input
            value={setting.setting_value}
            onChange={(e) => handleQuickUpdate(setting.id, e.target.value)}
            className="w-64"
            disabled={setting.is_system}
          />
        );
    }
  };

  const columns = [
    {
      key: "setting_key",
      label: "Setting Key",
      render: (value: string, row: ConsultancySetting) => (
        <div>
          <div className="font-medium">{value}</div>
          {row.description && (
            <div className="text-sm text-muted-foreground">{row.description}</div>
          )}
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "setting_value",
      label: "Value",
      render: (_: any, row: ConsultancySetting) => renderSettingValue(row)
    },
    {
      key: "setting_type",
      label: "Type",
      render: (value: string) => (
        <Badge variant="secondary">
          {value}
        </Badge>
      )
    },
    {
      key: "is_system",
      label: "System",
      render: (value: boolean) => (
        <Badge variant={value ? "destructive" : "outline"}>
          {value ? "System" : "User"}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: ConsultancySetting) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            disabled={row.is_system}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this setting?")) {
                deleteMutation.mutate(row.id);
              }
            }}
            disabled={row.is_system}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, ConsultancySetting[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Settings Management</h2>
          <p className="text-muted-foreground">Configure consultancy system settings and preferences</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? "Edit Setting" : "Add New Setting"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="setting_key">Setting Key *</Label>
                  <Input
                    id="setting_key"
                    value={formData.setting_key}
                    onChange={(e) => setFormData({ ...formData, setting_key: e.target.value })}
                    required
                    disabled={editingSetting?.is_system}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="notifications">Notifications</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="setting_type">Setting Type</Label>
                  <Select value={formData.setting_type} onValueChange={(value) => setFormData({ ...formData, setting_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_system"
                    checked={formData.is_system}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_system: checked })}
                    disabled={editingSetting?.is_system}
                  />
                  <Label htmlFor="is_system">System Setting</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="setting_value">Setting Value *</Label>
                {formData.setting_type === "boolean" ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={formData.setting_value === "true"}
                      onCheckedChange={(checked) => setFormData({ ...formData, setting_value: checked.toString() })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.setting_value === "true" ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ) : (
                  <Input
                    id="setting_value"
                    value={formData.setting_value}
                    onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                    type={formData.setting_type === "number" ? "number" : formData.setting_type === "email" ? "email" : "text"}
                    required
                  />
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Describe what this setting controls"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingSetting ? "Update" : "Add"} Setting
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings by Category */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category === "general" && <Settings className="h-5 w-5" />}
              {category === "email" && <Mail className="h-5 w-5" />}
              {category === "notifications" && <Bell className="h-5 w-5" />}
              {category === "security" && <Shield className="h-5 w-5" />}
              {category.charAt(0).toUpperCase() + category.slice(1)} Settings
            </CardTitle>
            <CardDescription>
              {category === "general" && "General system configuration"}
              {category === "email" && "Email configuration and templates"}
              {category === "notifications" && "Notification preferences and settings"}
              {category === "security" && "Security and access control settings"}
              {category === "payment" && "Payment processing and billing settings"}
              {category === "system" && "Core system settings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={categorySettings}
              emptyMessage={`No ${category} settings found`}
              isLoading={isLoading}
              showPagination={false}
            />
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedSettings).length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Settings Found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first setting</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Setting
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsManager;
