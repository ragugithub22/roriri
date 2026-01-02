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

interface GroupedVisit {
  date: string;
  college_name: string | null;
  address: string | null;
  visitor_type: string;
  count: number;
}

interface IndustrialVisitVisitorsProps {
  onNavigate?: (path: string) => void;
  onViewGroup?: (date: string, collegeName: string | null, address: string | null) => void;
}

export default function IndustrialVisitVisitors({ onNavigate, onViewGroup }: IndustrialVisitVisitorsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: visitors = [] } = useQuery({
    queryKey: ["industrial-visit-registrations-only"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_registrations")
        .select("*")
        .eq("visitor_type", "industrial_visit")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as IndustrialVisitRegistration[];
    },
  });

  // Group visitors by date, college_name, and address
  const groupedVisitors: GroupedVisit[] = visitors.reduce((acc: GroupedVisit[], visitor) => {
    const date = visitor.created_at ? new Date(visitor.created_at).toLocaleDateString() : "-";
    const existingGroup = acc.find(
      g => g.date === date && 
           g.college_name === visitor.college_name && 
           g.address === visitor.address
    );
    
    if (existingGroup) {
      existingGroup.count++;
    } else {
      acc.push({
        date,
        college_name: visitor.college_name,
        address: visitor.address,
        visitor_type: visitor.visitor_type,
        count: 1,
      });
    }
    return acc;
  }, []);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("/industrial-visit");
    }
  };

  const handleView = (group: GroupedVisit) => {
    if (onViewGroup) {
      onViewGroup(group.date, group.college_name, group.address);
    }
  };

  const filteredVisitors = groupedVisitors.filter((group) =>
    (group.college_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (group.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
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
                <TableHead>Visitor Type</TableHead>
                <TableHead>College Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((group, index) => (
                  <TableRow key={`${group.date}-${group.college_name}-${group.address}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{group.date}</TableCell>
                    <TableCell>{group.visitor_type?.replace("_", " ") || "-"}</TableCell>
                    <TableCell>{group.college_name || "-"}</TableCell>
                    <TableCell>{group.address || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(group)}
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
