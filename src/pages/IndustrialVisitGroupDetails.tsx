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

interface IndustrialVisitRegistration {
  id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  college_name: string | null;
  department: string | null;
  address: string | null;
  visitor_type: string;
  purpose_of_visit: string;
  created_at: string | null;
}

interface IndustrialVisitGroupDetailsProps {
  date: string;
  collegeName: string | null;
  address: string | null;
  onBack: () => void;
}

export default function IndustrialVisitGroupDetails({
  date,
  collegeName,
  address,
  onBack,
}: IndustrialVisitGroupDetailsProps) {
  const { data: groupRecords = [], isLoading } = useQuery({
    queryKey: ["industrial-visit-group-details", date, collegeName, address],
    queryFn: async () => {
      let query = supabase
        .from("industrial_visit_registrations")
        .select("*")
        .eq("visitor_type", "industrial_visit");

      // Filter by college_name
      if (collegeName) {
        query = query.eq("college_name", collegeName);
      } else {
        query = query.is("college_name", null);
      }

      // Filter by address
      if (address) {
        query = query.eq("address", address);
      } else {
        query = query.is("address", null);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Filter by date on client side since we're comparing formatted dates
      return (data || []).filter((record: IndustrialVisitRegistration) => {
        const recordDate = record.created_at
          ? new Date(record.created_at).toLocaleDateString()
          : "-";
        return recordDate === date;
      }) as IndustrialVisitRegistration[];
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Industrial Visit Records</h1>
            <p className="text-muted-foreground mt-2">
              {collegeName || "N/A"} - {date}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Purpose of Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : groupRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                groupRecords.map((record, index) => (
                  <TableRow key={record.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{record.full_name}</TableCell>
                    <TableCell>{record.mobile || "-"}</TableCell>
                    <TableCell>{record.email || "-"}</TableCell>
                    <TableCell>{record.department || "-"}</TableCell>
                    <TableCell>{record.purpose_of_visit || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {groupRecords.length > 0 ? 1 : 0} to {groupRecords.length} of{" "}
            {groupRecords.length} entries
          </div>
        </div>
      </div>
    </div>
  );
}
