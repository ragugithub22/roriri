import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TraineeDailyUpdate {
  id: string;
  date: string;
  work_description: string;
  hours_spent: number;
  status: string;
  trainee_name: string;
}

export default function DailyWorkUpdateManager() {
  const { data: workUpdates = [], isLoading } = useQuery({
    queryKey: ["academy-trainee-daily-work-updates"],
    queryFn: async () => {
      // Fetch all daily work updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("daily_work_updates")
        .select("*")
        .order("date", { ascending: false });

      if (updatesError) throw updatesError;
      if (!updatesData || updatesData.length === 0) return [];

      // Get user_ids from updates
      const userIds = updatesData.map((u) => u.user_id).filter(Boolean);

      // Check user_login to find students (trainees) - match by original_id
      const { data: userLogins } = await supabase
        .from("user_login")
        .select("email, original_id, user_type")
        .eq("user_type", "student")
        .in("original_id", userIds);

      // Get student names
      const studentIds = userLogins?.map((ul) => ul.original_id).filter(Boolean) || [];
      const { data: students } = await supabase
        .from("students")
        .select("id, full_name")
        .in("id", studentIds.length > 0 ? studentIds : ["00000000-0000-0000-0000-000000000000"]);

      // Create maps
      const originalIdToUserType = new Map(userLogins?.map((ul) => [ul.original_id, ul.user_type]) || []);
      const studentNameMap = new Map(students?.map((s) => [s.id, s.full_name]) || []);

      // Filter and enrich updates for trainees only
      const traineeUpdates: TraineeDailyUpdate[] = [];

      for (const update of updatesData) {
        // Check if user_id is a student original_id
        if (originalIdToUserType.get(update.user_id) === "student") {
          const traineeName = studentNameMap.get(update.user_id) || "Unknown";
          traineeUpdates.push({
            id: update.id,
            date: update.date,
            work_description: update.work_description,
            hours_spent: update.hours_spent,
            status: update.status,
            trainee_name: traineeName,
          });
        }
      }

      return traineeUpdates;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Work Updates</CardTitle>
          <CardDescription>View daily work updates from trainees</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading updates...</div>
          ) : workUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trainee work updates found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Work Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workUpdates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell className="font-medium">
                      {format(new Date(update.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{update.trainee_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{update.work_description}</TableCell>
                    <TableCell>{update.hours_spent}h</TableCell>
                    <TableCell>{getStatusBadge(update.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
