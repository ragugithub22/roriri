import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Building2 } from "lucide-react";

const InstituteMOUDetails = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [instituteName, setInstituteName] = useState<string>("");

  useEffect(() => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        setUserId(sessionData.originalId || sessionData.userId);
      } catch (error) {
        console.error('Error parsing user session:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            MOU Details
          </CardTitle>
          <CardDescription>
            Memorandum of Understanding documents between your institution and RORIRI IT PARK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">MOU Management</h3>
            <p className="text-muted-foreground max-w-md">
              Contact the administration to set up or view your MOU documents. 
              MOU agreements define the partnership terms between your institution and our organization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstituteMOUDetails;
