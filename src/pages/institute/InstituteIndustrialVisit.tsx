import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const InstituteIndustrialVisit = () => {
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

  const { data: visits, isLoading } = useQuery({
    queryKey: ['institute-industrial-visits-list', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industrial_visit_visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Industrial Visit History</CardTitle>
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
                    <TableHead>College Name</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits && visits.length > 0 ? (
                    visits.map((visit, index) => (
                      <TableRow key={visit.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{visit.college_name || 'N/A'}</TableCell>
                        <TableCell>
                          {visit.date ? format(new Date(visit.date), 'dd MMM yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{visit.students_count || 0}</TableCell>
                        <TableCell>
                          <Badge variant={visit.status === 'completed' ? 'default' : 'secondary'}>
                            {visit.status || 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No industrial visits found
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

export default InstituteIndustrialVisit;
