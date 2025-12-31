import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  type: 'Employee' | 'Trainee' | 'Intern';
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  recipient_id: string;
  recipient_type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function ChatBox() {
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['chat-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, profiles:profile_id(full_name, email)')
        .order('profiles(full_name)');
      if (error) throw error;
      return data?.map(emp => ({
        id: emp.id,
        full_name: emp.profiles?.full_name || 'Unknown',
        email: emp.profiles?.email || '',
        type: 'Employee' as const
      })) || [];
    },
  });

  // Fetch trainees (students)
  const { data: trainees = [] } = useQuery({
    queryKey: ['chat-trainees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, email')
        .order('full_name');
      if (error) throw error;
      return data?.map(trainee => ({
        id: trainee.id,
        full_name: trainee.full_name || 'Unknown',
        email: trainee.email || '',
        type: 'Trainee' as const
      })) || [];
    },
  });

  // Fetch intern candidates
  const { data: interns = [] } = useQuery({
    queryKey: ['chat-interns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internship_candidates')
        .select('id, name, email')
        .order('name');
      if (error) throw error;
      return data?.map(intern => ({
        id: intern.id,
        full_name: intern.name || 'Unknown',
        email: intern.email || '',
        type: 'Intern' as const
      })) || [];
    },
  });

  // Combine all users
  const users: Contact[] = [...employees, ...trainees, ...interns];

  // Filter contacts by search query
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch messages for selected contact
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['admin-chat-messages', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];

      const { data, error } = await supabase
        .from('trainee_chat_messages')
        .select('*')
        .or(`and(sender_id.eq.admin,recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.eq.admin)`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedUser,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedUser) throw new Error('No contact selected');

      // Map user type to sender_type format
      const recipientType = selectedUser.type === 'Trainee' ? 'student' : 
                           selectedUser.type === 'Intern' ? 'student' : 'employee';

      const { error } = await supabase
        .from('trainee_chat_messages')
        .insert({
          sender_id: 'admin',
          sender_type: 'employee',
          recipient_id: selectedUser.id,
          recipient_type: recipientType,
          message: messageText,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      refetchMessages();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedUser) return;

    const channel = supabase
      .channel('admin-chat-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trainee_chat_messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === 'admin' && newMessage.recipient_id === selectedUser.id) ||
            (newMessage.sender_id === selectedUser.id && newMessage.recipient_id === 'admin')
          ) {
            queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', selectedUser.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;
    sendMessageMutation.mutate(message.trim());
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Employee':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Trainee':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Intern':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background border rounded-lg overflow-hidden">
      {/* Left Sidebar - Contacts */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* Current User */}
        <div className="p-4 border-b flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold text-foreground">Admin</span>
            <Badge variant="outline" className="ml-2 text-xs bg-red-500/10 text-red-500 border-red-500/20">
              Admin
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Contact List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                No contacts found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={`${user.type}-${user.id}`}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${
                    selectedUser?.id === user.id && selectedUser?.type === user.type ? 'bg-accent' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {user.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-foreground truncate">{user.full_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(user.type)}`}>
                        {user.type}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {selectedUser && (
          <div className="p-4 border-b bg-card flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-muted-foreground">
                {selectedUser.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-foreground">{selectedUser.full_name}</span>
              <Badge variant="outline" className={`ml-2 text-xs ${getTypeBadgeColor(selectedUser.type)}`}>
                {selectedUser.type}
              </Badge>
              <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {selectedUser ? (
            messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Start a conversation with {selectedUser.full_name}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <span className={`text-xs mt-1 block ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a contact to start chatting
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1"
              disabled={!selectedUser || sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="shrink-0"
              disabled={!selectedUser || !message.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
