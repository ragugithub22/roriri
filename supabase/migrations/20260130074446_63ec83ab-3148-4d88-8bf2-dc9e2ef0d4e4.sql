-- Create storage bucket for task assignment files
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-files', 'task-files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own task folders
CREATE POLICY "Users can upload task files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);

-- Allow users to view files for tasks they have access to
CREATE POLICY "Users can view task files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete own task files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);

-- Add file_url column to trainer_task_assignments table
ALTER TABLE public.trainer_task_assignments 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;