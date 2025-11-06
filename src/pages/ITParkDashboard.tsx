import { Building2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ITParkDashboard() {
  return (
    <DashboardLayout
      entityName="RORIRI IT Park"
      entityIcon={Building2}
      entityColor="from-blue-600 to-indigo-600"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>IT Park Overview</CardTitle>
            <CardDescription>Comprehensive IT infrastructure and facility management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              IT Park dashboard features coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
