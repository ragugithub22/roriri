import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmployeesManagerProps {
  onViewEmployee: (employeeId: string) => void;
}

export default function EmployeesManager({ onViewEmployee }: EmployeesManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['it-academy-employees'],
    queryFn: async () => {
      // First get the IT Academy entity ID
      const { data: entity } = await supabase
        .from('entities')
        .select('id')
        .eq('code', 'it_academy')
        .maybeSingle();

      if (!entity) return [];

      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_code,
          hire_date,
          status,
          residence_type,
          profiles:profile_id(
            full_name,
            email,
            phone
          ),
          departments:department_id(
            name
          ),
          positions:position_id(
            title
          )
        `)
        .eq('entity_id', entity.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredEmployees = employees.filter((employee: any) =>
    employee.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">IT Academy Employees</h2>
          <p className="text-muted-foreground">Manage employees in the IT Academy</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S. No</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee: any, index: number) => (
                  <TableRow key={employee.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{employee.employee_code}</TableCell>
                    <TableCell>{employee.profiles?.full_name || '-'}</TableCell>
                    <TableCell>{employee.profiles?.email || '-'}</TableCell>
                    <TableCell>{employee.departments?.name || '-'}</TableCell>
                    <TableCell>{employee.positions?.title || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={employee.status === 'active' ? 'default' : 'secondary'}
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewEmployee(employee.id)}
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
    </div>
  );
}
