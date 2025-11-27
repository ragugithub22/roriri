// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building2, Bell, Shield, Database } from "lucide-react";
import { toast } from "sonner";

const SettingsManager = () => {
  const [companySettings, setCompanySettings] = useState({
    company_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    company_website: "",
    gst_number: "",
    pan_number: "",
    license_number: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    project_updates: true,
    payment_reminders: true,
    low_stock_alerts: true,
    expiry_alerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    auto_backup: true,
    backup_frequency: "daily",
    data_retention_days: 365,
    multi_language_support: false,
    dark_mode: false
  });

  const queryClient = useQueryClient();
  const supabaseClient = supabase as any;

  // Fetch current settings
  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-settings"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_settings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      // In a real implementation, this would update the settings table
      // For now, we'll just simulate the update
      return settingsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update settings: " + error.message);
    },
  });

  const handleCompanySettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      type: "company",
      data: companySettings
    });
  };

  const handleNotificationSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      type: "notifications",
      data: notificationSettings
    });
  };

  const handleSystemSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      type: "system",
      data: systemSettings
    });
  };

  const handleExportData = () => {
    // In a real implementation, this would export all data
    toast.info("Data export functionality would be implemented here");
  };

  const handleImportData = () => {
    // In a real implementation, this would import data
    toast.info("Data import functionality would be implemented here");
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      // Reset to defaults
      setCompanySettings({
        company_name: "",
        company_address: "",
        company_phone: "",
        company_email: "",
        company_website: "",
        gst_number: "",
        pan_number: "",
        license_number: ""
      });
      setNotificationSettings({
        email_notifications: true,
        sms_notifications: false,
        project_updates: true,
        payment_reminders: true,
        low_stock_alerts: true,
        expiry_alerts: true
      });
      setSystemSettings({
        auto_backup: true,
        backup_frequency: "daily",
        data_retention_days: 365,
        multi_language_support: false,
        dark_mode: false
      });
      toast.success("Settings reset to default");
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySettingsSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={companySettings.company_name}
                      onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_email">Company Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={companySettings.company_email}
                      onChange={(e) => setCompanySettings({ ...companySettings, company_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_phone">Company Phone</Label>
                    <Input
                      id="company_phone"
                      value={companySettings.company_phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, company_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_website">Company Website</Label>
                    <Input
                      id="company_website"
                      value={companySettings.company_website}
                      onChange={(e) => setCompanySettings({ ...companySettings, company_website: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input
                      id="gst_number"
                      value={companySettings.gst_number}
                      onChange={(e) => setCompanySettings({ ...companySettings, gst_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={companySettings.pan_number}
                      onChange={(e) => setCompanySettings({ ...companySettings, pan_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      value={companySettings.license_number}
                      onChange={(e) => setCompanySettings({ ...companySettings, license_number: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company_address">Company Address</Label>
                  <Textarea
                    id="company_address"
                    value={companySettings.company_address}
                    onChange={(e) => setCompanySettings({ ...companySettings, company_address: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={updateSettingsMutation.isPending}>
                  Save Company Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSettingsSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms_notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="sms_notifications"
                      checked={notificationSettings.sms_notifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, sms_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="project_updates">Project Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about project status changes</p>
                    </div>
                    <Switch
                      id="project_updates"
                      checked={notificationSettings.project_updates}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, project_updates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment_reminders">Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive payment due reminders</p>
                    </div>
                    <Switch
                      id="payment_reminders"
                      checked={notificationSettings.payment_reminders}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, payment_reminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get alerts when materials are low in stock</p>
                    </div>
                    <Switch
                      id="low_stock_alerts"
                      checked={notificationSettings.low_stock_alerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, low_stock_alerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="expiry_alerts">Expiry Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts for expiring documents</p>
                    </div>
                    <Switch
                      id="expiry_alerts"
                      checked={notificationSettings.expiry_alerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, expiry_alerts: checked })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateSettingsMutation.isPending}>
                  Save Notification Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSettingsSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto_backup">Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup data</p>
                    </div>
                    <Switch
                      id="auto_backup"
                      checked={systemSettings.auto_backup}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, auto_backup: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="multi_language_support">Multi-language Support</Label>
                      <p className="text-sm text-muted-foreground">Enable multiple language support</p>
                    </div>
                    <Switch
                      id="multi_language_support"
                      checked={systemSettings.multi_language_support}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, multi_language_support: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark_mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable dark mode theme</p>
                    </div>
                    <Switch
                      id="dark_mode"
                      checked={systemSettings.dark_mode}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, dark_mode: checked })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backup_frequency">Backup Frequency</Label>
                    <select
                      id="backup_frequency"
                      value={systemSettings.backup_frequency}
                      onChange={(e) => setSystemSettings({ ...systemSettings, backup_frequency: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="data_retention_days">Data Retention (Days)</Label>
                    <Input
                      id="data_retention_days"
                      type="number"
                      value={systemSettings.data_retention_days}
                      onChange={(e) => setSystemSettings({ ...systemSettings, data_retention_days: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateSettingsMutation.isPending}>
                  Save System Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={handleExportData} variant="outline">
                      Export All Data
                    </Button>
                    <Button onClick={handleImportData} variant="outline">
                      Import Data
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <Button onClick={handleResetSettings} variant="destructive">
                      Reset All Settings to Default
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Version:</span> 1.0.0
                  </div>
                  <div>
                    <span className="font-medium">Last Backup:</span> Never
                  </div>
                  <div>
                    <span className="font-medium">Database Size:</span> ~50 MB
                  </div>
                  <div>
                    <span className="font-medium">Active Users:</span> 1
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;
