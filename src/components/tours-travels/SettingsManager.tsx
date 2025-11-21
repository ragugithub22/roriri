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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Mail, Phone, MapPin, Globe } from "lucide-react";
import { toast } from "sonner";

export default function SettingsManager() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["tours-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_settings")
        .select("*")
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || {};
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const { error } = await supabase
        .from("tours_settings")
        .upsert(settingsData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tours-settings"] });
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const settingsData = {
      company_name: formData.get("company_name"),
      company_address: formData.get("company_address"),
      company_phone: formData.get("company_phone"),
      company_email: formData.get("company_email"),
      company_website: formData.get("company_website"),
      gst_number: formData.get("gst_number"),
      pan_number: formData.get("pan_number"),
      license_number: formData.get("license_number"),
      default_currency: formData.get("default_currency") || "INR",
      booking_prefix: formData.get("booking_prefix") || "BK",
      quotation_prefix: formData.get("quotation_prefix") || "QT",
      customer_prefix: formData.get("customer_prefix") || "CUS",
      vehicle_prefix: formData.get("vehicle_prefix") || "VH",
      driver_prefix: formData.get("driver_prefix") || "DRV",
      email_notifications: formData.get("email_notifications") === "on",
      sms_notifications: formData.get("sms_notifications") === "on",
      auto_backup: formData.get("auto_backup") === "on",
      maintenance_reminders: formData.get("maintenance_reminders") === "on",
      payment_reminders: formData.get("payment_reminders") === "on",
      terms_conditions: formData.get("terms_conditions"),
      privacy_policy: formData.get("privacy_policy"),
      cancellation_policy: formData.get("cancellation_policy"),
      refund_policy: formData.get("refund_policy"),
    };
    saveMutation.mutate(settingsData);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure your tours and travels business settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    defaultValue={settings?.company_name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_email">Company Email</Label>
                  <Input
                    id="company_email"
                    name="company_email"
                    type="email"
                    defaultValue={settings?.company_email}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_phone">Company Phone</Label>
                  <Input
                    id="company_phone"
                    name="company_phone"
                    defaultValue={settings?.company_phone}
                  />
                </div>
                <div>
                  <Label htmlFor="company_website">Company Website</Label>
                  <Input
                    id="company_website"
                    name="company_website"
                    defaultValue={settings?.company_website}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  name="company_address"
                  defaultValue={settings?.company_address}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    name="gst_number"
                    defaultValue={settings?.gst_number}
                  />
                </div>
                <div>
                  <Label htmlFor="pan_number">PAN Number</Label>
                  <Input
                    id="pan_number"
                    name="pan_number"
                    defaultValue={settings?.pan_number}
                  />
                </div>
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    defaultValue={settings?.license_number}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Select name="default_currency" defaultValue={settings?.default_currency || "INR"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="booking_prefix">Booking ID Prefix</Label>
                  <Input
                    id="booking_prefix"
                    name="booking_prefix"
                    defaultValue={settings?.booking_prefix || "BK"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quotation_prefix">Quotation ID Prefix</Label>
                  <Input
                    id="quotation_prefix"
                    name="quotation_prefix"
                    defaultValue={settings?.quotation_prefix || "QT"}
                  />
                </div>
                <div>
                  <Label htmlFor="customer_prefix">Customer ID Prefix</Label>
                  <Input
                    id="customer_prefix"
                    name="customer_prefix"
                    defaultValue={settings?.customer_prefix || "CUS"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle_prefix">Vehicle ID Prefix</Label>
                  <Input
                    id="vehicle_prefix"
                    name="vehicle_prefix"
                    defaultValue={settings?.vehicle_prefix || "VH"}
                  />
                </div>
                <div>
                  <Label htmlFor="driver_prefix">Driver ID Prefix</Label>
                  <Input
                    id="driver_prefix"
                    name="driver_prefix"
                    defaultValue={settings?.driver_prefix || "DRV"}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Send email notifications for bookings and updates
                    </div>
                  </div>
                  <Switch
                    id="email_notifications"
                    name="email_notifications"
                    defaultChecked={settings?.email_notifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Send SMS notifications for important updates
                    </div>
                  </div>
                  <Switch
                    id="sms_notifications"
                    name="sms_notifications"
                    defaultChecked={settings?.sms_notifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto_backup">Auto Backup</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically backup data daily
                    </div>
                  </div>
                  <Switch
                    id="auto_backup"
                    name="auto_backup"
                    defaultChecked={settings?.auto_backup}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance_reminders">Maintenance Reminders</Label>
                    <div className="text-sm text-muted-foreground">
                      Send reminders for vehicle maintenance
                    </div>
                  </div>
                  <Switch
                    id="maintenance_reminders"
                    name="maintenance_reminders"
                    defaultChecked={settings?.maintenance_reminders}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment_reminders">Payment Reminders</Label>
                    <div className="text-sm text-muted-foreground">
                      Send payment reminders to customers
                    </div>
                  </div>
                  <Switch
                    id="payment_reminders"
                    name="payment_reminders"
                    defaultChecked={settings?.payment_reminders}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              <div>
                <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                <Textarea
                  id="terms_conditions"
                  name="terms_conditions"
                  defaultValue={settings?.terms_conditions}
                  rows={6}
                  placeholder="Enter your terms and conditions..."
                />
              </div>
              <div>
                <Label htmlFor="privacy_policy">Privacy Policy</Label>
                <Textarea
                  id="privacy_policy"
                  name="privacy_policy"
                  defaultValue={settings?.privacy_policy}
                  rows={6}
                  placeholder="Enter your privacy policy..."
                />
              </div>
              <div>
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation_policy"
                  name="cancellation_policy"
                  defaultValue={settings?.cancellation_policy}
                  rows={4}
                  placeholder="Enter your cancellation policy..."
                />
              </div>
              <div>
                <Label htmlFor="refund_policy">Refund Policy</Label>
                <Textarea
                  id="refund_policy"
                  name="refund_policy"
                  defaultValue={settings?.refund_policy}
                  rows={4}
                  placeholder="Enter your refund policy..."
                />
              </div>
            </TabsContent>

            <div className="flex justify-end mt-6">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
