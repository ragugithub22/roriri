import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { generateOfferLetterHTML } from '@/components/internship/OfferLetter';
import { generateBonafideLetterHTML } from '@/components/internship/BonafideLetter';

type RecipientType = 'employee' | 'trainee' | 'intern' | null;

export default function LetterManagement() {
  const [selectedType, setSelectedType] = useState<RecipientType>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [letterType, setLetterType] = useState<'offer' | 'bonafide' | 'completion' | 'experience' | null>(null);
  const [joiningDate, setJoiningDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  const { data: employees } = useQuery({
    queryKey: ['employees-letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*, profiles:profile_id(full_name, email), primary_entity:entities!entity_id(name)');
      if (error) throw error;
      return data;
    },
    enabled: selectedType === 'employee',
  });

  const { data: trainees } = useQuery({
    queryKey: ['trainees-letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          courses:course_id(name),
          batches:batch_id(batch_name)
        `)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: selectedType === 'trainee',
  });

  const { data: interns } = useQuery({
    queryKey: ['interns-letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internship_candidates')
        .select(`
          *,
          internship_courses:course_id(course_name)
        `)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: selectedType === 'intern',
  });

  const sendLetterMutation = useMutation({
    mutationFn: async ({ recipientEmail, letterHTML, subject }: any) => {
      const { data, error } = await supabase.functions.invoke('send-internship-letter', {
        body: {
          recipientEmail,
          recipientName: selectedRecipient?.profiles?.full_name || selectedRecipient?.full_name || selectedRecipient?.name,
          letterType: letterType,
          letterHTML,
          subject,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Letter sent successfully!');
      setLetterDialogOpen(false);
      setSelectedRecipient(null);
      setLetterType(null);
      setJoiningDate('');
      setEndDate('');
    },
    onError: (error) => {
      toast.error('Failed to send letter: ' + error.message);
    },
  });

  const handleSendLetter = () => {
    if (!selectedRecipient || !letterType || !joiningDate) {
      toast.error('Please fill all required fields');
      return;
    }

    const recipientEmail = selectedRecipient?.profiles?.email || selectedRecipient?.email;
    const recipientName = selectedRecipient?.profiles?.full_name || selectedRecipient?.full_name || selectedRecipient?.name;

    let letterHTML = '';
    let subject = '';

    // Determine position/course name based on type
    let position = 'Position';
    if (selectedRecipient?.primary_entity?.name) {
      position = selectedRecipient.primary_entity.name;
    } else if (selectedRecipient?.courses?.name) {
      position = selectedRecipient.courses.name;
    } else if (selectedRecipient?.internship_courses?.course_name) {
      position = selectedRecipient.internship_courses.course_name;
    }

    if (letterType === 'offer') {
      subject = 'Offer Letter - RORIRI Software Solutions';
      letterHTML = generateOfferLetterHTML({
        candidateName: recipientName,
        position,
        joiningDate,
        duration: '3 months',
      });
    } else if (letterType === 'bonafide') {
      subject = 'Bonafide Certificate - RORIRI Software Solutions';
      letterHTML = generateBonafideLetterHTML({
        candidateName: recipientName,
        position,
        startDate: joiningDate,
        endDate: endDate || new Date().toISOString().split('T')[0],
      });
    }

    sendLetterMutation.mutate({ recipientEmail, letterHTML, subject });
  };

  const getDocumentStatus = (recipient: any) => {
    // TODO: Implement logic to check which documents have been sent
    return 'Pending';
  };

  const renderRecipientTable = () => {
    let data: any[] = [];
    
    if (selectedType === 'employee') data = employees || [];
    if (selectedType === 'trainee') data = trainees || [];
    if (selectedType === 'intern') data = interns || [];

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S. No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.profiles?.full_name || item.full_name || item.name}</TableCell>
              <TableCell className="capitalize">{selectedType}</TableCell>
              <TableCell>
                {item.primary_entity?.name || 
                 item.courses?.name || 
                 item.batches?.batch_name ||
                 item.internship_courses?.course_name || '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getDocumentStatus(item)}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedRecipient(item);
                        setLetterType('offer');
                        setLetterDialogOpen(true);
                      }}
                    >
                      Offer Letter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedRecipient(item);
                        setLetterType('bonafide');
                        setLetterDialogOpen(true);
                      }}
                    >
                      Bonafide
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedRecipient(item);
                        setLetterType('completion');
                        setLetterDialogOpen(true);
                      }}
                    >
                      Completion
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedRecipient(item);
                        setLetterType('experience');
                        setLetterDialogOpen(true);
                      }}
                    >
                      Experience
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (!selectedType) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Letter Management</h2>
          <p className="text-muted-foreground">Manage and send letters to employees, trainees, and interns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedType('employee')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Employee
              </CardTitle>
              <CardDescription>Manage employee letters</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedType('trainee')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Trainee
              </CardTitle>
              <CardDescription>Manage trainee letters</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedType('intern')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Intern
              </CardTitle>
              <CardDescription>Manage intern letters</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight capitalize">{selectedType} Letters</h2>
          <p className="text-muted-foreground">Send letters to {selectedType}s</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedType(null)}>
          Back to Categories
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {renderRecipientTable()}
        </CardContent>
      </Card>

      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">Send {letterType} Letter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>
            {(letterType === 'bonafide' || letterType === 'completion' || letterType === 'experience') && (
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSendLetter} className="flex-1">
                Send Letter
              </Button>
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
