import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const InstitutePaymentReport = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        setUserId(sessionData.originalId || sessionData.userId);
      } catch (error) {
        console.error('Error parsing user session:', error);
      }
    }
  }, []);

  // Fetch internship payment data
  const { data: payments, isLoading } = useQuery({
    queryKey: ['institute-payments', userId],
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
    enabled: !!userId,
  });

  const totalAmount = payments?.reduce((sum, p) => sum + (p.paid_amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Report</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
          </div>
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
                          {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>₹{payment.total_amount?.toLocaleString() || 0}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ₹{payment.paid_amount?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>₹{payment.pending_amount?.toLocaleString() || 0}</TableCell>
                        <TableCell className="capitalize">{payment.payment_mode || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No payments found
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
};

export default InstitutePaymentReport;
