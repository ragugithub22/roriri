import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Search, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Contact {
  id: string;
  full_name: string;
  role: string;
  profile_id: string;
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

interface TraineeChatBoxProps {
  currentUserId: string;
  currentUserType: 'student' | 'employee';
}

export default function TraineeChatBox({ currentUserId, currentUserType }: TraineeChatBoxProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch contacts with roles: admin, manager, hr, trainer
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['chat-contacts-filtered'],
    queryFn: async () => {
      // Get user_roles with the required roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'manager', 'hr', 'trainer']);

      if (rolesError) throw rolesError;
      if (!rolesData || rolesData.length === 0) return [];

      const validUserIds = rolesData.map(r => r.user_id);

      // Fetch employees whose profile_id matches
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id, 
          profile_id, 
          profiles(full_name)
        `)
        .eq('status', 'active')
        .in('profile_id', validUserIds);

      if (employeesError) throw employeesError;

      // Map roles to employees
      const roleMap = new Map(rolesData.map(r => [r.user_id, r.role]));
      
      return employeesData?.map(emp => ({
        id: emp.id,
        profile_id: emp.profile_id,
        full_name: emp.profiles?.full_name || 'Unknown',
        role: roleMap.get(emp.profile_id) || 'Staff'
      })) || [];
    },
  });

  // Fetch messages between current user and selected contact
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', currentUserId, selectedContact?.id],
    queryFn: async () => {
      if (!selectedContact) return [];

      const { data, error } = await supabase
        .from('trainee_chat_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},recipient_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedContact,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedContact) throw new Error('No contact selected');

      const { error } = await supabase
        .from('trainee_chat_messages')
        .insert({
          sender_id: currentUserId,
          sender_type: currentUserType,
          recipient_id: selectedContact.id,
          recipient_type: 'employee',
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

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedContact) return;

    const channel = supabase
      .channel('trainee-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trainee_chat_messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only update if message is between current user and selected contact
          if (
            (newMessage.sender_id === currentUserId && newMessage.recipient_id === selectedContact.id) ||
            (newMessage.sender_id === selectedContact.id && newMessage.recipient_id === currentUserId)
          ) {
            queryClient.invalidateQueries({ queryKey: ['chat-messages', currentUserId, selectedContact.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedContact, currentUserId, queryClient]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedContact) return;
    sendMessageMutation.mutate(message.trim());
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'hr':
        return 'bg-green-100 text-green-800';
      case 'trainer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Left Sidebar - Contacts */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contacts
          </h3>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
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
            {contactsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
                No contacts found
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-accent' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {contact.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">{contact.full_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor(contact.role)}`}>
                      {contact.role}
                    </span>
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
        {selectedContact && (
          <div className="p-4 border-b bg-card flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedContact.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedContact.full_name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor(selectedContact.role)}`}>
                {selectedContact.role}
              </span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {selectedContact ? (
            messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Start a conversation with {selectedContact.full_name}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isSentByMe = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isSentByMe
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
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
              disabled={!selectedContact || sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!selectedContact || !message.trim() || sendMessageMutation.isPending}
              size="icon"
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
