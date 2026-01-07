import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const InstituteInternship = () => {
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

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['institute-internship-enquiries', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internship_enquiries')
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
          <CardTitle>Internship Enquiries</CardTitle>
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
                    <TableHead>Student Name</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries && enquiries.length > 0 ? (
                    enquiries.map((enquiry, index) => (
                      <TableRow key={enquiry.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{enquiry.name || 'N/A'}</TableCell>
                        <TableCell>{enquiry.college_name || 'N/A'}</TableCell>
                        <TableCell>{enquiry.department || 'N/A'}</TableCell>
                        <TableCell>
                          {enquiry.enquiry_date ? format(new Date(enquiry.enquiry_date), 'dd MMM yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={enquiry.follow_status === 'approved' ? 'default' : 'secondary'}>
                            {enquiry.follow_status || 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No internship enquiries found
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

export default InstituteInternship;
