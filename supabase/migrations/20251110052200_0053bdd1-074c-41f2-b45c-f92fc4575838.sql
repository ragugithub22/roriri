-- Make entity_id nullable in departments table to allow departments without specific entity assignment
ALTER TABLE public.departments 
ALTER COLUMN entity_id DROP NOT NULL;

-- Update RLS policy to allow entity access for departments without entity_id
DROP POLICY IF EXISTS "Entity access for departments" ON public.departments;

CREATE POLICY "Entity access for departments"
ON public.departments
FOR ALL
USING (
  entity_id IS NULL OR has_entity_access(auth.uid(), entity_id)
);