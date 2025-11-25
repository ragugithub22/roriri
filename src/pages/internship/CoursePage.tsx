import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CoursePage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["internship-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S. No</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration (Months)</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses && courses.length > 0 ? (
                  courses.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{course.course_code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.course_level || "-"}</TableCell>
                      <TableCell>
                        {course.duration_weeks 
                          ? Math.round(course.duration_weeks / 4.33) 
                          : "-"}
                      </TableCell>
                      <TableCell>₹{course.fees?.toLocaleString() || "0"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={course.status === "active" ? "default" : "secondary"}
                        >
                          {course.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
