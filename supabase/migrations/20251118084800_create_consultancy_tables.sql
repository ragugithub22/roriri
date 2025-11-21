-- Create consultancy tables for RIYA Consultancy module

-- Clients table (Companies)
CREATE TABLE IF NOT EXISTS consultancy_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  industry TEXT,
  requirement_type TEXT CHECK (requirement_type IN ('IT', 'Non-IT')),
  agreement_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Openings table
CREATE TABLE IF NOT EXISTS consultancy_job_openings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES consultancy_clients(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  job_description TEXT,
  required_skills TEXT[],
  experience TEXT,
  salary_range TEXT,
  work_type TEXT CHECK (work_type IN ('office', 'remote', 'hybrid')),
  location TEXT,
  vacancy_count INTEGER DEFAULT 1,
  hr_notes TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS consultancy_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  qualification TEXT,
  experience TEXT,
  skills TEXT[],
  current_company TEXT,
  current_salary DECIMAL(10,2),
  expected_salary DECIMAL(10,2),
  resume_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'shortlisted', 'rejected', 'placed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shortlisting/Screening table
CREATE TABLE IF NOT EXISTS consultancy_shortlisting (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES consultancy_candidates(id) ON DELETE CASCADE,
  job_opening_id UUID REFERENCES consultancy_job_openings(id) ON DELETE CASCADE,
  screening_status TEXT DEFAULT 'pending' CHECK (screening_status IN ('pending', 'shortlisted', 'rejected', 'interview_scheduled')),
  remarks TEXT,
  screened_by UUID,
  screened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS consultancy_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES consultancy_candidates(id) ON DELETE CASCADE,
  client_id UUID REFERENCES consultancy_clients(id) ON DELETE CASCADE,
  job_opening_id UUID REFERENCES consultancy_job_openings(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  mode TEXT CHECK (mode IN ('online', 'offline')),
  venue TEXT,
  interviewer_name TEXT,
  interview_feedback TEXT,
  result TEXT CHECK (result IN ('selected', 'rejected', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Placements table
CREATE TABLE IF NOT EXISTS consultancy_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES consultancy_candidates(id) ON DELETE CASCADE,
  client_id UUID REFERENCES consultancy_clients(id) ON DELETE CASCADE,
  job_opening_id UUID REFERENCES consultancy_job_openings(id) ON DELETE CASCADE,
  salary DECIMAL(10,2),
  joining_date DATE,
  offer_letter_url TEXT,
  placement_fee DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  placement_status TEXT DEFAULT 'offered' CHECK (placement_status IN ('offered', 'accepted', 'joined', 'dropped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments & Billing table
CREATE TABLE IF NOT EXISTS consultancy_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES consultancy_clients(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES consultancy_candidates(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES consultancy_placements(id) ON DELETE CASCADE,
  invoice_no TEXT UNIQUE,
  service_charge_percentage DECIMAL(5,2),
  invoice_amount DECIMAL(10,2),
  payment_mode TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue')),
  invoice_date DATE DEFAULT CURRENT_DATE,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries/Leads table
CREATE TABLE IF NOT EXISTS consultancy_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  requirement TEXT,
  lead_source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  converted_client_id UUID REFERENCES consultancy_clients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS consultancy_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT CHECK (document_type IN ('company_registration', 'pan', 'gst', 'agreement', 'renewal', 'policies')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'renewed')),
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultancy_clients_status ON consultancy_clients(status);
CREATE INDEX IF NOT EXISTS idx_consultancy_clients_industry ON consultancy_clients(industry);
CREATE INDEX IF NOT EXISTS idx_consultancy_job_openings_client_id ON consultancy_job_openings(client_id);
CREATE INDEX IF NOT EXISTS idx_consultancy_job_openings_status ON consultancy_job_openings(status);
CREATE INDEX IF NOT EXISTS idx_consultancy_candidates_status ON consultancy_candidates(status);
CREATE INDEX IF NOT EXISTS idx_consultancy_candidates_skills ON consultancy_candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_consultancy_shortlisting_candidate_id ON consultancy_shortlisting(candidate_id);
CREATE INDEX IF NOT EXISTS idx_consultancy_shortlisting_job_opening_id ON consultancy_shortlisting(job_opening_id);
CREATE INDEX IF NOT EXISTS idx_consultancy_interviews_candidate_id ON consultancy_interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_consultancy_interviews_date ON consultancy_interviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_consultancy_placements_candidate_id ON consultancy_placements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_consultancy_placements_status ON consultancy_placements(placement_status);
CREATE INDEX IF NOT EXISTS idx_consultancy_payments_status ON consultancy_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_consultancy_payments_client_id ON consultancy_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_consultancy_enquiries_status ON consultancy_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_consultancy_documents_type ON consultancy_documents(document_type);

-- Enable RLS (Row Level Security)
ALTER TABLE consultancy_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_shortlisting ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for authenticated users)
CREATE POLICY "Allow authenticated users to manage consultancy_clients" ON consultancy_clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_job_openings" ON consultancy_job_openings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_candidates" ON consultancy_candidates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_shortlisting" ON consultancy_shortlisting
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_interviews" ON consultancy_interviews
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_placements" ON consultancy_placements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_payments" ON consultancy_payments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_enquiries" ON consultancy_enquiries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consultancy_documents" ON consultancy_documents
  FOR ALL USING (auth.role() = 'authenticated');
