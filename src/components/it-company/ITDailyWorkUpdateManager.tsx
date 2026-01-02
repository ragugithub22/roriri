import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface DailyUpdate {
  id: string;
  date: string;
  work_description: string;
  hours_spent: number;
  status: string;
  user_id: string;
  employee_id: string | null;
  sender_name: string;
  sender_type: string;
  created_at: string;
}

const ITDailyWorkUpdateManager = () => {
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["it-company-daily-work-updates"],
    queryFn: async () => {
      // Fetch all daily work updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("daily_work_updates")
        .select("*")
        .order("date", { ascending: false });

      if (updatesError) throw updatesError;
      if (!updatesData || updatesData.length === 0) return [];

      // Get all user_ids from updates
      const userIds = updatesData
        .map((u) => u.user_id)
        .filter((id): id is string => id !== null);

      // Get all employee_ids from updates
      const employeeIds = updatesData
        .map((u) => u.employee_id)
        .filter((id): id is string => id !== null);

      const placeholderId = "00000000-0000-0000-0000-000000000000";

      // Fetch employees by profile_id (user_id)
      const { data: employeesByProfile } = await supabase
        .from("employees")
        .select("id, profile_id")
        .in("profile_id", userIds.length > 0 ? userIds : [placeholderId]);

      // Fetch employees by employee_id
      const { data: employeesById } = await supabase
        .from("employees")
        .select("id, profile_id")
        .in("id", employeeIds.length > 0 ? employeeIds : [placeholderId]);

      // Get all profile_ids
      const allProfileIds = [
        ...(employeesByProfile?.map((e) => e.profile_id) || []),
        ...(employeesById?.map((e) => e.profile_id) || []),
      ].filter(Boolean);

      // Fetch profiles for names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", allProfileIds.length > 0 ? allProfileIds : [placeholderId]);

      // Fetch interns - check if user_id matches intern id via user_login
      const { data: userLogins } = await supabase
        .from("user_login")
        .select("email, original_id, user_type")
        .eq("user_type", "internship_candidate");

      // Get intern original_ids
      const internOriginalIds = userLogins?.map((ul) => ul.original_id).filter(Boolean) || [];

      // Fetch intern names
      const { data: interns } = await supabase
        .from("internship_candidates")
        .select("id, name")
        .in("id", internOriginalIds.length > 0 ? internOriginalIds : [placeholderId]);

      // Create lookup maps
      const employeeByProfileId = new Map(
        employeesByProfile?.map((e) => [e.profile_id, e.id]) || []
      );
      const employeeProfileById = new Map(
        employeesById?.map((e) => [e.id, e.profile_id]) || []
      );
      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);
      const internMap = new Map(interns?.map((i) => [i.id, i.name]) || []);
      
      // Map user_login email to intern info
      const userLoginToIntern = new Map(
        userLogins?.map((ul) => [ul.email, ul.original_id]) || []
      );

      // Enrich updates with sender info
      const enrichedUpdates = await Promise.all(
        updatesData.map(async (update) => {
          let senderName = "Unknown";
          let senderType = "Unknown";

          // Check if user_id belongs to an employee
          if (employeeByProfileId.has(update.user_id)) {
            senderName = profileMap.get(update.user_id) || "Unknown";
            senderType = "Employee";
          } 
          // Check if employee_id is set
          else if (update.employee_id && employeeProfileById.has(update.employee_id)) {
            const profileId = employeeProfileById.get(update.employee_id);
            senderName = profileMap.get(profileId!) || "Unknown";
            senderType = "Employee";
          }
          // Check if it's an intern - get profile email and check user_login
          else {
            // Try to find profile email
            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", update.user_id)
              .maybeSingle();

            if (profile?.email && userLoginToIntern.has(profile.email)) {
              const internId = userLoginToIntern.get(profile.email);
              senderName = internMap.get(internId!) || "Unknown";
              senderType = "Intern";
            } else {
              // Fallback to profile name
              senderName = profileMap.get(update.user_id) || "Unknown";
              senderType = "User";
            }
          }

          return {
            ...update,
            sender_name: senderName,
            sender_type: senderType,
          };
        })
      );

      // Filter to only show Employee updates (profile user_type)
      return enrichedUpdates.filter(
        (u) => u.sender_type === "Employee"
      ) as DailyUpdate[];
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
        <CardTitle className="text-xl font-semibold">Daily Work Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Loading updates...</div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No daily work updates found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
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
                  <TableCell>{update.sender_name}</TableCell>
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

export default ITDailyWorkUpdateManager;
