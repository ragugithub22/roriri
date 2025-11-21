-- Create builders tables for Roshan Builders module

-- Projects table
CREATE TABLE IF NOT EXISTS builders_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  project_code TEXT UNIQUE,
  project_type TEXT CHECK (project_type IN ('residential', 'commercial', 'industrial', 'infrastructure')),
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  pincode TEXT,
  total_area DECIMAL(10,2),
  built_up_area DECIMAL(10,2),
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  start_date DATE,
  completion_date DATE,
  expected_completion_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  project_manager TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sites table
CREATE TABLE IF NOT EXISTS builders_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES builders_projects(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  site_code TEXT UNIQUE,
  location TEXT NOT NULL,
  area DECIMAL(10,2),
  site_supervisor TEXT,
  start_date DATE,
  completion_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractors table
CREATE TABLE IF NOT EXISTS builders_contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  gst_number TEXT,
  pan_number TEXT,
  specialization TEXT[], -- Array of specializations like ['civil', 'electrical', 'plumbing']
  license_number TEXT,
  license_expiry DATE,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labour table
CREATE TABLE IF NOT EXISTS builders_labour (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  skill_type TEXT CHECK (skill_type IN ('skilled', 'semi-skilled', 'unskilled')),
  specialization TEXT, -- mason, carpenter, electrician, etc.
  daily_wage DECIMAL(8,2),
  experience_years INTEGER,
  contractor_id UUID REFERENCES builders_contractors(id),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE IF NOT EXISTS builders_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_name TEXT NOT NULL,
  material_code TEXT UNIQUE,
  category TEXT CHECK (category IN ('cement', 'steel', 'bricks', 'sand', 'aggregate', 'electrical', 'plumbing', 'paint', 'other')),
  unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'ton', 'cubic_meter', 'square_meter', 'pieces', 'bags', 'liters')),
  current_stock DECIMAL(10,2) DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  unit_price DECIMAL(10,2),
  supplier_name TEXT,
  supplier_contact TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material transactions (inward/outward)
CREATE TABLE IF NOT EXISTS builders_material_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES builders_materials(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('inward', 'outward')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(12,2),
  project_id UUID REFERENCES builders_projects(id),
  supplier_name TEXT,
  invoice_number TEXT,
  remarks TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS builders_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  date_of_birth DATE,
  occupation TEXT,
  annual_income DECIMAL(12,2),
  pan_number TEXT,
  aadhar_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project-Client relationship (for multiple clients per project)
CREATE TABLE IF NOT EXISTS builders_project_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES builders_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES builders_clients(id) ON DELETE CASCADE,
  unit_number TEXT,
  floor_number TEXT,
  area DECIMAL(8,2),
  agreement_value DECIMAL(15,2),
  booking_date DATE,
  agreement_date DATE,
  possession_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance/Transactions table
CREATE TABLE IF NOT EXISTS builders_financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES builders_projects(id),
  client_id UUID REFERENCES builders_clients(id),
  transaction_type TEXT CHECK (transaction_type IN ('income', 'expense', 'investment', 'loan')),
  category TEXT CHECK (category IN ('booking', 'installment', 'construction_cost', 'material_cost', 'labour_cost', 'overhead', 'profit', 'loss')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'cheque', 'online', 'bank_transfer')),
  reference_number TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS builders_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT CHECK (document_type IN ('agreement', 'plan', 'permit', 'invoice', 'contract', 'completion_certificate', 'other')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  project_id UUID REFERENCES builders_projects(id),
  client_id UUID REFERENCES builders_clients(id),
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table (for storing generated reports)
CREATE TABLE IF NOT EXISTS builders_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT CHECK (report_type IN ('project_status', 'financial', 'material_inventory', 'labour_attendance', 'client_payments', 'profit_loss')),
  report_name TEXT NOT NULL,
  report_data JSONB,
  generated_by UUID,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES builders_projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users & Roles table
CREATE TABLE IF NOT EXISTS builders_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT CHECK (role IN ('super_admin', 'project_manager', 'site_supervisor', 'accountant', 'store_keeper', 'sales_executive')),
  department TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS builders_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  setting_type TEXT CHECK (setting_type IN ('system', 'user', 'project')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_builders_projects_status ON builders_projects(status);
CREATE INDEX IF NOT EXISTS idx_builders_projects_location ON builders_projects(location);
CREATE INDEX IF NOT EXISTS idx_builders_sites_project_id ON builders_sites(project_id);
CREATE INDEX IF NOT EXISTS idx_builders_contractors_specialization ON builders_contractors USING GIN(specialization);
CREATE INDEX IF NOT EXISTS idx_builders_labour_contractor_id ON builders_labour(contractor_id);
CREATE INDEX IF NOT EXISTS idx_builders_materials_category ON builders_materials(category);
CREATE INDEX IF NOT EXISTS idx_builders_material_transactions_material_id ON builders_material_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_builders_material_transactions_project_id ON builders_material_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_builders_project_clients_project_id ON builders_project_clients(project_id);
CREATE INDEX IF NOT EXISTS idx_builders_project_clients_client_id ON builders_project_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_builders_financial_transactions_project_id ON builders_financial_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_builders_financial_transactions_client_id ON builders_financial_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_builders_documents_project_id ON builders_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_builders_documents_client_id ON builders_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_builders_users_role ON builders_users(role);

-- Enable RLS (Row Level Security)
ALTER TABLE builders_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_labour ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_material_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for authenticated users)
CREATE POLICY "Allow authenticated users to manage builders_projects" ON builders_projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_sites" ON builders_sites
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_contractors" ON builders_contractors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_labour" ON builders_labour
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_materials" ON builders_materials
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_material_transactions" ON builders_material_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_clients" ON builders_clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_project_clients" ON builders_project_clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_financial_transactions" ON builders_financial_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_documents" ON builders_documents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_reports" ON builders_reports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_users" ON builders_users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage builders_settings" ON builders_settings
  FOR ALL USING (auth.role() = 'authenticated');
