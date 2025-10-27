import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles:profile_id (full_name, email),
          entities:entity_id (name, color),
          departments:department_id (name),
          positions:position_id (title)
        `)
        .order('employee_code');
      if (error) throw error;
      return data;
    },
  });

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

  const filteredEmployees = employees?.filter((emp: any) => {
    if (selectedEntity !== 'all' && emp.entity_id !== selectedEntity) return false;
    if (selectedStatus !== 'all' && emp.status !== selectedStatus) return false;
    return true;
  });

  const columns = [
    {
      key: 'employee_code',
      label: 'Employee ID',
    },
    {
      key: 'full_name',
      label: 'Name',
      render: (_: any, row: any) => row.profiles?.full_name || 'N/A',
    },
    {
      key: 'position',
      label: 'Position',
      render: (_: any, row: any) => row.positions?.title || 'N/A',
    },
    {
      key: 'department',
      label: 'Department',
      render: (_: any, row: any) => row.departments?.name || 'N/A',
    },
    {
      key: 'entity',
      label: 'Entity',
      render: (_: any, row: any) => (
        <Badge style={{ backgroundColor: row.entities?.color }}>
          {row.entities?.name || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/employees/${row.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout
      entityName="Employee Management"
      entityIcon={Users}
      entityColor="blue"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage all employees across entities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter employees by entity and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    {entities?.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <DataTable
          title="Employee Directory"
          description={`Showing ${filteredEmployees?.length || 0} employees`}
          columns={columns}
          data={filteredEmployees || []}
          emptyMessage={isLoading ? "Loading employees..." : "No employees found"}
        />
      </div>
    </DashboardLayout>
  );
}
