-- Drop the existing check constraints
ALTER TABLE public.trainee_chat_messages DROP CONSTRAINT trainee_chat_messages_sender_type_check;
ALTER TABLE public.trainee_chat_messages DROP CONSTRAINT trainee_chat_messages_recipient_type_check;

-- Add new check constraints that include 'intern'
ALTER TABLE public.trainee_chat_messages ADD CONSTRAINT trainee_chat_messages_sender_type_check 
  CHECK (sender_type = ANY (ARRAY['student'::text, 'employee'::text, 'intern'::text]));

ALTER TABLE public.trainee_chat_messages ADD CONSTRAINT trainee_chat_messages_recipient_type_check 
  CHECK (recipient_type = ANY (ARRAY['student'::text, 'employee'::text, 'intern'::text]));