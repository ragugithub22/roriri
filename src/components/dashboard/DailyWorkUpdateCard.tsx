import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./DataTable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, Filter } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  work_description: z.string().min(10, "Please provide at least 10 characters"),
  hours_spent: z.string().min(1, "Hours spent is required"),
  status: z.enum(["completed", "in_progress", "pending"]),
});

const DailyWorkUpdateCard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterEmployee, setFilterEmployee] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      work_description: "",
      hours_spent: "",
      status: "in_progress",
    },
  });

  // Check if user is admin/manager
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "manager"]);

      setIsAdmin((roles && roles.length > 0) || false);
    };

    checkRole();
  }, []);

  // Fetch current user's employee record
  const { data: currentEmployee } = useQuery({
    queryKey: ["current-employee"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) return null;

      const { data: employee } = await supabase
        .from("employees")
        .select("id, entity:entities(name)")
        .eq("profile_id", profile.id)
        .single();

      return employee;
    },
  });

  // Fetch work updates
  const { data: updates, isLoading } = useQuery({
    queryKey: ["daily-work-updates", filterDate, filterEmployee],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("daily_work_updates")
        .select(`
          *,
          employee:employees(
            profile:profiles(full_name),
            entity:entities(name)
          ),
          reviewer:reviewed_by(full_name)
        `)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filterDate) {
        query = query.eq("date", filterDate);
      }

      if (filterEmployee) {
        query = query.eq("employee_id", filterEmployee);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch all employees for filter (admin only)
  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      if (!isAdmin) return [];

      const { data } = await supabase
        .from("employees")
        .select("id, profile:profiles(full_name)")
        .order("profile(full_name)");

      return data || [];
    },
    enabled: isAdmin,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("daily_work_updates").insert({
        user_id: user.id,
        employee_id: currentEmployee?.id || null,
        work_description: values.work_description,
        hours_spent: parseFloat(values.hours_spent),
        status: values.status,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-work-updates"] });
      toast({ title: "Work update submitted successfully!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error submitting update", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Review mutation (admin only)
  const reviewMutation = useMutation({
    mutationFn: async (updateId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("daily_work_updates")
        .update({
          is_reviewed: true,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-work-updates"] });
      toast({ title: "Update marked as reviewed" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error reviewing update", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      key: "employee",
      label: "Employee",
      render: (_: any, row: any) => row.employee?.profile?.full_name || "Unknown",
    },
    {
      key: "entity",
      label: "Entity",
      render: (_: any, row: any) => row.employee?.entity?.name || "N/A",
    },
    {
      key: "work_description",
      label: "Work Description",
      render: (value: string) => (
        <div className="max-w-md truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "hours_spent",
      label: "Hours",
      render: (value: number) => `${value}h`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge variant={getStatusVariant(value)}>
            {value.replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "is_reviewed",
            label: "Review Status",
            render: (value: boolean, row: any) =>
              value ? (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reviewed
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reviewMutation.mutate(row.id)}
                >
                  Mark as Reviewed
                </Button>
              ),
          },
        ]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Work Updates
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "View and manage all employee work updates"
                : "Submit your daily work progress"}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Today's Work
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Daily Work Update</DialogTitle>
                <DialogDescription>
                  Record what you accomplished today
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="work_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Description / Tasks Done</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what you worked on today..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hours_spent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours Spent</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              placeholder="8.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Submitting..." : "Submit Update"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isAdmin && (
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Date
              </label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Employee
              </label>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Employees</SelectItem>
                  {employees?.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.profile?.full_name || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading updates...</div>
        ) : (
          <DataTable
            title=""
            columns={columns}
            data={updates || []}
            emptyMessage="No work updates found"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DailyWorkUpdateCard;