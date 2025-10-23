import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  action: string;
  details?: string | number | boolean | null | { [key: string]: any };
  created_at: string;
  user?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  description?: string;
}

const ActivityFeed = ({ 
  activities, 
  title = "Recent Activity",
  description = "Latest updates and changes"
}: ActivityFeedProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground">
                        {typeof activity.details === 'object' 
                          ? JSON.stringify(activity.details) 
                          : String(activity.details)}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </Badge>
                      {activity.user && (
                        <span className="text-xs text-muted-foreground">by {activity.user}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
