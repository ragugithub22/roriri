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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
}

export default function IndustrialVisitVisitors({ onNavigate }: IndustrialVisitVisitorsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupedVisit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Fetch records matching the selected group
  const { data: groupRecords = [] } = useQuery({
    queryKey: ["industrial-visit-group", selectedGroup?.date, selectedGroup?.college_name, selectedGroup?.address],
    queryFn: async () => {
      if (!selectedGroup) return [];
      
      let query = supabase
        .from("industrial_visit_registrations")
        .select("*")
        .eq("visitor_type", "industrial_visit");

      // Filter by college_name
      if (selectedGroup.college_name) {
        query = query.eq("college_name", selectedGroup.college_name);
      } else {
        query = query.is("college_name", null);
      }

      // Filter by address
      if (selectedGroup.address) {
        query = query.eq("address", selectedGroup.address);
      } else {
        query = query.is("address", null);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Filter by date on client side since we're comparing formatted dates
      return (data || []).filter((record: IndustrialVisitRegistration) => {
        const recordDate = record.created_at ? new Date(record.created_at).toLocaleDateString() : "-";
        return recordDate === selectedGroup.date;
      }) as IndustrialVisitRegistration[];
    },
    enabled: !!selectedGroup,
  });

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("/industrial-visit");
    }
  };

  const handleView = (group: GroupedVisit) => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
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

      {/* Dialog to show grouped records */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Industrial Visit Records
              {selectedGroup && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({selectedGroup.date} - {selectedGroup.college_name || "N/A"})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
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
                {groupRecords.length === 0 ? (
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
