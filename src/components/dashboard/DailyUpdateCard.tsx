import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, ClipboardList, Plus } from "lucide-react";

const formSchema = z.object({
  work_description: z.string().min(10, "Please provide at least 10 characters"),
  hours_spent: z.string().min(1, "Hours spent is required"),
  status: z.enum(["completed", "in_progress", "pending"]),
});

const DailyUpdateCard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showUpdatesTable, setShowUpdatesTable] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      work_description: "",
      hours_spent: "",
      status: "in_progress",
    },
  });

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
        .maybeSingle();

      if (!profile) return null;

      const { data: employee } = await supabase
        .from("employees")
        .select("id, entity:entities(name)")
        .eq("profile_id", profile.id)
        .maybeSingle();

      return employee;
    },
  });

  // Fetch today's updates
  const { data: todayUpdates } = useQuery({
    queryKey: ["today-updates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("daily_work_updates")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all work updates for table view
  const { data: allUpdates = [] } = useQuery({
    queryKey: ["all-work-updates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("daily_work_updates")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
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
      queryClient.invalidateQueries({ queryKey: ["today-updates"] });
      queryClient.invalidateQueries({ queryKey: ["all-work-updates"] });
      toast({ title: "Daily update submitted successfully!" });
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

  const totalHoursToday = todayUpdates?.reduce((sum, update) => sum + Number(update.hours_spent), 0) || 0;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Daily Work Update</CardTitle>
                <CardDescription>Track your daily tasks and progress</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Updates Today</p>
                <p className="text-2xl font-bold">{todayUpdates?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Hours Logged</p>
                <p className="text-2xl font-bold">{totalHoursToday.toFixed(1)}h</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex-1" 
                onClick={() => setShowUpdatesTable(!showUpdatesTable)}
              >
                {showUpdatesTable ? "Close Module" : "Open Module"}
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Work Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updates Table */}
      {showUpdatesTable && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Work Update History</CardTitle>
            <CardDescription>Recent work updates and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Work Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUpdates.length > 0 ? (
                  allUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>{update.date}</TableCell>
                      <TableCell className="max-w-md truncate">{update.work_description}</TableCell>
                      <TableCell>{update.hours_spent}h</TableCell>
                      <TableCell>
                        <Badge variant={
                          update.status === "completed" ? "default" :
                          update.status === "in_progress" ? "secondary" :
                          "outline"
                        }>
                          {update.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {update.is_reviewed ? (
                          <Badge variant="outline">Reviewed</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No work updates yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </>
  );
};

export default DailyUpdateCard;