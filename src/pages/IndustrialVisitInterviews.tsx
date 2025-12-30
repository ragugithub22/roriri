import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function IndustrialVisitInterviews() {
  const navigate = useNavigate();

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["interview-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_registrations")
        .select("*")
        .eq("visitor_type", "interview")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("/industrial-visit")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Interview Visitors</h1>
          <p className="text-muted-foreground">Manage interview visitor registrations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <CardTitle>Interview Registrations ({interviews.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : interviews.length === 0 ? (
            <p className="text-muted-foreground">No interview registrations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">{interview.full_name}</TableCell>
                      <TableCell>{interview.mobile}</TableCell>
                      <TableCell>{interview.email || "-"}</TableCell>
                      <TableCell>{interview.purpose_of_visit}</TableCell>
                      <TableCell>
                        {new Date(interview.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
