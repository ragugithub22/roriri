import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface InternDailyUpdate {
  id: string;
  date: string;
  work_description: string;
  hours_spent: number;
  status: string;
  intern_name: string;
}

const InternDailyWorkUpdateManager = () => {
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["intern-daily-work-updates"],
    queryFn: async () => {
      // Fetch all daily work updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("daily_work_updates")
        .select("*")
        .order("date", { ascending: false });

      if (updatesError) throw updatesError;
      if (!updatesData || updatesData.length === 0) return [];

      // NOTE: We intentionally do NOT rely on user_login here because it can be RLS-restricted.
      // Daily updates for interns store the intern's internship_candidates.id in daily_work_updates.user_id.
      const userIds = updatesData.map((u) => u.user_id).filter(Boolean);
      const placeholderId = "00000000-0000-0000-0000-000000000000";

      const { data: interns, error: internsError } = await supabase
        .from("internship_candidates")
        .select("id, name")
        .in("id", userIds.length > 0 ? userIds : [placeholderId]);

      if (internsError) throw internsError;

      const internNameMap = new Map(interns?.map((i) => [i.id, i.name]) || []);

      // Filter and enrich updates for interns only
      const internUpdates: InternDailyUpdate[] = [];

      for (const update of updatesData) {
        const internName = internNameMap.get(update.user_id);
        if (!internName) continue;

        internUpdates.push({
          id: update.id,
          date: update.date,
          work_description: update.work_description,
          hours_spent: update.hours_spent,
          status: update.status,
          intern_name: internName,
        });
      }

      return internUpdates;
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Intern Daily Work Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Loading updates...</div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No intern work updates found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Intern Name</TableHead>
                <TableHead>Work Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {updates.map((update) => (
                <TableRow key={update.id}>
                  <TableCell className="font-medium">
                    {format(new Date(update.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{update.intern_name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {update.work_description}
                  </TableCell>
                  <TableCell>{update.hours_spent}h</TableCell>
                  <TableCell>{getStatusBadge(update.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default InternDailyWorkUpdateManager;
