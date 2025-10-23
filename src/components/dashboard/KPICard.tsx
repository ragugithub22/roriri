import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: LucideIcon;
  color?: string;
}

const KPICard = ({ title, value, subtitle, trend, icon: Icon, color = "from-primary to-accent" }: KPICardProps) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
            isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
          }`}>
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
