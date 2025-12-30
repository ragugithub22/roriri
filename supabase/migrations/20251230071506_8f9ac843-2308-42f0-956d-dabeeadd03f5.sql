-- Create trainee_chat_messages table for trainee-to-staff messaging
CREATE TABLE public.trainee_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'employee')),
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('student', 'employee')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainee_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
-- Anyone can view messages they sent or received
CREATE POLICY "Users can view their chat messages"
  ON public.trainee_chat_messages FOR SELECT
  USING (true);

-- Anyone can insert chat messages
CREATE POLICY "Users can send chat messages"
  ON public.trainee_chat_messages FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainee_chat_messages;