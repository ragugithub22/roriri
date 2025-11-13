import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PaymentsManager() {

  const { data: payments = [] } = useQuery({
    queryKey: ["academy-payments"],
    queryFn: async () => {
      const { data: paymentsData, error } = await supabase
        .from("academy_payments" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const paymentsArray = (paymentsData as any[]) || [];

      const traineeIds = paymentsArray.map((p: any) => p.student_id).filter(Boolean);
      const { data: traineesData } = await supabase
        .from("students")
        .select("id, full_name, student_code")
        .in("id", traineeIds);

      const traineesMap = new Map(((traineesData || []) as any[]).map((s: any) => [s.id, s]));

      return paymentsArray.map((payment: any) => ({
        ...payment,
        trainee: traineesMap.get(payment.student_id)
      }));
    },
  });


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payments Management</CardTitle>
          <CardDescription>View trainee fee payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {(payments as any[]).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No payment records found
                </TableCell>
              </TableRow>
            ) : (
              (payments as any[]).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.trainee?.full_name || "-"}</TableCell>
                  <TableCell className="font-semibold">₹{Number(payment.amount).toLocaleString()}</TableCell>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{payment.payment_method || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "completed" || payment.status === "paid"
                          ? "default"
                          : payment.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
