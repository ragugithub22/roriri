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

      // Get user_ids
      const userIds = updatesData.map((u) => u.user_id).filter(Boolean);

      // Find profiles for these user_ids
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const profileEmails = profiles?.map((p) => p.email).filter(Boolean) || [];

      // Check user_login to find interns (internship_candidate)
      const { data: userLogins } = await supabase
        .from("user_login")
        .select("email, original_id, user_type")
        .eq("user_type", "internship_candidate")
        .in("email", profileEmails.length > 0 ? profileEmails : ["placeholder@example.com"]);

      // Get intern names
      const internIds = userLogins?.map((ul) => ul.original_id).filter(Boolean) || [];
      const { data: interns } = await supabase
        .from("internship_candidates")
        .select("id, name")
        .in("id", internIds.length > 0 ? internIds : ["00000000-0000-0000-0000-000000000000"]);

      // Create maps
      const profileEmailMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);
      const emailToInternId = new Map(userLogins?.map((ul) => [ul.email, ul.original_id]) || []);
      const internNameMap = new Map(interns?.map((i) => [i.id, i.name]) || []);
      const emailToUserType = new Map(userLogins?.map((ul) => [ul.email, ul.user_type]) || []);

      // Filter and enrich updates for interns only
      const internUpdates: InternDailyUpdate[] = [];

      for (const update of updatesData) {
        const email = profileEmailMap.get(update.user_id);
        if (email && emailToUserType.get(email) === "internship_candidate") {
          const internId = emailToInternId.get(email);
          const internName = internId ? internNameMap.get(internId) || "Unknown" : "Unknown";
          internUpdates.push({
            id: update.id,
            date: update.date,
            work_description: update.work_description,
            hours_spent: update.hours_spent,
            status: update.status,
            intern_name: internName,
          });
        }
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
