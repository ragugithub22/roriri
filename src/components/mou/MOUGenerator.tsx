import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Send, FileText } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

interface MOUGeneratorProps {
  onClose: () => void;
}

const mouTemplates = {
  Company: (name: string, address: string, date: string) => `
MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding (MOU) is entered into on ${date} between:

RORIRI IT PARK
Address: [RORIRI IT PARK Address]
(Hereinafter referred to as "First Party")

AND

${name}
Address: ${address}
(Hereinafter referred to as "Second Party")

WHEREAS, the First Party is engaged in IT services, training, and technology solutions;

WHEREAS, the Second Party is desirous of collaborating with the First Party for mutual business benefits;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. PURPOSE
   The purpose of this MOU is to establish a framework for collaboration between the parties in areas of mutual interest including but not limited to technology services, training programs, and business development.

2. SCOPE OF COLLABORATION
   - Joint development of IT solutions
   - Training and skill development programs
   - Resource sharing and knowledge exchange
   - Marketing and business development initiatives

3. TERM
   This MOU shall be effective from the date of signing and shall remain in force for a period of one (1) year, unless terminated earlier by mutual consent.

4. OBLIGATIONS
   Both parties agree to:
   - Act in good faith towards achieving the objectives of this MOU
   - Maintain confidentiality of shared information
   - Comply with all applicable laws and regulations

5. INTELLECTUAL PROPERTY
   All intellectual property rights arising from the collaboration shall be jointly owned by both parties unless otherwise agreed in writing.

6. TERMINATION
   Either party may terminate this MOU by providing thirty (30) days written notice to the other party.

IN WITNESS WHEREOF, the parties have executed this Memorandum of Understanding as of the date first written above.

For RORIRI IT PARK                    For ${name}

_____________________                _____________________
Authorized Signatory                  Authorized Signatory
Date: ${date}                         Date: ${date}
  `,
  
  College: (name: string, address: string, date: string) => `
MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding (MOU) is entered into on ${date} between:

RORIRI IT PARK
Address: [RORIRI IT PARK Address]
(Hereinafter referred to as "First Party")

AND

${name}
Address: ${address}
(Hereinafter referred to as "Second Party" / "The College")

WHEREAS, the First Party is engaged in providing IT training, skill development, and placement services;

WHEREAS, the Second Party is an educational institution committed to providing quality education and career opportunities to its students;

NOW, THEREFORE, the parties agree to collaborate as follows:

1. PURPOSE
   To establish a partnership for student training, internships, placements, and faculty development programs.

2. SCOPE OF COLLABORATION
   - Industry-oriented training programs for students
   - Internship opportunities at RORIRI IT PARK
   - Campus placement drives and recruitment
   - Faculty development and industry exposure programs
   - Joint workshops, seminars, and technical events
   - Curriculum development and industry alignment

3. OBLIGATIONS OF FIRST PARTY
   - Provide quality training to students
   - Offer internship opportunities to eligible students
   - Conduct placement drives as per requirement
   - Share industry insights for curriculum enhancement

4. OBLIGATIONS OF SECOND PARTY
   - Facilitate student participation in training programs
   - Promote internship and placement opportunities
   - Coordinate campus visits and recruitment activities
   - Support joint academic and technical initiatives

5. TERM
   This MOU shall be valid for two (2) years from the date of signing and may be renewed by mutual agreement.

6. TERMINATION
   Either party may terminate this MOU by providing sixty (60) days written notice.

IN WITNESS WHEREOF, the parties have executed this MOU on the date mentioned above.

For RORIRI IT PARK                    For ${name}

_____________________                _____________________
Authorized Signatory                  Principal/Director
Date: ${date}                         Date: ${date}
  `,
  
  School: (name: string, address: string, date: string) => `
MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding (MOU) is entered into on ${date} between:

RORIRI IT PARK
Address: [RORIRI IT PARK Address]
(Hereinafter referred to as "First Party")

AND

${name}
Address: ${address}
(Hereinafter referred to as "Second Party" / "The School")

WHEREAS, the First Party is committed to promoting digital literacy and technology education;

WHEREAS, the Second Party seeks to enhance technology education and exposure for its students;

NOW, THEREFORE, the parties agree to collaborate as follows:

1. PURPOSE
   To establish a partnership for promoting technology education, digital literacy, and skill development among school students.

2. SCOPE OF COLLABORATION
   - Basic computer and coding workshops for students
   - Technology awareness programs
   - Career guidance and counseling sessions
   - Teacher training programs for technology integration
   - School infrastructure support for computer labs
   - Participation in technical competitions and events

3. OBLIGATIONS OF FIRST PARTY
   - Conduct age-appropriate technology workshops
   - Provide career guidance in IT field
   - Offer teacher training programs
   - Support technical events and competitions

4. OBLIGATIONS OF SECOND PARTY
   - Facilitate student participation in programs
   - Coordinate workshop schedules
   - Provide necessary infrastructure for programs
   - Promote technology education initiatives

5. TERM
   This MOU shall remain in effect for one (1) year from the date of signing and may be renewed by mutual consent.

6. TERMINATION
   Either party may terminate this MOU by providing thirty (30) days written notice.

IN WITNESS WHEREOF, the parties have executed this MOU on the date mentioned above.

For RORIRI IT PARK                    For ${name}

_____________________                _____________________
Authorized Signatory                  Principal/Headmaster
Date: ${date}                         Date: ${date}
  `,
  
  Institute: (name: string, address: string, date: string) => `
MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding (MOU) is entered into on ${date} between:

RORIRI IT PARK
Address: [RORIRI IT PARK Address]
(Hereinafter referred to as "First Party")

AND

${name}
Address: ${address}
(Hereinafter referred to as "Second Party" / "The Institute")

WHEREAS, the First Party is engaged in IT services, training, and technology solutions;

WHEREAS, the Second Party is a training/educational institute seeking collaboration in technology domain;

NOW, THEREFORE, the parties agree to collaborate as follows:

1. PURPOSE
   To establish a partnership for professional training, certification programs, and mutual capacity building.

2. SCOPE OF COLLABORATION
   - Professional certification programs
   - Industry-specific training courses
   - Faculty exchange and development programs
   - Joint research and development initiatives
   - Resource sharing for training infrastructure
   - Collaborative placement and recruitment activities

3. OBLIGATIONS OF FIRST PARTY
   - Provide industry-standard training programs
   - Share technical expertise and resources
   - Support certification and assessment processes
   - Facilitate placement opportunities

4. OBLIGATIONS OF SECOND PARTY
   - Promote collaborative programs to students
   - Facilitate program implementation
   - Provide necessary infrastructure support
   - Coordinate assessment and certification activities

5. TERM
   This MOU shall be valid for two (2) years from the date of signing and may be extended by mutual agreement.

6. TERMINATION
   Either party may terminate this MOU by providing ninety (90) days written notice.

IN WITNESS WHEREOF, the parties have executed this MOU on the date mentioned above.

For RORIRI IT PARK                    For ${name}

_____________________                _____________________
Authorized Signatory                  Director/Head
Date: ${date}                         Date: ${date}
  `
};

