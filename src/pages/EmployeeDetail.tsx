import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, Mail, Calendar, Briefcase, Building2, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles:profile_id (full_name, email, phone),
          entities:entity_id (name, color, icon),
          departments:department_id (name),
          positions:position_id (title, description)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: employeeFunctions } = useQuery({
    queryKey: ['employee-functions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_functions')
        .select('*')
        .eq('employee_id', id)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: userRoles } = useQuery({
    queryKey: ['user-roles', employee?.profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          entities:entity_id (name)
        `)
        .eq('user_id', employee?.profile_id);
      if (error) throw error;
      return data;
    },
    enabled: !!employee?.profile_id,
  });

  if (isLoading) {
    return (
      <DashboardLayout entityName="Employee Details" entityIcon={Users} entityColor="blue">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout entityName="Employee Details" entityIcon={Users} entityColor="blue">
        <div className="text-center py-12">Employee not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout entityName="Employee Details" entityIcon={Users} entityColor="blue">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/employees')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic employee details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Full Name</div>
                <div className="text-lg font-medium">{employee.profiles?.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <div>{employee.profiles?.email}</div>
              </div>
              {employee.profiles?.phone && (
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div>{employee.profiles.phone}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>Job and organizational information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Employee Code</div>
                <div className="font-mono font-medium">{employee.employee_code}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Entity
                </div>
                <Badge style={{ backgroundColor: employee.entities?.color }}>
                  {employee.entities?.name}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div>{employee.departments?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Position
                </div>
                <div>{employee.positions?.title || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Hire Date
                </div>
                <div>{new Date(employee.hire_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Functional Roles
            </CardTitle>
            <CardDescription>Skills and responsibilities assigned to this employee</CardDescription>
          </CardHeader>
          <CardContent>
            {employeeFunctions && employeeFunctions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {employeeFunctions.map((func: any) => (
                  <Badge
                    key={func.id}
                    variant={func.is_primary ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {func.function.replace(/_/g, ' ')}
                    {func.is_primary && <Star className="ml-1 h-3 w-3 fill-current" />}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No functional roles assigned
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Access</CardTitle>
            <CardDescription>Roles and permissions in the ERP system</CardDescription>
          </CardHeader>
          <CardContent>
            {userRoles && userRoles.length > 0 ? (
              <div className="space-y-3">
                {userRoles.map((role: any) => (
                  <div key={role.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex gap-2">
                      <Badge variant="outline">{role.role}</Badge>
                      {role.entities ? (
                        <Badge variant="secondary">{role.entities.name}</Badge>
                      ) : (
                        <Badge>All Entities</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No system roles assigned
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
