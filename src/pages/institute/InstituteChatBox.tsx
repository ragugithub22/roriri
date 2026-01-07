import { useEffect, useState } from "react";
import TraineeChatBox from "@/components/chat/TraineeChatBox";

const InstituteChatBox = () => {
  const [userId, setUserId] = useState<string | null>(null);

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

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TraineeChatBox currentUserId={userId} currentUserType="employee" />
    </div>
  );
};

export default InstituteChatBox;
