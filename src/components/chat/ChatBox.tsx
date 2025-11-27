import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';

export default function ChatBox() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['chat-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, profiles:profile_id(full_name, email)')
        .order('profiles(full_name)');
      if (error) throw error;
      return data?.map(emp => ({
        id: emp.id,
        full_name: emp.profiles?.full_name,
        email: emp.profiles?.email,
        type: 'Employee'
      })) || [];
    },
  });

  // Fetch trainees
  const { data: trainees } = useQuery({
    queryKey: ['chat-trainees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, email')
        .order('full_name');
      if (error) throw error;
      return data?.map(trainee => ({
        id: trainee.id,
        full_name: trainee.full_name,
        email: trainee.email,
        type: 'Trainee'
      })) || [];
    },
  });

  // Fetch intern candidates
  const { data: interns } = useQuery({
    queryKey: ['chat-interns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internship_candidates')
        .select('id, name, email')
        .order('name');
      if (error) throw error;
      return data?.map(intern => ({
        id: intern.id,
        full_name: intern.name,
        email: intern.email,
        type: 'Intern'
      })) || [];
    },
  });

  // Combine all users
  const users = [...(employees || []), ...(trainees || []), ...(interns || [])];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: Implement message sending logic
    setMessage('');
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-[600px]">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {users?.map((user) => (
              <div
                key={user.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                  selectedUser?.id === user.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.type} • {user.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedUser ? selectedUser.full_name : 'Select a contact'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            {selectedUser ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Start a conversation with {selectedUser.full_name}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a contact to start chatting
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!selectedUser}
            />
            <Button onClick={handleSendMessage} disabled={!selectedUser}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
