-- Add incharge_person_id column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS incharge_person_id UUID REFERENCES employees(id);
