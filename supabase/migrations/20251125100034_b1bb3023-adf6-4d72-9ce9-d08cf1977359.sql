-- Create table for individual visitor registrations
CREATE TABLE IF NOT EXISTS public.industrial_visit_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_record_id UUID REFERENCES public.industrial_visit_visitors(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  visitor_type TEXT NOT NULL,
  whom_to_see TEXT,
  purpose_of_visit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for visitor page image slider
CREATE TABLE IF NOT EXISTS public.industrial_visit_slider_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industrial_visit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industrial_visit_slider_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registrations (public can insert, authenticated can view)
CREATE POLICY "Anyone can register for industrial visit"
ON public.industrial_visit_registrations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view registrations"
ON public.industrial_visit_registrations
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete registrations"
ON public.industrial_visit_registrations
FOR DELETE
USING (auth.role() = 'authenticated');

-- RLS Policies for slider images
CREATE POLICY "Authenticated users can manage slider images"
ON public.industrial_visit_slider_images
FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view slider images"
ON public.industrial_visit_slider_images
FOR SELECT
USING (true);

-- Create storage bucket for slider images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('industrial-visit-slider', 'industrial-visit-slider', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for slider images
CREATE POLICY "Authenticated users can upload slider images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'industrial-visit-slider' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view slider images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'industrial-visit-slider');

CREATE POLICY "Authenticated users can delete slider images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'industrial-visit-slider' AND auth.role() = 'authenticated');