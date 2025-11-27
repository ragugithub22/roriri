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
  const [position, setPosition] = useState('');
  const [duration, setDuration] = useState('');
  const [generatedLetterHTML, setGeneratedLetterHTML] = useState('');
  const [letterSubject, setLetterSubject] = useState('');
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

  const { data: trainees, isLoading: isLoadingTrainees, error: traineesError } = useQuery({
    queryKey: ['trainees-letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: selectedType === 'trainee',
  });

  const { data: interns, isLoading: isLoadingInterns, error: internsError } = useQuery({
    queryKey: ['interns-letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internship_candidates')
        .select('*')
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
      setPosition('');
      setDuration('');
      setGeneratedLetterHTML('');
      setLetterSubject('');
    },
    onError: (error) => {
      toast.error('Failed to send letter: ' + error.message);
    },
  });

  const handleGenerateLetter = () => {
    if (!selectedRecipient || !letterType || !joiningDate) {
      toast.error('Please fill all required fields');
      return;
    }

    const recipientName = selectedRecipient?.profiles?.full_name || selectedRecipient?.full_name || selectedRecipient?.name;

    let letterHTML = '';
    let subject = '';

    // Determine position/course name based on type
    let positionText = position;
    if (!positionText) {
      if (selectedRecipient?.primary_entity?.name) {
        positionText = selectedRecipient.primary_entity.name;
      } else if (selectedType === 'trainee') {
        positionText = 'IT Academy Trainee';
      } else if (selectedType === 'intern') {
        positionText = 'Internship Candidate';
      }
    }

    if (letterType === 'offer') {
      if (!position || !duration) {
        toast.error('Please fill all required fields for offer letter');
        return;
      }
      subject = 'Offer Letter - RORIRI Software Solutions';
      letterHTML = generateOfferLetterHTML({
        candidateName: recipientName,
        position: position || positionText,
        joiningDate,
        duration,
      });
    } else if (letterType === 'bonafide') {
      subject = 'Bonafide Certificate - RORIRI Software Solutions';
      letterHTML = generateBonafideLetterHTML({
        candidateName: recipientName,
        position: positionText,
        startDate: joiningDate,
        endDate: endDate || new Date().toISOString().split('T')[0],
      });
    }

    setGeneratedLetterHTML(letterHTML);
    setLetterSubject(subject);
  };

  const handleSendLetter = () => {
    const recipientEmail = selectedRecipient?.profiles?.email || selectedRecipient?.email;
    sendLetterMutation.mutate({ recipientEmail, letterHTML: generatedLetterHTML, subject: letterSubject });
  };

  const handleDownloadLetter = () => {
    const blob = new Blob([generatedLetterHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${letterType}-letter-${selectedRecipient?.profiles?.full_name || selectedRecipient?.full_name || selectedRecipient?.name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Letter downloaded successfully!');
  };

  const getDocumentStatus = (recipient: any) => {
    // TODO: Implement logic to check which documents have been sent
    return 'Pending';
  };

  const renderRecipientTable = () => {
    let data: any[] = [];
    let isLoading = false;
    let error = null;
    
    if (selectedType === 'employee') {
      data = employees || [];
    }
    if (selectedType === 'trainee') {
      data = trainees || [];
      isLoading = isLoadingTrainees;
      error = traineesError;
    }
    if (selectedType === 'intern') {
      data = interns || [];
      isLoading = isLoadingInterns;
      error = internsError;
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-8">
          <p className="text-destructive">Error loading data: {error.message}</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">No {selectedType}s found</p>
        </div>
      );
    }

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
                  (selectedType === 'trainee'
                    ? 'IT Academy'
                    : selectedType === 'intern'
                      ? 'Internship'
                      : '-')}
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

      <Dialog open={letterDialogOpen} onOpenChange={(open) => {
        setLetterDialogOpen(open);
        if (!open) {
          setGeneratedLetterHTML('');
          setLetterSubject('');
          setPosition('');
          setDuration('');
          setJoiningDate('');
          setEndDate('');
        }
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Send {letterType === 'offer' ? 'Offer' : letterType === 'bonafide' ? 'Bonafide' : letterType === 'completion' ? 'Completion' : 'Experience'} Letter
            </DialogTitle>
          </DialogHeader>
          
          {!generatedLetterHTML ? (
            <>
              <div className="space-y-4 py-4">
                {/* Candidate Name - Read Only */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Candidate Name</Label>
                  <div className="text-base font-medium">
                    {selectedRecipient?.profiles?.full_name || selectedRecipient?.full_name || selectedRecipient?.name}
                  </div>
                </div>

                {/* Email - Read Only */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="text-base font-medium">
                    {selectedRecipient?.profiles?.email || selectedRecipient?.email}
                  </div>
                </div>

                {/* Position - Required Input (for Offer Letter) */}
                {letterType === 'offer' && (
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">
                      Position <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="position"
                      type="text"
                      placeholder="e.g., FullStack Developer"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="rounded-lg border-2"
                    />
                  </div>
                )}

                {/* Joining Date - Required */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate" className="text-sm font-medium">
                      Joining Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="rounded-lg border-2"
                    />
                  </div>

                  {/* Duration - Required Dropdown (for Offer Letter) */}
                  {letterType === 'offer' && (
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium">
                        Duration <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="flex h-10 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select duration</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* End Date for other letter types */}
                {(letterType === 'bonafide' || letterType === 'completion' || letterType === 'experience') && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-lg border-2"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setLetterDialogOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateLetter}
                  className="px-6 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Generate
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Letter Preview */}
              <div className="border rounded-lg p-4 bg-white max-h-[500px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: generatedLetterHTML }} />
              </div>

              {/* Send and Download Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedLetterHTML('');
                    setLetterSubject('');
                  }}
                  className="px-6"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleDownloadLetter}
                  variant="outline"
                  className="px-6"
                >
                  Download
                </Button>
                <Button 
                  onClick={handleSendLetter}
                  disabled={sendLetterMutation.isPending}
                  className="px-6 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {sendLetterMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
