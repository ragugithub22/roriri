import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Contact {
  id: string;
  profile_id: string;
  full_name: string;
  role: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  recipient_id: string;
  recipient_type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function ChatBoxPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch contacts with roles: admin, manager, hr, trainer
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["chat-contacts"],
    queryFn: async () => {
      // First, get users with the specific roles
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
        .select('id, profile_id')
        .eq('status', 'active')
        .in('profile_id', validUserIds);

      if (employeesError) throw employeesError;
      if (!employeesData || employeesData.length === 0) return [];

      // Fetch profiles for these employees
      const profileIds = employeesData.map(e => e.profile_id).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      // Create lookup maps
      const roleMap = new Map(rolesData.map(r => [r.user_id, r.role]));
      const profileMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);
      
      return employeesData.map(emp => ({
        id: emp.id,
        profile_id: emp.profile_id || '',
        full_name: profileMap.get(emp.profile_id || '') || 'Unknown',
        role: roleMap.get(emp.profile_id || '') || 'Staff'
      }));
    },
  });

  // Fetch messages for selected contact
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", selectedContact?.id],
    queryFn: async () => {
      if (!selectedContact) return [];

      const { data, error } = await supabase
        .from('trainee_chat_messages')
        .select('*')
        .or(`and(sender_id.eq.admin,recipient_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},recipient_id.eq.admin)`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedContact,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedContact) throw new Error("No contact selected");

      const { error } = await supabase
        .from('trainee_chat_messages')
        .insert({
          sender_id: 'admin',
          sender_type: 'admin',
          recipient_id: selectedContact.id,
          recipient_type: 'employee',
          message: messageText,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedContact?.id] });
      setMessage("");
    },
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedContact) return;

    const channel = supabase
      .channel('admin-chat-messages')
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
            (newMessage.sender_id === 'admin' && newMessage.recipient_id === selectedContact.id) ||
            (newMessage.sender_id === selectedContact.id && newMessage.recipient_id === 'admin')
          ) {
            queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedContact.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedContact, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredContacts = contacts.filter((contact) =>
    contact.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim() && selectedContact) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'manager': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'hr': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'trainer': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
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
            {contactsLoading ? (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                No contacts found
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${
                    selectedContact?.id === contact.id ? "bg-accent" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {contact.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-foreground block">{contact.full_name}</span>
                    <Badge variant="outline" className={`text-xs mt-1 ${getRoleBadgeColor(contact.role)}`}>
                      {contact.role.charAt(0).toUpperCase() + contact.role.slice(1)}
                    </Badge>
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
              <AvatarFallback className="bg-muted text-muted-foreground">
                {selectedContact.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-foreground">{selectedContact.full_name}</span>
              <Badge variant="outline" className={`ml-2 text-xs ${getRoleBadgeColor(selectedContact.role)}`}>
                {selectedContact.role.charAt(0).toUpperCase() + selectedContact.role.slice(1)}
              </Badge>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {selectedContact ? (
            messagesLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Start a conversation with {selectedContact.full_name}
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
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
              disabled={!selectedContact}
            />
            <Button 
              onClick={handleSendMessage} 
              size="icon" 
              className="shrink-0"
              disabled={!selectedContact || !message.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
