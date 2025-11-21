import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EnquiryDetailsProps {
  onNavigate: (id: string) => void;
}

const EnquiryDetails = ({ onNavigate }: EnquiryDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Enquiry</CardTitle>
          <CardDescription>Manage project-related enquiries and responses.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Project enquiry management coming soon...</p>
          <Button onClick={() => onNavigate('project-enquiry')} className="mt-4">
            Open
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Enquiry</CardTitle>
          <CardDescription>View and manage all types of enquiries.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>View and manage all types of enquiries.</p>
          <Button onClick={() => onNavigate('all-enquiries')} className="mt-4">
            Open
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnquiryDetails;
