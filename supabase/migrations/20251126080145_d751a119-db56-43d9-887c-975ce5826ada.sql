-- Create user_entities table to link users to entities they have access to
CREATE TABLE IF NOT EXISTS public.user_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.user_entities ENABLE ROW LEVEL SECURITY;

-- Users can view their own entity access
CREATE POLICY "Users can view their own entity access"
ON public.user_entities
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all entity access
CREATE POLICY "Admins can manage entity access"
ON public.user_entities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_entities_user_id ON public.user_entities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_entities_entity_id ON public.user_entities(entity_id);