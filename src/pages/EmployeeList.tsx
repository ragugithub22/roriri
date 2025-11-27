import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Users, Eye, Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';


interface EmployeeListProps {
  onViewEmployee?: (id: string) => void;
}

export default function EmployeeList({ onViewEmployee }: EmployeeListProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    address: '',
    dob: undefined as Date | undefined,
    hire_date: undefined as Date | undefined,
    employee_code: '',
    entity_id: '',
    additional_entity_id: '',
    department_id: '',
    status: 'active' as 'active' | 'inactive',
    residence_type: '',
    selectedRole: '',
    selectedRoles: [] as string[],
    avatar_url: '',
    selectedEntities: [] as string[]
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    full_name: '',
    email: '',
    address: '',
    employee_code: '',
    entity_id: '',
    selectedRole: '',
    hire_date: ''
  });

  const itemsPerPage = 10;

  const { data: employees, isLoading, error: employeesError } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles:profile_id (full_name, email, phone, dob, address),
          primary_entity:entities!entity_id (name, color, icon),
          departments:department_id (name),
          positions:position_id (title)
        `)
        .order('employee_code');
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      return data;
    },
  });

  const paginatedEmployees = employees?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const totalPages = Math.ceil((employees?.length || 0) / itemsPerPage);

  const { data: entities } = useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('role_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: userEntities } = useQuery({
    queryKey: ['user-entities', editingEmployee?.profile_id],
    queryFn: async () => {
      if (!editingEmployee?.profile_id) return [];
      const { data, error } = await supabase
        .from('user_entities' as any)
        .select('entity_id')
        .eq('user_id', editingEmployee.profile_id);
      if (error) throw error;
      return data.map((item: any) => item.entity_id);
    },
    enabled: !!editingEmployee?.profile_id,
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-role', editingEmployee?.profile_id, editingEmployee?.entity_id],
    queryFn: async () => {
      if (!editingEmployee?.profile_id || !editingEmployee?.entity_id) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', editingEmployee.profile_id)
        .eq('entity_id', editingEmployee.entity_id)
        .maybeSingle();
      if (error) throw error;
      return data?.role || null;
    },
    enabled: !!editingEmployee?.profile_id && !!editingEmployee?.entity_id,
  });

  // Update form data when editing employee and queries complete
  useEffect(() => {
    if (editingEmployee && isDialogOpen) {
      setFormData(prev => ({
        ...prev,
        selectedRole: userRole ? userRole.toString() : '',
        selectedEntities: userEntities || []
      }));
    }
  }, [editingEmployee, userEntities, userRole, isDialogOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Try to find an existing profile by email to avoid edge function 400s
      let userId: string | null = null;
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (existingProfile?.id) {
        userId = existingProfile.id;
        // Update profile fields for existing profile
        await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            phone: data.phone || null,
            address: data.address || null,
            dob: data.dob ? data.dob.toISOString().split('T')[0] : null,
          })
          .eq('id', userId);
      } else {
        try {
          // Create user account via edge function
          const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
            body: {
              fullName: data.full_name,
              email: data.email,
              phone: data.phone,
              dob: data.dob ? data.dob.toISOString().split('T')[0] : null,
              role: data.selectedRole ? data.selectedRole.toLowerCase() : null,
              entityId: data.entity_id
            },
          });

          if (userError) throw userError;
          if (userData?.error) throw new Error(userData.error);
          if (!userData?.userId) throw new Error('Failed to create user account');
          userId = userData.userId as string;
        } catch (e: any) {
          const msg = (e?.message || '').toLowerCase();
          // If user already exists, link to existing profile
          if (msg.includes('already') && msg.includes('registered')) {
            const { data: profileByEmail } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', data.email)
              .maybeSingle();

            if (!profileByEmail?.id) {
              throw new Error('User exists but profile not found. Please contact admin.');
            }
            userId = profileByEmail.id;
          } else {
            throw e;
          }
        }
      }

      if (!userId) throw new Error('Unable to resolve user for employee');

      // Ensure we don't create a duplicate employee for this user
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();
      if (existingEmployee?.id) {
        throw new Error('An employee for this email already exists');
      }

      // Create employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          profile_id: userId,
          employee_code: data.employee_code,
          hire_date: data.hire_date?.toISOString().split('T')[0],
          entity_id: data.entity_id,
          additional_entity_id: data.selectedEntities.length > 0 ? data.selectedEntities[0] : null,
          department_id: data.department_id || null,
          status: data.status,
          residence_type: data.residence_type || null
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Note: Role is already assigned by the create-user edge function
      // Only assign role here if user already existed (didn't go through edge function)
      if (data.selectedRole && existingProfile?.id) {
        const normalizedRole = (data.selectedRole || '').toLowerCase();
        const allowed = ['admin', 'manager', 'employee', 'trainee'];
        if (allowed.includes(normalizedRole)) {
          // Check if role already exists to avoid duplicates
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', userId)
            .eq('role', normalizedRole as any)
            .eq('entity_id', data.entity_id)
            .maybeSingle();

          if (!existingRole) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role: normalizedRole as any,
                entity_id: data.entity_id
              });

            if (roleError) throw roleError;
          }
        }
      }

      return employeeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Employee created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create employee: " + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!editingEmployee?.id) throw new Error('No employee selected for update');

      // Update profile information and verify row affected
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          dob: data.dob ? data.dob.toISOString().split('T')[0] : null
        })
        .eq('id', editingEmployee.profile_id)
        .select('id')
        .maybeSingle();

      if (profileError) throw profileError;
      if (!updatedProfile?.id) throw new Error('Profile update not applied (no permission or no matching profile).');

      // Update employee record and verify row affected
      const { data: updatedEmployee, error: employeeError } = await supabase
        .from('employees')
        .update({
          employee_code: data.employee_code,
          hire_date: data.hire_date?.toISOString().split('T')[0],
          entity_id: data.entity_id,
          additional_entity_id: data.selectedEntities.length > 0 ? data.selectedEntities[0] : null,
          department_id: data.department_id || null,
          status: data.status,
          residence_type: data.residence_type || null
        })
        .eq('id', editingEmployee.id)
        .select('id')
        .maybeSingle();

      if (employeeError) throw employeeError;
      if (!updatedEmployee?.id) throw new Error('Employee update not applied (no permission or no matching employee).');

      // Upsert role assignment if a role is selected
      if (data.selectedRole) {
        const normalizedRole = (data.selectedRole || '').toLowerCase();
        const allowed = ['admin', 'manager', 'employee', 'trainee'];
        if (!allowed.includes(normalizedRole)) {
          // Skip invalid roles
          return { success: true };
        }
        // Check if a role already exists for this user and entity
        const { data: existingRole, error: existingRoleError } = await supabase
          .from('user_roles')
          .select('id, role')
          .eq('user_id', editingEmployee.profile_id)
          .eq('entity_id', data.entity_id)
          .maybeSingle();

        if (existingRoleError) throw existingRoleError;

        if (existingRole) {
          // Update role if it's different
          if (existingRole.role !== (normalizedRole as any)) {
            const { error: updateRoleError } = await supabase
              .from('user_roles')
              .update({ role: normalizedRole as any })
              .eq('id', existingRole.id);
            if (updateRoleError) throw updateRoleError;
          }
        } else {
          // Insert new role
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: editingEmployee.profile_id,
              role: normalizedRole as any,
              entity_id: data.entity_id
            });
          if (insertRoleError) throw insertRoleError;
        }
      }

      // Update user entities
      if (data.selectedEntities && data.selectedEntities.length > 0) {
        // First, delete existing user entities for this user
        await supabase
          .from('user_entities' as any)
          .delete()
          .eq('user_id', editingEmployee.profile_id);

        // Then insert the new selected entities
        const userEntitiesToInsert = data.selectedEntities.map(entityId => ({
          user_id: editingEmployee.profile_id,
          entity_id: entityId
        }));

        const { error: userEntitiesError } = await supabase
          .from('user_entities' as any)
          .insert(userEntitiesToInsert);

        if (userEntitiesError) throw userEntitiesError;
      } else {
        // If no entities selected, delete all existing user entities
        await supabase
          .from('user_entities' as any)
          .delete()
          .eq('user_id', editingEmployee.profile_id);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', editingEmployee?.id] });
      toast.success("Employee updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to update employee: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete employee: ' + error.message);
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDialog = (employee?: any) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        full_name: employee.profiles?.full_name || '',
        email: employee.profiles?.email || '',
        username: employee.profiles?.username || '',
        password: '',
        phone: employee.profiles?.phone || '',
        address: employee.profiles?.address || '',
        dob: employee.profiles?.dob ? new Date(employee.profiles.dob) : undefined,
        hire_date: new Date(employee.hire_date),
        employee_code: employee.employee_code,
        entity_id: employee.entity_id,
        additional_entity_id: employee.additional_entity_id || '',
        department_id: employee.department_id || '',
        status: employee.status || 'active',
        residence_type: employee.residence_type || '',
        selectedRole: '',
        selectedRoles: [],
        avatar_url: employee.profiles?.avatar_url || '',
        selectedEntities: userEntities || []
      });
      setAvatarFile(null);
    } else {
      setEditingEmployee(null);
      setFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        address: '',
        dob: undefined,
        hire_date: undefined,
        employee_code: '',
        entity_id: '',
        additional_entity_id: '',
        department_id: '',
        status: 'active',
        residence_type: '',
        selectedRole: '',
        selectedRoles: [],
        avatar_url: '',
        selectedEntities: []
      });
      setAvatarFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    setValidationErrors({
      full_name: '',
      email: '',
      address: '',
      employee_code: '',
      entity_id: '',
      selectedRole: '',
      hire_date: ''
    });
    setCurrentPage(1);
  };

  const validateForm = (): boolean => {
    const errors = {
      full_name: '',
      email: '',
      address: '',
      employee_code: '',
      entity_id: '',
      selectedRole: '',
      hire_date: ''
    };
    let isValid = true;

    if (!formData.full_name.trim()) {
      errors.full_name = 'Employee name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }

    if (!formData.employee_code.trim()) {
      errors.employee_code = 'Employee code is required';
      isValid = false;
    }

    if (!formData.entity_id) {
      errors.entity_id = 'Please select a primary entity';
      isValid = false;
    }

    if (!formData.selectedRole && !editingEmployee) {
      errors.selectedRole = 'Please select a role';
      isValid = false;
    }

    if (!formData.hire_date) {
      errors.hire_date = 'Enroll date is required';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const toggleEntity = (entityId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEntities: prev.selectedEntities.includes(entityId)
        ? prev.selectedEntities.filter(e => e !== entityId)
        : [...prev.selectedEntities, entityId]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
            {employeesError && (
              <div className="text-center py-8 text-destructive">
                Error loading employees: {employeesError.message}
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : !employees || employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employees found. Click "Add Employee" to create one.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmployees.map((employee: any) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.profiles?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{employee.profiles?.email || 'N/A'}</TableCell>
                        <TableCell>{employee.profiles?.phone || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (onViewEmployee) {
                                  onViewEmployee(employee.id);
                                } else {
                                  navigate(`/employees/${employee.id}`);
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenDialog(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(employee.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? 'Update employee information' : 'Enter employee details to add a new employee'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { 
            e.preventDefault();
            if (!validateForm()) {
              toast.error('Please fill in all required fields correctly');
              return;
            }
            if (!editingEmployee) {
              createMutation.mutate(formData);
            } else {
              updateMutation.mutate(formData);
            }
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Employee Name <span className="text-destructive">*</span></Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormData({ ...formData, full_name: e.target.value });
                    setValidationErrors({ ...validationErrors, full_name: '' });
                  }}
                  className={validationErrors.full_name ? 'border-destructive' : ''}
                />
                {validationErrors.full_name && (
                  <p className="text-sm text-destructive">{validationErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setValidationErrors({ ...validationErrors, email: '' });
                  }}
                  className={validationErrors.email ? 'border-destructive' : ''}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingEmployee ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setValidationErrors({ ...validationErrors, address: '' });
                  }}
                  className={validationErrors.address ? 'border-destructive' : ''}
                />
                {validationErrors.address && (
                  <p className="text-sm text-destructive">{validationErrors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_code">Employee Code <span className="text-destructive">*</span></Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) => {
                    setFormData({ ...formData, employee_code: e.target.value });
                    setValidationErrors({ ...validationErrors, employee_code: '' });
                  }}
                  placeholder="e.g., EMP001"
                  className={validationErrors.employee_code ? 'border-destructive' : ''}
                />
                {validationErrors.employee_code && (
                  <p className="text-sm text-destructive">{validationErrors.employee_code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="residence_type">Select Type</Label>
                <Select
                  value={formData.residence_type}
                  onValueChange={(value) => setFormData({ ...formData, residence_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose residence type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Stays in Hostel</SelectItem>
                    <SelectItem value="daily">Comes Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dob ? format(formData.dob, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dob}
                        onSelect={(date) => setFormData({ ...formData, dob: date })}
                        disabled={(date) => date > new Date() || date < new Date("1940-01-01")}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1940}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Enroll Date <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.hire_date && "text-muted-foreground",
                          validationErrors.hire_date && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.hire_date ? format(formData.hire_date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.hire_date}
                        onSelect={(date) => {
                          setFormData({ ...formData, hire_date: date });
                          setValidationErrors({ ...validationErrors, hire_date: '' });
                        }}
                        disabled={(date) => date > new Date() || date < new Date("1990-01-01")}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1990}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.hire_date && (
                    <p className="text-sm text-destructive">{validationErrors.hire_date}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Primary Entity <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.entity_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, entity_id: value });
                    setValidationErrors({ ...validationErrors, entity_id: '' });
                  }}
                >
                  <SelectTrigger className={validationErrors.entity_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Choose an entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities?.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.entity_id && (
                  <p className="text-sm text-destructive">{validationErrors.entity_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Profile Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Roles (Optional)</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                  {roles?.filter(role => role.role_name !== formData.selectedRole).map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={formData.selectedRoles.includes(role.role_name)}
                        onCheckedChange={() => {
                          const updatedRoles = formData.selectedRoles.includes(role.role_name)
                            ? formData.selectedRoles.filter(r => r !== role.role_name)
                            : [...formData.selectedRoles, role.role_name];
                          setFormData({ ...formData, selectedRoles: updatedRoles });
                        }}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {role.role_name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                  {roles?.filter(role => role.role_name !== formData.selectedRole).length === 0 && (
                    <p className="text-sm text-muted-foreground">No additional roles available</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Select Role <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.selectedRole}
                  onValueChange={(value) => {
                    setFormData({ ...formData, selectedRole: value });
                    setValidationErrors({ ...validationErrors, selectedRole: '' });
                  }}
                >
                  <SelectTrigger className={validationErrors.selectedRole ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.role_name}>
                        {role.role_name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.selectedRole && (
                  <p className="text-sm text-destructive">{validationErrors.selectedRole}</p>
                )}
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Update' : 'Add'} Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
