import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Wallet, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface PayrollHistoryProps {
  employeeId?: string;
  onBack?: () => void;
}

const PayrollHistory = ({ employeeId: propEmployeeId, onBack }: PayrollHistoryProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const employeeIdToUse = propEmployeeId || id;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    period_start: "",
    working_days: "",
    basic_salary: "",
    bonus: "",
    allowances: "",
  });

  // Fetch employee details
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ["employee-payroll", employeeIdToUse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          profiles:profile_id (full_name, email)
        `)
        .eq("id", employeeIdToUse)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!employeeIdToUse,
  });

  // Fetch payroll history
  const { data: payrollRecords, isLoading: payrollLoading } = useQuery({
    queryKey: ["payroll-history", employeeIdToUse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll")
        .select("*")
        .eq("employee_id", employeeIdToUse)
        .order("period_start", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeIdToUse,
  });

  // Add payroll mutation
  const addPayrollMutation = useMutation({
    mutationFn: async (payrollData: {
      employee_id: string;
      period_start: string;
      period_end: string;
      working_days: number;
      basic_salary: number;
      bonus: number;
      allowances: number;
      net_salary: number;
    }) => {
      const { data, error } = await supabase
        .from("payroll")
        .insert(payrollData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-history", employeeIdToUse] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Payroll record added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add payroll: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      period_start: "",
      working_days: "",
      basic_salary: "",
      bonus: "",
      allowances: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeIdToUse) return;

    const basicSalary = parseFloat(formData.basic_salary) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const totalSalary = basicSalary + bonus + allowances;

    // Calculate period_end as the last day of the month from period_start
    const startDate = new Date(formData.period_start);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    addPayrollMutation.mutate({
      employee_id: employeeIdToUse,
      period_start: formData.period_start,
      period_end: format(endDate, "yyyy-MM-dd"),
      working_days: parseInt(formData.working_days) || 0,
      basic_salary: basicSalary,
      bonus: bonus,
      allowances: allowances,
      net_salary: totalSalary,
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/it");
    }
  };

  const isLoading = employeeLoading || payrollLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Payroll History
            </h1>
            {employee && (
              <p className="text-muted-foreground">
                {employee.profiles?.full_name} ({employee.employee_code})
              </p>
            )}
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payroll
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payroll Record</DialogTitle>
              <DialogDescription>
                Enter payroll details for {employee?.profiles?.full_name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="period_start">Date (Month)</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="working_days">Working Days</Label>
                  <Input
                    id="working_days"
                    type="number"
                    min="0"
                    max="31"
                    placeholder="Enter working days"
                    value={formData.working_days}
                    onChange={(e) => setFormData({ ...formData, working_days: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="basic_salary">Basic Salary</Label>
                  <Input
                    id="basic_salary"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter basic salary"
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter bonus amount"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="allowances">Allowances</Label>
                  <Input
                    id="allowances"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter allowances"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Total Salary</Label>
                  <div className="p-3 bg-muted rounded-md font-semibold">
                    ₹{(
                      (parseFloat(formData.basic_salary) || 0) +
                      (parseFloat(formData.bonus) || 0) +
                      (parseFloat(formData.allowances) || 0)
                    ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addPayrollMutation.isPending}>
                  {addPayrollMutation.isPending ? "Adding..." : "Add Payroll"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll Records
          </CardTitle>
          <CardDescription>
            View all payroll records for this employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading payroll history...
            </div>
          ) : !payrollRecords || payrollRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found for this employee.
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
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                        {record.status || 'pending'}
                      </Badge>
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

export default PayrollHistory;
