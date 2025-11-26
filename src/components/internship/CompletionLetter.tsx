import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoImage from "@/assets/roriri-logo-completion.jpg";

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
  const [showPreview, setShowPreview] = useState(false);

  const calculateDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleGenerate = () => {
    setShowPreview(true);
  };

  const handleSend = () => {
    onGenerate(startDate, endDate);
    onClose();
  };

  const letterContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${logoImage}" alt="Roriri Logo" style="max-width: 150px; margin-bottom: 10px;" />
        <h2 style="color: #1a1a1a; font-size: 24px; margin: 10px 0;">Roriri SOFTWARE SOLUTIONS</h2>
      </div>

      <h1 style="text-align: center; color: #1a1a1a; font-size: 28px; margin-bottom: 30px;">INTERNSHIP COMPLETION LETTER</h1>

      <p style="margin-bottom: 20px;">Dear ${candidateName},</p>

      <p style="margin-bottom: 20px;">
        We are Delighted to acknowledge the Successful completion of your Internship with Roriri Software Solutions Pvt Ltd. 
        Your Internship, which ran from ${formatDate(startDate)} to ${formatDate(endDate)} has come to a successful close, 
        and we are pleased to report that you achieved a perfect attendance record throughout this period.
      </p>

      <p style="margin-bottom: 20px;">
        Your commitment to your role and your consistent presence at the office have been truly commendable. 
        Your contributions to our ${courseName || 'team'} were highly valued, and your dedication and work ethic have not gone unnoticed.
      </p>

      <p style="margin-bottom: 20px;">
        It has been a pleasure having you with us as an intern. You brought a fresh perspective to our team, 
        and we hope that your time here was both insightful and rewarding.
      </p>

      <p style="margin-bottom: 30px;">
        Thank you once again for your exceptional performance and dedication during this ${calculateDuration()} Month${calculateDuration() > 1 ? 's' : ''} of Internship Period.
      </p>

      <p style="margin-bottom: 10px;">Best regards,</p>
      <p style="margin-bottom: 5px; font-weight: bold;">Ragupathi R,</p>
      <p style="margin-bottom: 20px;">Chief Executive Officer (CEO),<br/>Roriri Software Solutions Pvt Ltd</p>
      <p style="margin-bottom: 30px;">Reg.No.: 164206</p>

      <div style="border-top: 2px solid #ddd; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #666;">
        <p style="margin: 5px 0;">📞 +91 73389 41579 | +91 96770 18421</p>
        <p style="margin: 5px 0;">🌐 www.roririsoft.com</p>
        <p style="margin: 5px 0;">📧 services@roririsoft.com</p>
        <p style="margin: 5px 0;">📍 RORIRI IT PARK, Kalakad, Tirunelveli - 627502</p>
      </div>
    </div>
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showPreview ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Edit Completion Letter Details</h3>
            
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
              <Button onClick={handleGenerate}>Generate Preview</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              className="border rounded-lg p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: letterContent }}
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>Edit</Button>
              <Button onClick={handleSend}>Send Letter</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
