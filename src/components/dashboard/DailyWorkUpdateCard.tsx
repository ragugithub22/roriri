import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, CheckCircle, Clock, AlertCircle, Filter } from "lucide-react";
import { format } from "date-fns";

interface WorkUpdate {
  id: string;
  date: string;
  work_description: string;
  hours_spent: number;
  status: 'completed' | 'in_progress' | 'pending';
  is_reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  user_id: string;
  employee_id: string | null;
  profiles?: { full_name: string; email: string };
  employees?: { 
    entity_id: string; 
    entities?: { name: string } 
  };
}

const DailyWorkUpdateCard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workDescription, setWorkDescription] = useState("");
  const [hoursSpent, setHoursSpent] = useState("");
  const [status, setStatus] = useState<'completed' | 'in_progress' | 'pending'>('in_progress');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Get current user's profile and employee data
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*, employees(id, entity_id, entities(name))')
        .eq('id', currentUser.id)
        .single();
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Check if user is admin or manager
  const { data: userRole } = useQuery({
    queryKey: ['userRole', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .in('role', ['admin', 'manager'])
        .maybeSingle();
      return data;
    },
    enabled: !!currentUser?.id
  });

  const isAdminOrManager = userRole?.role === 'admin' || userRole?.role === 'manager';

  // Fetch work updates
  const { data: workUpdates = [], isLoading } = useQuery({
    queryKey: ['workUpdates', filterDate, filterEmployee, filterEntity],
    queryFn: async () => {
      let query = supabase
        .from('daily_work_updates')
        .select(`
          *,
          profiles!daily_work_updates_user_id_fkey(full_name, email),
          employees(entity_id, entities(name))
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filterDate) {
        query = query.eq('date', filterDate);
      }

      if (filterEmployee !== 'all') {
        query = query.eq('user_id', filterEmployee);
      }

      if (filterEntity !== 'all') {
        query = query.eq('employees.entity_id', filterEntity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any as WorkUpdate[];
    },
    enabled: !!currentUser
  });

  // Fetch all employees for filter (admin/manager only)
  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      return data || [];
    },
    enabled: isAdminOrManager
  });

  // Fetch all entities for filter (admin/manager only)
  const { data: allEntities = [] } = useQuery({
    queryKey: ['allEntities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('entities')
        .select('id, name')
        .order('name');
      return data || [];
    },
    enabled: isAdminOrManager
  });

  // Create work update mutation
  const createMutation = useMutation({
    mutationFn: async (newUpdate: {
      work_description: string;
      hours_spent: number;
      status: 'completed' | 'in_progress' | 'pending';
      date: string;
      user_id: string;
      employee_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('daily_work_updates')
        .insert([newUpdate])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workUpdates'] });
      toast({
        title: "Success",
        description: "Work update submitted successfully!",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit work update: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mark as reviewed mutation
  const reviewMutation = useMutation({
    mutationFn: async (updateId: string) => {
      const { data, error } = await supabase
        .from('daily_work_updates')
        .update({
          is_reviewed: true,
          reviewed_by: currentUser?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', updateId)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workUpdates'] });
      toast({
        title: "Success",
        description: "Work update marked as reviewed!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to review update: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setWorkDescription("");
    setHoursSpent("");
    setStatus('in_progress');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const employeeId = (userProfile as any)?.employees?.[0]?.id;

    createMutation.mutate({
      work_description: workDescription,
      hours_spent: parseFloat(hoursSpent),
      status,
      date: format(new Date(), 'yyyy-MM-dd'),
      user_id: currentUser.id,
      employee_id: employeeId
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Daily Work Updates
            </CardTitle>
            <CardDescription>Submit and track daily work progress</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Today's Work</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Submit Daily Work Update</DialogTitle>
                  <DialogDescription>
                    Record your work progress for today
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={format(new Date(), 'yyyy-MM-dd')}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="employee">Employee Name</Label>
                    <Input
                      id="employee"
                      value={userProfile?.full_name || 'Loading...'}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="entity">Entity</Label>
                    <Input
                      id="entity"
                      value={(userProfile as any)?.employees?.[0]?.entities?.name || 'N/A'}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Work Description / Tasks Done</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you worked on today..."
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      required
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hours">Hours Spent</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      placeholder="8.0"
                      value={hoursSpent}
                      onChange={(e) => setHoursSpent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Submitting...' : 'Submit Update'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isAdminOrManager && (
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="filterDate" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Date
              </Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filterEmployee">Filter by Employee</Label>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filterEntity">Filter by Entity</Label>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {allEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading updates...</div>
        ) : workUpdates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No work updates found for the selected filters
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {isAdminOrManager && <TableHead>Employee</TableHead>}
                  {isAdminOrManager && <TableHead>Entity</TableHead>}
                  <TableHead>Work Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdminOrManager && <TableHead>Review</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {workUpdates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell className="font-medium">
                      {format(new Date(update.date), 'MMM dd, yyyy')}
                    </TableCell>
                    {isAdminOrManager && (
                      <TableCell>{update.profiles?.full_name || update.profiles?.email}</TableCell>
                    )}
                    {isAdminOrManager && (
                      <TableCell>{update.employees?.entities?.name || 'N/A'}</TableCell>
                    )}
                    <TableCell className="max-w-md truncate">{update.work_description}</TableCell>
                    <TableCell>{update.hours_spent}h</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(update.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(update.status)}
                        {update.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    {isAdminOrManager && (
                      <TableCell>
                        {update.is_reviewed ? (
                          <Badge variant="default">Reviewed</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reviewMutation.mutate(update.id)}
                            disabled={reviewMutation.isPending}
                          >
                            Mark Reviewed
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyWorkUpdateCard;