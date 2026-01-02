import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, GraduationCap, Building2, Briefcase, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface UserModulesPageProps {
  userId: string;
  userName: string;
  onBack: () => void;
}

type ModuleType = "mou" | "internship" | "industrial-visit" | "placement" | "training" | null;

const modules = [
  {
    id: "mou" as ModuleType,
    name: "MOU",
    description: "Memorandum of Understanding management",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "internship" as ModuleType,
    name: "Internship",
    description: "Internship program management",
    icon: GraduationCap,
    color: "from-green-500 to-green-600",
  },
  {
    id: "industrial-visit" as ModuleType,
    name: "Industrial Visit",
    description: "Industrial visit scheduling and management",
    icon: Building2,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "placement" as ModuleType,
    name: "Placement",
    description: "Placement and recruitment management",
    icon: Briefcase,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "training" as ModuleType,
    name: "Training",
    description: "Training programs and courses",
    icon: BookOpen,
    color: "from-pink-500 to-pink-600",
  },
];

export default function UserModulesPage({ userId, userName, onBack }: UserModulesPageProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleType>(null);

  // Fetch user details to get the name (college name)
  const { data: user } = useQuery({
    queryKey: ["user-details", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_login")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const collegeName = user?.name || userName || "";

  // Fetch Industrial Visit data
  const { data: industrialVisits = [], isLoading: isLoadingIV } = useQuery({
    queryKey: ["user-industrial-visits", collegeName],
    queryFn: async () => {
      if (!collegeName) return [];
      const { data, error } = await supabase
        .from("industrial_visit_visitors")
        .select("*")
        .ilike("college_name", `%${collegeName}%`)
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: selectedModule === "industrial-visit" && !!collegeName,
  });

  // Fetch Internship Enquiries data
  const { data: internshipEnquiries = [], isLoading: isLoadingInternship } = useQuery({
    queryKey: ["user-internship-enquiries", collegeName],
    queryFn: async () => {
      if (!collegeName) return [];
      const { data, error } = await supabase
        .from("internship_enquiries")
        .select("*")
        .ilike("college_name", `%${collegeName}%`)
        .order("enquiry_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: selectedModule === "internship" && !!collegeName,
  });

  // Fetch MOU documents
  const { data: mouDocuments = [], isLoading: isLoadingMOU } = useQuery({
    queryKey: ["user-mou-documents", collegeName],
    queryFn: async () => {
      if (!collegeName) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .ilike("name", `%${collegeName}%`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: selectedModule === "mou" && !!collegeName,
  });

  // Fetch Training/Courses data
  const { data: trainingData = [], isLoading: isLoadingTraining } = useQuery({
    queryKey: ["user-training", collegeName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: selectedModule === "training",
  });

  // Fetch Placement data from consultancy
  const { data: placementData = [], isLoading: isLoadingPlacement } = useQuery({
    queryKey: ["user-placements", collegeName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: selectedModule === "placement",
  });

  const handleBack = () => {
    if (selectedModule) {
      setSelectedModule(null);
    } else {
      onBack();
    }
  };

  const renderModuleTable = () => {
    switch (selectedModule) {
      case "industrial-visit":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Industrial Visit Records for {collegeName}</h2>
            {isLoadingIV ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : industrialVisits.length === 0 ? (
              <p className="text-muted-foreground">No industrial visit records found.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>College Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {industrialVisits.map((visit: any) => (
                      <TableRow key={visit.id}>
                        <TableCell>{visit.date ? format(new Date(visit.date), "dd MMM yyyy") : "-"}</TableCell>
                        <TableCell>{visit.college_name}</TableCell>
                        <TableCell>{visit.department || "-"}</TableCell>
                        <TableCell>{visit.students_count || 0}</TableCell>
                        <TableCell>{visit.staff_count || 0}</TableCell>
                        <TableCell>₹{visit.amount || 0}</TableCell>
                        <TableCell>{visit.status || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      case "internship":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Internship Enquiries for {collegeName}</h2>
            {isLoadingInternship ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : internshipEnquiries.length === 0 ? (
              <p className="text-muted-foreground">No internship enquiries found.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internshipEnquiries.map((enquiry: any) => (
                      <TableRow key={enquiry.id}>
                        <TableCell>{enquiry.enquiry_date ? format(new Date(enquiry.enquiry_date), "dd MMM yyyy") : "-"}</TableCell>
                        <TableCell>{enquiry.name}</TableCell>
                        <TableCell>{enquiry.phone || "-"}</TableCell>
                        <TableCell>{enquiry.email || "-"}</TableCell>
                        <TableCell>{enquiry.department || "-"}</TableCell>
                        <TableCell>{enquiry.follow_status || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      case "mou":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">MOU Documents for {collegeName}</h2>
            {isLoadingMOU ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : mouDocuments.length === 0 ? (
              <p className="text-muted-foreground">No MOU documents found.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>File Type</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mouDocuments.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>{doc.file_type || "-"}</TableCell>
                        <TableCell>{doc.created_at ? format(new Date(doc.created_at), "dd MMM yyyy") : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      case "training":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Training Courses</h2>
            {isLoadingTraining ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : trainingData.length === 0 ? (
              <p className="text-muted-foreground">No training records found.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Duration (Weeks)</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingData.map((course: any) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.course_code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.duration_weeks || "-"}</TableCell>
                        <TableCell>₹{course.fees || 0}</TableCell>
                        <TableCell>{course.status || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      case "placement":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Placement Records</h2>
            {isLoadingPlacement ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : placementData.length === 0 ? (
              <p className="text-muted-foreground">No placement records found.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Code</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placementData.map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.client_code}</TableCell>
                        <TableCell>{client.company_name}</TableCell>
                        <TableCell>{client.contact_person || "-"}</TableCell>
                        <TableCell>{client.industry || "-"}</TableCell>
                        <TableCell>{client.status || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {selectedModule ? modules.find((m) => m.id === selectedModule)?.name : "User Modules"}
          </h1>
          <p className="text-muted-foreground">
            {selectedModule ? `Viewing records for ${collegeName}` : `Select a module to view records for ${collegeName || "this user"}`}
          </p>
        </div>
      </div>

      {selectedModule ? (
        renderModuleTable()
      ) : (
        /* Module Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${module.color} text-white shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedModule(module.id)}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
