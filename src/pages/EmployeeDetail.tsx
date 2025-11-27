import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, Mail, Calendar, Building2, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EmployeeDetail({ employeeId, onBack }: { employeeId?: string; onBack?: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeIdToUse = employeeId || id;

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeIdToUse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles:profile_id (full_name, email, phone, dob, address, username, password),
          primary_entity:entities!entity_id (name, color, icon),
          additional_entity:entities!additional_entity_id (name, color, icon),
          departments:department_id (name)
        `)
        .eq('id', employeeIdToUse)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: employeeFunctions } = useQuery({
    queryKey: ['employee-functions', employeeIdToUse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_functions')
        .select('*')
        .eq('employee_id', employeeIdToUse)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employeeIdToUse,
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
    return employeeId ? (
      <div className="text-center py-12">Loading...</div>
    ) : (
      <DashboardLayout entityName="Employee Details" entityIcon={Users} entityColor="blue">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return employeeId ? (
      <div className="text-center py-12">Employee not found</div>
    ) : (
      <DashboardLayout entityName="Employee Details" entityIcon={Users} entityColor="blue">
        <div className="text-center py-12">Employee not found</div>
      </DashboardLayout>
    );
  }

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack || (() => navigate('/it'))}>
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
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div>{employee.profiles?.phone || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </div>
                <div>{employee.profiles?.dob ? new Date(employee.profiles.dob).toLocaleDateString() : 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div>{employee.profiles?.address || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Username</div>
                <div>{employee.profiles?.username || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Password</div>
                <div className="font-mono">{employee.profiles?.password || 'Not provided'}</div>
              </div>
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
                  Primary Entity
                </div>
                <Badge style={{ backgroundColor: employee.primary_entity?.color }}>
                  {employee.primary_entity?.name}
                </Badge>
              </div>
              {employee.additional_entity && (
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Additional Entity
                  </div>
                  <Badge style={{ backgroundColor: employee.additional_entity?.color }}>
                    {employee.additional_entity?.name}
                  </Badge>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div>{employee.departments?.name || 'N/A'}</div>
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
              Functional Roles & Responsibilities
            </CardTitle>
            <CardDescription>Primary role and additional skills assigned to this employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Role from user_roles */}
            {userRoles && userRoles.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Primary Role</h4>
                {userRoles.map((role: any) => {
                  // Define role descriptions and responsibilities
                  const roleInfo: Record<string, { description: string; responsibilities: string[] }> = {
                    admin: {
                      description: "Full system access with ability to manage all entities and users",
                      responsibilities: ["Manage users and permissions", "Configure system settings", "Access all modules", "Generate reports", "Oversee all operations"]
                    },
                    manager: {
                      description: "Supervisory role with team and project management capabilities",
                      responsibilities: ["Manage team members", "Approve requests and expenses", "Monitor project progress", "Review work updates", "Make strategic decisions"]
                    },
                    staff: {
                      description: "Standard employee with access to assigned modules and tasks",
                      responsibilities: ["Complete assigned tasks", "Submit daily work updates", "Collaborate with team", "Follow standard procedures", "Report to manager"]
                    },
                    developer: {
                      description: "Technical role focused on software development and maintenance",
                      responsibilities: ["Write and maintain code", "Debug and fix issues", "Participate in code reviews", "Develop new features", "Document technical work"]
                    },
                    hr: {
                      description: "Human resources role managing employee lifecycle and welfare",
                      responsibilities: ["Recruit and onboard employees", "Manage employee records", "Handle attendance and leave", "Conduct performance reviews", "Address employee concerns"]
                    },
                    trainer: {
                      description: "Educational role responsible for teaching and mentoring",
                      responsibilities: ["Conduct training sessions", "Develop course materials", "Assess student progress", "Provide mentorship", "Update curriculum"]
                    },
                    trainee: {
                      description: "Learning role with supervised access to training materials",
                      responsibilities: ["Attend training sessions", "Complete assignments", "Learn required skills", "Follow trainer guidance", "Track learning progress"]
                    },
                    viewer: {
                      description: "Read-only access for monitoring and reporting purposes",
                      responsibilities: ["View reports and data", "Monitor system activity", "Generate read-only reports", "No modification rights"]
                    }
                  };

                  const info = roleInfo[role.role] || { description: "Standard system role", responsibilities: [] };

                  return (
                    <div key={role.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center">
                          <Badge variant="default" className="text-base">{role.role.toUpperCase()}</Badge>
                          {role.entities ? (
                            <Badge variant="secondary">{role.entities.name}</Badge>
                          ) : (
                            <Badge>All Entities</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {info.description}
                      </div>
                      {info.responsibilities.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-2">Key Responsibilities:</div>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            {info.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Additional Functional Skills */}
            {employeeFunctions && employeeFunctions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Additional Skills & Functions</h4>
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
              </div>
            )}

            {(!userRoles || userRoles.length === 0) && (!employeeFunctions || employeeFunctions.length === 0) && (
              <div className="text-muted-foreground text-center py-4">
                No roles or functional skills assigned
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Access</CardTitle>
            <CardDescription>Login credentials and system permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {userRoles && userRoles.length > 0 ? (
              <div className="text-sm text-muted-foreground">
                Account created with email: {employee.profiles?.email}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No system access configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );

  return employeeId ? content : (
    <DashboardLayout entityName="Employee Details" entityIcon={Users} entityColor="blue">
      {content}
    </DashboardLayout>
  );
}
