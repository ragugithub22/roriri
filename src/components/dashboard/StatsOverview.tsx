import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Activity } from "lucide-react";

const StatsOverview = () => {
  const globalStats = [
    {
      icon: Building2,
      label: "Active Entities",
      value: "7",
      sublabel: "Business Units",
      color: "text-primary",
    },
    {
      icon: Users,
      label: "Total Workforce",
      value: "3,247",
      sublabel: "Employees & Staff",
      color: "text-accent",
    },
    {
      icon: TrendingUp,
      label: "Annual Revenue",
      value: "₹125.8M",
      sublabel: "+18% YoY",
      color: "text-success",
    },
    {
      icon: Activity,
      label: "System Uptime",
      value: "99.8%",
      sublabel: "Last 30 days",
      color: "text-info",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {globalStats.map((stat, index) => (
        <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
