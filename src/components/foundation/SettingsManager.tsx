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
import { Plus, Settings, Edit, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Setting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
  updated_at: string;
}

const SettingsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [formData, setFormData] = useState({
    setting_key: "",
    setting_value: {},
    description: "",
    category: ""
  });

  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["foundation-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("foundation_settings")
        .select("*")
        .order("category", { ascending: true });
      if (error) return [];
      return (data || []) as any;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from("foundation_settings")
        .insert([{
          ...data,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foundation-settings"] });
      toast.success("Setting created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create setting: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any)
        .from("foundation_settings")
        .update({
          ...data,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foundation-settings"] });
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
      const { error } = await (supabase as any)
        .from("foundation_settings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foundation-settings"] });
      toast.success("Setting deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete setting: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      setting_key: "",
      setting_value: {},
      description: "",
      category: ""
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

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting);
    setFormData({
      setting_key: setting.setting_key,
      setting_value: setting.setting_value,
      description: setting.description,
      category: setting.category
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "setting_key",
      label: "Setting Key",
      render: (value: string) => (
        <div className="font-mono font-medium text-sm">{value}</div>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (value: string) => (
        <div className="text-sm">{value}</div>
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
      render: (value: any) => (
        <div className="font-mono text-xs bg-muted p-2 rounded max-w-xs truncate">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </div>
      )
    },
    {
      key: "updated_at",
      label: "Last Updated",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Setting) => (
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
              if (confirm("Are you sure you want to delete this setting?")) {
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

  const totalSettings = settings.length;
  const categories = [...new Set(settings.map((s: any) => s.category))];
  const generalSettings = settings.filter((s: any) => s.category === "general").length;
  const categoriesSettings = settings.filter((s: any) => s.category === "categories").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Foundation Settings</h2>
          <p className="text-muted-foreground">Configure foundation system settings and preferences</p>
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
                    disabled={!!editingSetting}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="categories">Categories</SelectItem>
                      <SelectItem value="permissions">Permissions</SelectItem>
                      <SelectItem value="notifications">Notifications</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="setting_value">Setting Value (JSON) *</Label>
                <Textarea
                  id="setting_value"
                  value={JSON.stringify(formData.setting_value, null, 2)}
                  onChange={(e) => {
                    try {
                      const value = JSON.parse(e.target.value);
                      setFormData({ ...formData, setting_value: value });
                    } catch {
                      // Invalid JSON, keep current value
                    }
                  }}
                  rows={6}
                  placeholder='{"key": "value"} or ["item1", "item2"]'
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingSetting ? "Update" : "Create"} Setting
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSettings}</div>
            <p className="text-xs text-muted-foreground">All settings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Setting categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">General</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalSettings}</div>
            <p className="text-xs text-muted-foreground">General settings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesSettings}</div>
            <p className="text-xs text-muted-foreground">Category settings</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Foundation Settings"
        description="Manage system configuration and preferences"
        columns={columns}
        data={settings}
        emptyMessage="No settings configured yet"
        isLoading={isLoading}
      />
    </div>
  );
};

export default SettingsManager;
