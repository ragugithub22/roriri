import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentReportPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['internship-paid-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internship_payments')
        .select(`
          *,
          internship_candidates(name)
        `)
        .gt('paid_amount', 0)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.No</TableHead>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Pending Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Received By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments && payments.length > 0 ? (
                    payments.map((payment, index) => (
                      <TableRow key={payment.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {payment.internship_candidates?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>₹{payment.total_amount?.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ₹{payment.paid_amount?.toLocaleString()}
                        </TableCell>
                        <TableCell>₹{payment.pending_amount?.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_mode || 'N/A'}
                        </TableCell>
                        <TableCell>{payment.received_by || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No paid payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
