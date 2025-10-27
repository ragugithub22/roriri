import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DataTable, Badge } from '@/components/dashboard/DataTable';
import { Building2 } from 'lucide-react';

export default function DepartmentList() {
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments-with-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          entities:entity_id (name, color),
          employees:employees(count)
        `)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const columns = [
    {
      key: 'name',
      label: 'Department Name',
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
      key: 'description',
      label: 'Description',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'employee_count',
      label: 'Employees',
      render: (_: any, row: any) => row.employees?.[0]?.count || 0,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <DashboardLayout
      entityName="Department Management"
      entityIcon={Building2}
      entityColor="purple"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">View all departments across entities</p>
        </div>

        <DataTable
          title="Department Directory"
          description={`Showing ${departments?.length || 0} departments`}
          columns={columns}
          data={departments || []}
          emptyMessage={isLoading ? "Loading departments..." : "No departments found"}
        />
      </div>
    </DashboardLayout>
  );
}
