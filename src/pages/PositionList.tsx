import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DataTable, Badge } from '@/components/dashboard/DataTable';
import { Briefcase } from 'lucide-react';

export default function PositionList() {
  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions-with-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('positions')
        .select(`
          *,
          entities:entity_id (name, color),
          departments:department_id (name),
          employees:employees(count)
        `)
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  const columns = [
    {
      key: 'title',
      label: 'Position Title',
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
      entityName="Position Management"
      entityIcon={Briefcase}
      entityColor="indigo"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Positions</h2>
          <p className="text-muted-foreground">View all job titles across entities</p>
        </div>

        <DataTable
          title="Position Directory"
          description={`Showing ${positions?.length || 0} positions`}
          columns={columns}
          data={positions || []}
          emptyMessage={isLoading ? "Loading positions..." : "No positions found"}
        />
      </div>
    </DashboardLayout>
  );
}
