-- Create academy_applications table
CREATE TABLE academy_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id),
  course_name text NOT NULL,
  application_name text NOT NULL,
  duration text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create academy_daily_work_updates table
CREATE TABLE academy_daily_work_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES employees(id),
  work_description text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create academy_complaints table
CREATE TABLE academy_complaints (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_from uuid REFERENCES employees(id),
  complaint_to uuid REFERENCES employees(id),
  complaint_text text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE academy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_daily_work_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_complaints ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all academy applications" ON academy_applications FOR SELECT USING (true);
CREATE POLICY "Users can insert academy applications" ON academy_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own academy applications" ON academy_applications FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own academy applications" ON academy_applications FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view all daily work updates" ON academy_daily_work_updates FOR SELECT USING (true);
CREATE POLICY "Users can insert daily work updates" ON academy_daily_work_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own daily work updates" ON academy_daily_work_updates FOR UPDATE USING (auth.uid() = employee_id);
CREATE POLICY "Users can delete their own daily work updates" ON academy_daily_work_updates FOR DELETE USING (auth.uid() = employee_id);

CREATE POLICY "Users can view all complaints" ON academy_complaints FOR SELECT USING (true);
CREATE POLICY "Users can insert complaints" ON academy_complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update complaints" ON academy_complaints FOR UPDATE USING (true);
CREATE POLICY "Users can delete complaints" ON academy_complaints FOR DELETE USING (true);
