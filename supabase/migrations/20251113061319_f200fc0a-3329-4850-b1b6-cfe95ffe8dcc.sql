-- Create storage bucket for syllabus PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('syllabus-pdfs', 'syllabus-pdfs', true);

-- Add pdf_url column to syllabus table
ALTER TABLE syllabus
ADD COLUMN pdf_url TEXT;

-- Create storage policies for syllabus PDFs
CREATE POLICY "IT Academy users can upload syllabus PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'syllabus-pdfs' AND
  has_entity_access(auth.uid(), (SELECT entities.id FROM entities WHERE entities.code = 'it_academy'::entity_code))
);

CREATE POLICY "Anyone can view syllabus PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'syllabus-pdfs');

CREATE POLICY "IT Academy users can delete syllabus PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'syllabus-pdfs' AND
  has_entity_access(auth.uid(), (SELECT entities.id FROM entities WHERE entities.code = 'it_academy'::entity_code))
);