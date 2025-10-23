import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  description?: string;
}

const QuickActions = ({ 
  actions, 
  title = "Quick Actions",
  description = "Common tasks and operations"
}: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || "outline"}
                onClick={action.onClick}
                className="justify-start h-auto py-4"
              >
                <Icon className="mr-2 h-5 w-5" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
