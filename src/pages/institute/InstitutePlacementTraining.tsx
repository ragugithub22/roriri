import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const InstitutePlacementTraining = () => {
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

  // Fetch training data - assuming there's a training or placement related table
  const { data: trainingData, isLoading } = useQuery({
    queryKey: ['institute-placement-training', userId],
    queryFn: async () => {
      // Check if there's training data related to this institute
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Placement Training Programs</CardTitle>
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
                    <TableHead>Course Name</TableHead>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Duration (Weeks)</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingData && trainingData.length > 0 ? (
                    trainingData.map((course, index) => (
                      <TableRow key={course.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{course.name || 'N/A'}</TableCell>
                        <TableCell>{course.course_code || 'N/A'}</TableCell>
                        <TableCell>{course.duration_weeks || 'N/A'}</TableCell>
                        <TableCell>₹{course.fees?.toLocaleString() || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                            {course.status || 'Active'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No training programs found
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

export default InstitutePlacementTraining;
