import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, Download } from "lucide-react";
import { toast } from "sonner";

export default function CertificatesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: trainees = [] } = useQuery({
    queryKey: ["trainees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, student_code, full_name")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: entity } = useQuery({
    queryKey: ["it-academy-entity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses", entity?.id],
    queryFn: async () => {
      if (!entity?.id) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, course_code")
        .eq("entity_id", entity.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!entity?.id,
  });

  const { data: batches = [] } = useQuery<any[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches" as any)
        .select("id, batch_code, batch_name, status")
        .eq("status", "active");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: certificates = [] } = useQuery<any[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data: certsData, error } = await supabase
        .from("certificates" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!certsData) return [];

      const traineeIds = (certsData as any[]).map((c: any) => c.student_id).filter(Boolean);
      const courseIds = (certsData as any[]).map((c: any) => c.course_id).filter(Boolean);
      const batchIds = (certsData as any[]).map((c: any) => c.batch_id).filter(Boolean);

      const [traineesData, coursesData, batchesData] = await Promise.all([
        traineeIds.length > 0
          ? supabase.from("students").select("id, full_name, student_code").in("id", traineeIds)
          : Promise.resolve({ data: [] as any[] }),
        courseIds.length > 0
          ? supabase.from("courses").select("id, name").in("id", courseIds)
          : Promise.resolve({ data: [] as any[] }),
        batchIds.length > 0
          ? supabase.from("batches" as any).select("id, batch_name, status").in("id", batchIds)
          : Promise.resolve({ data: [] as any[] })
      ]);

      const traineesMap = new Map(((traineesData.data || []) as any[]).map((s: any) => [s.id, s]));
      const coursesMap = new Map(((coursesData.data || []) as any[]).map((c: any) => [c.id, c]));
      const batchesMap = new Map(((batchesData.data || []) as any[]).map((b: any) => [b.id, b]));

      return (certsData as any[]).map((cert: any) => ({
        ...cert,
        trainee: traineesMap.get(cert.student_id),
        course: coursesMap.get(cert.course_id),
        batch: batchesMap.get(cert.batch_id)
      }));
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async (certificateData: any) => {
      const { error } = await supabase
        .from("certificates" as any)
        .insert(certificateData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Certificate issued successfully");
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to issue certificate");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const certificateData = {
      certificate_number: formData.get("certificate_number"),
      student_id: formData.get("student_id"),
      course_id: formData.get("course_id"),
      batch_id: formData.get("batch_id") || null,
      issue_date: formData.get("issue_date"),
      status: "active",
    };
    issueCertificateMutation.mutate(certificateData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Certificates Management</CardTitle>
            <CardDescription>Issue and manage course completion certificates</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Award className="mr-2 h-4 w-4" />
                Issue Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Issue Certificate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="certificate_number">Certificate Number</Label>
                  <Input
                    id="certificate_number"
                    name="certificate_number"
                    placeholder="CERT-2024-001"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student_id">Trainee</Label>
                    <Select name="student_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trainee" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainees.map((trainee) => (
                          <SelectItem key={trainee.id} value={trainee.id}>
                            {trainee.full_name} ({trainee.student_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="course_id">Course</Label>
                    <Select name="course_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch_id">Batch (Optional)</Label>
                    <Select name="batch_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch: any) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batch_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="issue_date">Issue Date</Label>
                    <Input
                      id="issue_date"
                      name="issue_date"
                      type="date"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Issue Certificate
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate No.</TableHead>
              <TableHead>Trainee</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(certificates as any[]).map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-mono">{cert.certificate_number}</TableCell>
                <TableCell>{cert.trainee?.full_name || "-"}</TableCell>
                <TableCell>{cert.course?.name || "-"}</TableCell>
                <TableCell>{cert.batch?.batch_name || "-"}</TableCell>
                <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={cert.status === "active" ? "default" : "secondary"}>
                    {cert.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
