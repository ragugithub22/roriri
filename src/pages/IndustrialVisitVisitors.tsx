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

interface IndustrialVisit {
  id: string;
  college_name: string;
  department: string;
  date: string;
  mobile: string | null;
  address: string | null;
  amount: number | null;
  students_count: number;
  staff_count: number;
  status: string;
  created_at: string | null;
}

interface IndustrialVisitVisitorsProps {
  onNavigate?: (path: string) => void;
}

export default function IndustrialVisitVisitors({ onNavigate }: IndustrialVisitVisitorsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: visitors = [] } = useQuery({
    queryKey: ["industrial-visit-visitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_visitors")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return (data || []) as IndustrialVisit[];
    },
  });

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("/industrial-visit");
    }
  };

  const handleView = (visitor: IndustrialVisit) => {
    if (onNavigate) {
      onNavigate(`/industrial-visit-visitor-details/${visitor.id}`);
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.department.toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead>College Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Mobile No</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((visitor, index) => (
                  <TableRow key={visitor.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(visitor.date).toLocaleDateString()}</TableCell>
                    <TableCell>{visitor.college_name}</TableCell>
                    <TableCell>{visitor.department}</TableCell>
                    <TableCell>{visitor.mobile || "-"}</TableCell>
                    <TableCell>{visitor.address || "-"}</TableCell>
                    <TableCell>₹{(visitor.amount || 0).toLocaleString()}</TableCell>
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
