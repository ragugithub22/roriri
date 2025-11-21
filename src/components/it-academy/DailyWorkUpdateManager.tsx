import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DailyWorkUpdateManager() {
  const { data: workUpdates = [] } = useQuery({
    queryKey: ["academy-daily-work-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_daily_work_updates" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Work Updates</CardTitle>
          <CardDescription>View daily work updates from trainees</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Trainee</TableHead>
                <TableHead>Work Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workUpdates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No work updates found
                  </TableCell>
                </TableRow>
              ) : (
                workUpdates.map((update: any) => (
                  <TableRow key={update.id}>
                    <TableCell>{new Date(update.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{update.trainee_name || 'N/A'}</TableCell>
                    <TableCell>{update.work_description}</TableCell>
                    <TableCell>{update.status || 'Pending'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
