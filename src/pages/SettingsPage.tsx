import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Server, PlugZap, Bell, ShieldCheck } from "lucide-react";

interface Repository {
  id: string;
  repo_name: string;
  repo_url: string;
  platform: string | null;
  created_at: string;
}

interface Client {
  id: string;
  company_name: string;
  status: string;
  contact_person: string | null;
  email: string | null;
}

const SettingsPage = () => {
  const { data: repositories = [], isLoading: repoLoading } = useQuery({
    queryKey: ["it-park-repositories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repositories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Repository[]) ?? [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["it-park-clients-basic"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_clients")
        .select("id, company_name, status, contact_person, email")
        .limit(8);
      if (error) throw error;
      return (data as Client[]) ?? [];
    },
  });

  const [featureFlags, setFeatureFlags] = useState({
    autoDeploy: true,
    requireApprovals: true,
    enableAlerts: true,
    enforceMfa: true,
  });
  const [maintenanceWindow, setMaintenanceWindow] = useState({
    day: "Saturday",
    start: "22:00 IST",
    duration: "2 hours",
  });
  const [notificationRecipients, setNotificationRecipients] = useState(
    "devops@roriri.com; platform@roriri.com"
  );
  const [maintenanceNotes, setMaintenanceNotes] = useState(
    "Platform running on Azure + AWS hybrid cluster. Keep staging in sync before promoting releases."
  );
  const [runbookNotes, setRunbookNotes] = useState(
    "Track production change approvals in Jira ITOPS board."
  );

  const handleFeatureToggle = (flag: keyof typeof featureFlags, value: boolean) => {
    setFeatureFlags((prev) => ({ ...prev, [flag]: value }));
  };

  const handleSavePreferences = () => {
    toast.success("IT Park preferences updated");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Deployment Controls
            </CardTitle>
            <CardDescription>Configure how the IT Park platform ships code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Automatic Deployments</p>
                <p className="text-sm text-muted-foreground">
                  Promote successful builds to staging without manual steps
                </p>
              </div>
              <Switch
                checked={featureFlags.autoDeploy}
                onCheckedChange={(value) => handleFeatureToggle("autoDeploy", value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Manual Approval Gate</p>
                <p className="text-sm text-muted-foreground">Require platform lead sign-off for prod</p>
              </div>
              <Switch
                checked={featureFlags.requireApprovals}
                onCheckedChange={(value) => handleFeatureToggle("requireApprovals", value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlugZap className="h-5 w-5" />
              Maintenance Window
            </CardTitle>
            <CardDescription>Keep infra changes predictable for the IT Park tenants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Day</p>
                <Input
                  value={maintenanceWindow.day}
                  onChange={(e) => setMaintenanceWindow((prev) => ({ ...prev, day: e.target.value }))}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start</p>
                <Input
                  value={maintenanceWindow.start}
                  onChange={(e) => setMaintenanceWindow((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <Input
                  value={maintenanceWindow.duration}
                  onChange={(e) => setMaintenanceWindow((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Escalation Notes</p>
              <Textarea
                rows={3}
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
              />
            </div>
            <Button onClick={handleSavePreferences}>Save Maintenance Plan</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Security & Alerts
          </CardTitle>
          <CardDescription>Notification channels and policy enforcement for IT Park</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Multifactor Authentication</p>
              <p className="text-sm text-muted-foreground">Force MFA for DevOps and admin accounts</p>
            </div>
            <Switch
              checked={featureFlags.enforceMfa}
              onCheckedChange={(value) => handleFeatureToggle("enforceMfa", value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Realtime Alerts</p>
              <p className="text-sm text-muted-foreground">Send pager notifications for failed pipelines</p>
            </div>
            <Switch
              checked={featureFlags.enableAlerts}
              onCheckedChange={(value) => handleFeatureToggle("enableAlerts", value)}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Alert Recipients</p>
            <Input
              value={notificationRecipients}
              onChange={(e) => setNotificationRecipients(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Separate multiple emails with semicolons</p>
          </div>
          <Button variant="secondary" onClick={handleSavePreferences}>
            Update Alerting
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connected Repositories</CardTitle>
            <CardDescription>Source control integrations linked to IT Park projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {repoLoading && <p className="text-sm text-muted-foreground">Loading repositories…</p>}
            {!repoLoading && repositories.length === 0 && (
              <p className="text-sm text-muted-foreground">No repositories connected.</p>
            )}
            {repositories.slice(0, 6).map((repo) => (
              <div key={repo.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{repo.repo_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[260px]">{repo.repo_url}</p>
                </div>
                <Badge variant="outline">{repo.platform || "custom"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Channels</CardTitle>
            <CardDescription>Preferred handoff paths for IT Park partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clients.length === 0 && (
              <p className="text-sm text-muted-foreground">No IT clients found.</p>
            )}
            {clients.map((client) => (
              <div key={client.id} className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{client.company_name}</p>
                  <Badge variant={client.status === "active" ? "default" : "secondary"}>
                    {client.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {client.contact_person || "No owner"} · {client.email || "No email"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Change Log
          </CardTitle>
          <CardDescription>Document assumptions for the IT Park operations handbook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={5}
            value={runbookNotes}
            onChange={(e) => setRunbookNotes(e.target.value)}
          />
          <Button onClick={handleSavePreferences}>Save Notes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