export default function MOUGenerator({ onClose }: MOUGeneratorProps) {
  const [mouType, setMouType] = useState<string>("");
  const [entityName, setEntityName] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleGenerate = () => {
    if (!mouType || !entityName || !address) {
      toast.error("Please fill all required fields");
      return;
    }

    const template = mouTemplates[mouType as keyof typeof mouTemplates];
    if (template) {
      const content = template(entityName, address, new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
      setGeneratedContent(content);
      toast.success("MOU generated successfully");
    }
  };

  const handleDownload = () => {
    if (!generatedContent) {
      toast.error("Please generate MOU first");
      return;
    }

    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOU_${mouType}_${entityName.replace(/\s+/g, '_')}_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("MOU downloaded successfully");
  };

  const handleSend = () => {
    if (!generatedContent) {
      toast.error("Please generate MOU first");
      return;
    }
    
    // Placeholder for send functionality
    toast.info("Send functionality will be implemented with email integration");
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate MOU Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={mouType} onValueChange={setMouType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="Institute">Institute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {mouType ? `${mouType} Name` : 'Name'} *
              </Label>
              <Input
                id="name"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder={`Enter ${mouType || 'entity'} name`}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Generate MOU
            </Button>
          </div>

          {generatedContent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="content">Generated MOU Content (Editable)</Label>
                <Textarea
                  id="content"
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Digital Signature</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSignature(!showSignature)}
                  >
                    {showSignature ? 'Hide' : 'Add'} Signature
                  </Button>
                </div>

                {showSignature && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="border-2 border-dashed rounded">
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          className: 'w-full h-40 rounded',
                          style: { touchAction: 'none' }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearSignature}
                    >
                      Clear Signature
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleSend} variant="outline" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
