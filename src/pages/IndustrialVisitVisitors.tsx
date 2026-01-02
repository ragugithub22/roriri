import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, ArrowLeft } from "lucide-react";

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

interface IndustrialVisitVisitorsProps {
  onNavigate?: (path: string) => void;
}

export default function IndustrialVisitVisitors({ onNavigate }: IndustrialVisitVisitorsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: visitors = [] } = useQuery({
    queryKey: ["industrial-visit-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_registrations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as IndustrialVisitRegistration[];
    },
  });

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("/industrial-visit");
    }
  };

  const handleView = (visitor: IndustrialVisitRegistration) => {
    if (onNavigate) {
      onNavigate(`/industrial-visit-visitor-details/${visitor.id}`);
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    (visitor.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (visitor.college_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (visitor.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Industrial Visit</h1>
            <p className="text-muted-foreground mt-2">Manage industrial visit registrations</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search:</span>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Visitor Type</TableHead>
                <TableHead>Mobile No</TableHead>
                <TableHead>College Name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((visitor, index) => (
                  <TableRow key={visitor.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{visitor.created_at ? new Date(visitor.created_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{visitor.full_name}</TableCell>
                    <TableCell>{visitor.visitor_type?.replace("_", " ") || "-"}</TableCell>
                    <TableCell>{visitor.mobile || "-"}</TableCell>
                    <TableCell>{visitor.college_name || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(visitor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {filteredVisitors.length > 0 ? 1 : 0} to {filteredVisitors.length} of {filteredVisitors.length} entries</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Prev</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
