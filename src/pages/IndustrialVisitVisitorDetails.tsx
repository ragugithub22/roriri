import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export default function IndustrialVisitVisitorDetails() {
  const { visitorId } = useParams();
  const navigate = useNavigate();

  const { data: visitorRecord } = useQuery({
    queryKey: ["visitor-record", visitorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_visitors")
        .select("*")
        .eq("id", visitorId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ["visitor-registrations", visitorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_registrations")
        .select("*")
        .eq("visitor_record_id", visitorId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Visitor Details</h1>
          {visitorRecord && (
            <p className="text-muted-foreground mt-1">
              {visitorRecord.college_name} - {visitorRecord.department}
            </p>
          )}
        </div>
      </div>

      {visitorRecord && (
        <div className="bg-card rounded-lg p-6 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">College Name</p>
              <p className="font-semibold">{visitorRecord.college_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-semibold">{visitorRecord.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visit Date</p>
              <p className="font-semibold">{new Date(visitorRecord.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold">{visitorRecord.status}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Registered Visitors</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No registrations yet
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg, index) => (
                  <TableRow key={reg.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{reg.full_name}</TableCell>
                    <TableCell>{reg.mobile}</TableCell>
                    <TableCell>{reg.email || "-"}</TableCell>
                    <TableCell>{reg.purpose_of_visit}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
