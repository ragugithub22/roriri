import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Employee = ({ onViewEmployee }: { onViewEmployee?: (id: string) => void }) => {
  const navigate = useNavigate();
  // First, get the IT company entity ID
  const { data: itCompanyEntity } = useQuery({
    queryKey: ["it-company-entity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_company")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Then fetch employees for the IT company
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["it-company-employees", itCompanyEntity?.id],
    queryFn: async () => {
      if (!itCompanyEntity?.id) return [];

      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles:profile_id (full_name, email, phone, dob),
          primary_entity:entities!entity_id (name, color, icon),
          departments:department_id (name),
          positions:position_id (title)
        `)
        .eq('entity_id', itCompanyEntity.id)
        .order('employee_code');

      if (error) throw error;
      return data;
    },
    enabled: !!itCompanyEntity?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee</CardTitle>
          <CardDescription>Loading employees...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee</CardTitle>
          <CardDescription>Error loading employees</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load employees: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          RORIRI IT Company Employees
        </CardTitle>
        <CardDescription>
          List of employees working for the RORIRI IT company.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!employees || employees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No employees found for the RORIRI IT company.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-mono font-medium">
                    {employee.employee_code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {employee.profiles?.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{employee.profiles?.email || 'N/A'}</TableCell>
                  <TableCell>{employee.profiles?.phone || 'N/A'}</TableCell>
                  <TableCell>{employee.departments?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onViewEmployee) {
                          onViewEmployee(employee.id);
                        } else {
                          navigate(`/employees/${employee.id}`);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
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
};

export default Employee;
