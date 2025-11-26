import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HostelResident {
  id: string;
  name: string;
  type: "employee" | "trainee";
  entity_type: string;
  join_date: string;
}

interface HostelManagementProps {
  onViewResident?: (id: string, type: string) => void;
}

export default function HostelManagement({ onViewResident }: HostelManagementProps) {
  const navigate = useNavigate();

  // Fetch employees with hostel residence
  const { data: employees = [] } = useQuery({
    queryKey: ["hostel-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          hire_date,
          residence_type,
          profiles:profile_id (
            full_name
          ),
          entities:entity_id (
            name
          )
        `)
        .ilike("residence_type", "%hostel%");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch trainees with hostel residence
  const { data: trainees = [] } = useQuery({
    queryKey: ["hostel-trainees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, enrollment_date, residence_type")
        .ilike("residence_type", "%hostel%");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Combine and format residents
  const residents: HostelResident[] = [
    ...employees.map((emp: any) => ({
      id: emp.id,
      name: emp.profiles?.full_name || "Unknown",
      type: "employee" as const,
      entity_type: emp.entities?.name || "Unknown",
      join_date: emp.hire_date,
    })),
    ...trainees.map((trainee: any) => ({
      id: trainee.id,
      name: trainee.full_name,
      type: "trainee" as const,
      entity_type: "IT Academy",
      join_date: trainee.enrollment_date,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Hostel Management</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-8 px-6">
        <Card>
          <CardHeader>
            <CardTitle>Hostel Residents</CardTitle>
            <CardDescription>All employees and trainees staying in the hostel</CardDescription>
          </CardHeader>
          <CardContent>
            {residents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hostel residents found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.map((resident) => (
                    <TableRow key={`${resident.type}-${resident.id}`}>
                      <TableCell className="font-medium">{resident.name}</TableCell>
                      <TableCell>
                        <Badge variant={resident.type === "employee" ? "default" : "secondary"}>
                          {resident.type === "employee" ? "Employee" : "Trainee"}
                        </Badge>
                      </TableCell>
                      <TableCell>{resident.entity_type}</TableCell>
                      <TableCell>{new Date(resident.join_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (onViewResident) {
                              onViewResident(resident.id, resident.type);
                            } else {
                              navigate(`/hostel/${resident.type}/${resident.id}`);
                            }
                          }}
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
      </main>
    </div>
  );
}
