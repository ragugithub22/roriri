import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InternManagerProps {
  onViewIntern?: (internId: string) => void;
}

export default function InternManager({ onViewIntern }: InternManagerProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: interns = [], isLoading } = useQuery({
    queryKey: ["internship-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_candidates")
        .select(`
          *,
          courses:course_id(name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Filter interns based on name and status
  const filteredInterns = interns.filter((intern: any) => {
    const matchesName = intern.name?.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || intern.status === statusFilter;
    return matchesName && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Intern Management
            </CardTitle>
            <CardDescription>View and manage internship candidates</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading interns...</div>
        ) : filteredInterns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No internship candidates found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterns.map((intern: any) => (
                <TableRow key={intern.id}>
                  <TableCell className="font-medium">{intern.name}</TableCell>
                  <TableCell>{intern.email || "-"}</TableCell>
                  <TableCell>{intern.phone || "-"}</TableCell>
                  <TableCell>{intern.courses?.name || "-"}</TableCell>
                  <TableCell className="capitalize">{intern.mode || "-"}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        intern.status === "active" 
                          ? "default" 
                          : intern.status === "completed" 
                            ? "secondary" 
                            : "outline"
                      }
                    >
                      {intern.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewIntern?.(intern.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
