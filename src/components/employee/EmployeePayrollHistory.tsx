import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Wallet } from "lucide-react";
import { format } from "date-fns";

interface EmployeePayrollHistoryProps {
  employeeId: string;
}

const EmployeePayrollHistory = ({ employeeId }: EmployeePayrollHistoryProps) => {
  // Fetch payroll history for the logged-in employee
  const { data: payrollRecords, isLoading } = useQuery({
    queryKey: ["employee-payroll-history", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll")
        .select("*")
        .eq("employee_id", employeeId)
        .order("period_start", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            My Payroll History
          </CardTitle>
          <CardDescription>
            View your salary and payment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading payroll history...
            </div>
          ) : !payrollRecords || payrollRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Total Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.period_start), "MMM yyyy")}
                    </TableCell>
                    <TableCell>{record.working_days || "-"}</TableCell>
                    <TableCell>₹{record.basic_salary?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{(record.bonus || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{(record.allowances || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{record.net_salary?.toLocaleString('en-IN')}
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
};

export default EmployeePayrollHistory;
