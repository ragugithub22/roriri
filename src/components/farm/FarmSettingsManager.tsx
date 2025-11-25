import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, RefreshCw, Clock, Users, DollarSign, Bell } from "lucide-react";
import { toast } from "sonner";

interface FarmSettings {
  id: string;
  farm_name: string;
  farm_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  operating_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  pricing: {
    adult_ticket: number;
    child_ticket: number;
    senior_ticket: number;
    group_discount: number;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    booking_confirmations: boolean;
    payment_reminders: boolean;
    maintenance_alerts: boolean;
  };
  features: {
    online_booking: boolean;
    food_orders: boolean;
    events: boolean;
    games: boolean;
  };
  created_at: string;
  updated_at: string;
}

const FarmSettingsManager = () => {
  const [settings, setSettings] = useState<FarmSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["farm-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farm_settings" as any)
        .select("*")
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return (data as unknown) as FarmSettings;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<FarmSettings>) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("farm_settings" as any)
        .upsert([{
          ...updateData,
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update settings: " + error.message);
    },
  });

  const handleSave = (section: string, data: any) => {
    if (!settings) return;

    const updatedSettings = { ...settings };
    updatedSettings[section as keyof FarmSettings] = data;
    setSettings(updatedSettings);
    updateMutation.mutate(updatedSettings);
  };

  const defaultSettings: FarmSettings = {
    id: "1",
    farm_name: "Roriri Farm",
    farm_description: "A beautiful farm experience with animals, games, and delicious food.",
    contact_email: "info@roririfarm.com",
    contact_phone: "+91-9876543210",
    address: "123 Farm Road, Rural Area, State - 123456",
    operating_hours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "18:00", closed: false },
      sunday: { open: "09:00", close: "18:00", closed: false },
    },
    pricing: {
      adult_ticket: 500,
      child_ticket: 300,
      senior_ticket: 400,
      group_discount: 10,
    },
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      booking_confirmations: true,
      payment_reminders: true,
      maintenance_alerts: true,
    },
    features: {
      online_booking: true,
      food_orders: true,
      events: true,
      games: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (settingsLoading) {
    return <div>Loading settings...</div>;
  }

  const currentSettings = settingsData || defaultSettings;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Farm Settings</h2>
          <p className="text-muted-foreground">Configure farm information, pricing, and preferences</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Operating Hours</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Information
              </CardTitle>
              <CardDescription>
                Basic farm information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farm_name">Farm Name</Label>
                  <Input
                    id="farm_name"
                    value={currentSettings.farm_name}
                    onChange={(e) => setSettings({ ...currentSettings, farm_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={currentSettings.contact_email}
                    onChange={(e) => setSettings({ ...currentSettings, contact_email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="farm_description">Farm Description</Label>
                <Textarea
                  id="farm_description"
                  value={currentSettings.farm_description}
                  onChange={(e) => setSettings({ ...currentSettings, farm_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={currentSettings.contact_phone}
                    onChange={(e) => setSettings({ ...currentSettings, contact_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={currentSettings.address}
                    onChange={(e) => setSettings({ ...currentSettings, address: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('general', {
                farm_name: currentSettings.farm_name,
                farm_description: currentSettings.farm_description,
                contact_email: currentSettings.contact_email,
                contact_phone: currentSettings.contact_phone,
                address: currentSettings.address
              })}>
                <Save className="mr-2 h-4 w-4" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
              <CardDescription>
                Set operating hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(currentSettings.operating_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-20 capitalize font-medium">{day}</div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => {
                        const updatedHours = { ...currentSettings.operating_hours };
                        updatedHours[day as keyof typeof updatedHours] = { ...hours, closed: !checked };
                        setSettings({ ...currentSettings, operating_hours: updatedHours });
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {hours.closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  {!hours.closed && (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => {
                          const updatedHours = { ...currentSettings.operating_hours };
                          updatedHours[day as keyof typeof updatedHours] = { ...hours, open: e.target.value };
                          setSettings({ ...currentSettings, operating_hours: updatedHours });
                        }}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => {
                          const updatedHours = { ...currentSettings.operating_hours };
                          updatedHours[day as keyof typeof updatedHours] = { ...hours, close: e.target.value };
                          setSettings({ ...currentSettings, operating_hours: updatedHours });
                        }}
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              ))}

              <Button onClick={() => handleSave('operating_hours', currentSettings.operating_hours)}>
                <Save className="mr-2 h-4 w-4" />
                Save Operating Hours
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ticket Pricing
              </CardTitle>
              <CardDescription>
                Set ticket prices and discounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adult_ticket">Adult Ticket (₹)</Label>
                  <Input
                    id="adult_ticket"
                    type="number"
                    min="0"
                    value={currentSettings.pricing.adult_ticket}
                    onChange={(e) => setSettings({
                      ...currentSettings,
                      pricing: { ...currentSettings.pricing, adult_ticket: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="child_ticket">Child Ticket (₹)</Label>
                  <Input
                    id="child_ticket"
                    type="number"
                    min="0"
                    value={currentSettings.pricing.child_ticket}
                    onChange={(e) => setSettings({
                      ...currentSettings,
                      pricing: { ...currentSettings.pricing, child_ticket: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senior_ticket">Senior Ticket (₹)</Label>
                  <Input
                    id="senior_ticket"
                    type="number"
                    min="0"
                    value={currentSettings.pricing.senior_ticket}
                    onChange={(e) => setSettings({
                      ...currentSettings,
                      pricing: { ...currentSettings.pricing, senior_ticket: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="group_discount">Group Discount (%)</Label>
                  <Input
                    id="group_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={currentSettings.pricing.group_discount}
                    onChange={(e) => setSettings({
                      ...currentSettings,
                      pricing: { ...currentSettings.pricing, group_discount: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('pricing', currentSettings.pricing)}>
                <Save className="mr-2 h-4 w-4" />
                Save Pricing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={currentSettings.notifications.email_notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      notifications: { ...currentSettings.notifications, email_notifications: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms_notifications"
                    checked={currentSettings.notifications.sms_notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      notifications: { ...currentSettings.notifications, sms_notifications: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="booking_confirmations">Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Send confirmation emails for bookings</p>
                  </div>
                  <Switch
                    id="booking_confirmations"
                    checked={currentSettings.notifications.booking_confirmations}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      notifications: { ...currentSettings.notifications, booking_confirmations: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment_reminders">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send payment reminder notifications</p>
                  </div>
                  <Switch
                    id="payment_reminders"
                    checked={currentSettings.notifications.payment_reminders}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      notifications: { ...currentSettings.notifications, payment_reminders: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance_alerts">Maintenance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive maintenance and system alerts</p>
                  </div>
                  <Switch
                    id="maintenance_alerts"
                    checked={currentSettings.notifications.maintenance_alerts}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      notifications: { ...currentSettings.notifications, maintenance_alerts: checked }
                    })}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('notifications', currentSettings.notifications)}>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Feature Settings
              </CardTitle>
              <CardDescription>
                Enable or disable farm features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="online_booking">Online Booking</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to book tickets online</p>
                  </div>
                  <Switch
                    id="online_booking"
                    checked={currentSettings.features.online_booking}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      features: { ...currentSettings.features, online_booking: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="food_orders">Food Orders</Label>
                    <p className="text-sm text-muted-foreground">Enable food ordering system</p>
                  </div>
                  <Switch
                    id="food_orders"
                    checked={currentSettings.features.food_orders}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      features: { ...currentSettings.features, food_orders: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="events">Events</Label>
                    <p className="text-sm text-muted-foreground">Enable event management system</p>
                  </div>
                  <Switch
                    id="events"
                    checked={currentSettings.features.events}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      features: { ...currentSettings.features, events: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="games">Games</Label>
                    <p className="text-sm text-muted-foreground">Enable games and activities</p>
                  </div>
                  <Switch
                    id="games"
                    checked={currentSettings.features.games}
                    onCheckedChange={(checked) => setSettings({
                      ...currentSettings,
                      features: { ...currentSettings.features, games: checked }
                    })}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('features', currentSettings.features)}>
                <Save className="mr-2 h-4 w-4" />
                Save Feature Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmSettingsManager;
