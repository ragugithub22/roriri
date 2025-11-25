-- Create internship_id_cards table
CREATE TABLE IF NOT EXISTS public.internship_id_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_card_number TEXT NOT NULL UNIQUE,
  candidate_id UUID NOT NULL REFERENCES public.internship_candidates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internship_id_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company users
CREATE POLICY "IT Company users can view ID cards"
  ON public.internship_id_cards
  FOR SELECT
  USING (has_entity_access(auth.uid(), (SELECT entities.id FROM entities WHERE entities.code = 'it_company'::entity_code)));

CREATE POLICY "IT Company users can manage ID cards"
  ON public.internship_id_cards
  FOR ALL
  USING (has_entity_access(auth.uid(), (SELECT entities.id FROM entities WHERE entities.code = 'it_company'::entity_code)));

-- Create index for faster lookups
CREATE INDEX idx_internship_id_cards_candidate_id ON public.internship_id_cards(candidate_id);