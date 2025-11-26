import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompletionLetterProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  courseName?: string;
  joiningDate?: string;
  onGenerate: (startDate: string, endDate: string) => void;
}

export default function CompletionLetter({ 
  isOpen, 
  onClose, 
  candidateName,
  courseName,
  joiningDate,
  onGenerate 
}: CompletionLetterProps) {
  const calculateEndDate = (start: string, months: number) => {
    const date = new Date(start);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(joiningDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(calculateEndDate(joiningDate || new Date().toISOString().split('T')[0], 3));

  const calculateDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  const handleSend = () => {
    onGenerate(startDate, endDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Completion Letter Details</h3>
          
          <div className="space-y-2">
            <Label>Candidate Name</Label>
            <Input value={candidateName} disabled />
          </div>

          <div className="space-y-2">
            <Label>Course/Role</Label>
            <Input value={courseName || ''} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Input value={`${calculateDuration()} Month${calculateDuration() > 1 ? 's' : ''}`} disabled />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSend}>Send Letter</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
