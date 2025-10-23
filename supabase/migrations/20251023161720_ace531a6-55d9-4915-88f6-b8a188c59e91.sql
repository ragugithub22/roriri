-- =============================================
-- RORIRI ERP System - Complete Database Schema
-- =============================================

-- =============================================
-- PHASE 1: ENUMS & TYPES
-- =============================================

-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff', 'viewer');

-- Entity codes enum
CREATE TYPE public.entity_code AS ENUM (
  'academy',
  'foundation',
  'farm',
  'consultancy',
  'trading',
  'automation',
  'it_company'
);

-- Status enums
CREATE TYPE public.status_type AS ENUM ('active', 'inactive', 'pending', 'archived');
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.order_status AS ENUM ('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- =============================================
-- PHASE 2: CORE FOUNDATION TABLES
-- =============================================

-- Entities table (7 business units)
CREATE TABLE public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code entity_code UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  primary_entity_id UUID REFERENCES public.entities(id),
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table (security critical - separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role, entity_id)
);

-- =============================================
-- PHASE 3: HUMAN RESOURCES
-- =============================================

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  employee_code TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  position_id UUID REFERENCES public.positions(id),
  hire_date DATE NOT NULL,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL,
  allowances DECIMAL(15,2) DEFAULT 0,
  deductions DECIMAL(15,2) DEFAULT 0,
  net_salary DECIMAL(15,2) NOT NULL,
  payment_date DATE,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 4: FINANCIAL MANAGEMENT
-- =============================================

CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  account_code TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  parent_account_id UUID REFERENCES public.accounts(id),
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type transaction_type NOT NULL,
  account_id UUID REFERENCES public.accounts(id) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_number TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(15,2) NOT NULL,
  spent_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 5: ASSET MANAGEMENT
-- =============================================

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchase_date DATE,
  purchase_cost DECIMAL(15,2),
  current_value DECIMAL(15,2),
  location TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.asset_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  maintenance_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(15,2),
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  assigned_date DATE NOT NULL,
  returned_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 6: INVENTORY & PROCUREMENT
-- =============================================

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  reorder_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.inventory_locations(id) NOT NULL,
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery DATE,
  total_amount DECIMAL(15,2) NOT NULL,
  status order_status DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 7: RORIRI ACADEMY
-- =============================================

CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  enrollment_date DATE NOT NULL,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  fees DECIMAL(15,2),
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  class_name TEXT NOT NULL,
  instructor_id UUID REFERENCES public.employees(id),
  start_date DATE NOT NULL,
  end_date DATE,
  schedule TEXT,
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  enrollment_date DATE NOT NULL,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, class_id)
);

CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  assessment_name TEXT NOT NULL,
  score DECIMAL(5,2),
  max_score DECIMAL(5,2) NOT NULL,
  grade TEXT,
  assessment_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sports_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  coach_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sports_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 8: RORIRI FOUNDATION
-- =============================================

CREATE TABLE public.foundation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15,2),
  status project_status DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  contact_info TEXT,
  address TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  amount DECIMAL(15,2) NOT NULL,
  donation_date DATE NOT NULL,
  project_id UUID REFERENCES public.foundation_projects(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  skills TEXT,
  availability TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.foundation_projects(id) ON DELETE CASCADE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 9: RITHISH FARMS
-- =============================================

CREATE TABLE public.farm_plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  area_hectares DECIMAL(10,2) NOT NULL,
  location TEXT,
  soil_type TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  variety TEXT,
  planting_season TEXT,
  harvest_season TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.livestock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_type TEXT NOT NULL,
  tag_number TEXT UNIQUE NOT NULL,
  breed TEXT,
  date_of_birth DATE,
  status status_type DEFAULT 'active',
  plot_id UUID REFERENCES public.farm_plots(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES public.farm_plots(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) NOT NULL,
  harvest_date DATE NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit TEXT NOT NULL,
  quality_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.farm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES public.farm_plots(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_date DATE NOT NULL,
  description TEXT,
  cost DECIMAL(15,2),
  performed_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.farm_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  purchase_date DATE,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 10: RIYA CONSULTANCY
-- =============================================

CREATE TABLE public.consultancy_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  industry TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.consultancy_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.consultancy_clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15,2),
  status project_status DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  description TEXT,
  hourly_rate DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.consultancy_clients(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.consultancy_projects(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_value DECIMAL(15,2) NOT NULL,
  terms TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.consultancy_projects(id) ON DELETE CASCADE NOT NULL,
  work_date DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL,
  description TEXT,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.consultancy_projects(id) ON DELETE CASCADE NOT NULL,
  deliverable_name TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status status_type DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 11: ROSHAN TRADERS
-- =============================================

CREATE TABLE public.trading_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  customer_type TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.trading_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  cost_price DECIMAL(15,2),
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.trading_customers(id) ON DELETE CASCADE NOT NULL,
  order_date DATE NOT NULL,
  delivery_date DATE,
  total_amount DECIMAL(15,2) NOT NULL,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.trading_products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE NOT NULL,
  shipment_date DATE NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  delivery_address TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.retail_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  address TEXT,
  manager_id UUID REFERENCES public.employees(id),
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 12: RORIRI AUTOMATION
-- =============================================

CREATE TABLE public.production_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  capacity_per_hour INTEGER,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  production_line_id UUID REFERENCES public.production_lines(id) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  start_date DATE NOT NULL,
  completion_date DATE,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock_quantity DECIMAL(15,2) DEFAULT 0,
  reorder_level DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE NOT NULL,
  check_date DATE NOT NULL,
  inspector_id UUID REFERENCES public.employees(id),
  pass_fail TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  production_line_id UUID REFERENCES public.production_lines(id),
  purchase_date DATE,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 13: RORIRI IT COMPANY
-- =============================================

CREATE TABLE public.it_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.it_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.it_clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  technology_stack TEXT,
  start_date DATE NOT NULL,
  deadline DATE,
  status project_status DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.it_projects(id) ON DELETE CASCADE NOT NULL,
  sprint_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goals TEXT,
  status status_type DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.it_projects(id) ON DELETE CASCADE NOT NULL,
  sprint_id UUID REFERENCES public.sprints(id),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.employees(id),
  priority TEXT,
  status TEXT DEFAULT 'todo',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.it_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.employees(id),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.it_projects(id) ON DELETE CASCADE NOT NULL,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 14: COMMUNICATION & COLLABORATION
-- =============================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT,
  published_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 15: ANALYTICS & REPORTING
-- =============================================

CREATE TABLE public.kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  description TEXT,
  unit TEXT,
  target_value DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES public.kpi_definitions(id) ON DELETE CASCADE NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  parameters JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  widget_type TEXT NOT NULL,
  configuration JSONB,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 16: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultancy_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultancy_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retail_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PHASE 17: SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has access to entity
CREATE OR REPLACE FUNCTION public.has_entity_access(_user_id UUID, _entity_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND (entity_id = _entity_id OR role = 'admin')
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- =============================================
-- PHASE 18: RLS POLICIES
-- =============================================

-- Entities policies (everyone can view, only admins can modify)
CREATE POLICY "Anyone can view entities"
  ON public.entities FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert entities"
  ON public.entities FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update entities"
  ON public.entities FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Generic entity-based access policy template
-- Users can access data from entities they have access to

CREATE POLICY "Entity access for departments"
  ON public.departments FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for positions"
  ON public.positions FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for employees"
  ON public.employees FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for attendance"
  ON public.attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = attendance.employee_id
      AND public.has_entity_access(auth.uid(), employees.entity_id)
    )
  );

CREATE POLICY "Entity access for payroll"
  ON public.payroll FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = payroll.employee_id
      AND public.has_entity_access(auth.uid(), employees.entity_id)
    )
  );

CREATE POLICY "Entity access for accounts"
  ON public.accounts FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for transactions"
  ON public.transactions FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for invoices"
  ON public.invoices FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for expenses"
  ON public.expenses FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for budgets"
  ON public.budgets FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for assets"
  ON public.assets FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for asset_maintenance"
  ON public.asset_maintenance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE assets.id = asset_maintenance.asset_id
      AND public.has_entity_access(auth.uid(), assets.entity_id)
    )
  );

CREATE POLICY "Entity access for asset_assignments"
  ON public.asset_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE assets.id = asset_assignments.asset_id
      AND public.has_entity_access(auth.uid(), assets.entity_id)
    )
  );

CREATE POLICY "Entity access for suppliers"
  ON public.suppliers FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for inventory_locations"
  ON public.inventory_locations FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for inventory_items"
  ON public.inventory_items FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Entity access for stock_movements"
  ON public.stock_movements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items
      WHERE inventory_items.id = stock_movements.item_id
      AND public.has_entity_access(auth.uid(), inventory_items.entity_id)
    )
  );

CREATE POLICY "Entity access for purchase_orders"
  ON public.purchase_orders FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

-- Academy policies (all authenticated users can view, entity users can modify)
CREATE POLICY "Authenticated users can view students"
  ON public.students FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage students"
  ON public.students FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'academy')));

CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage courses"
  ON public.courses FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'academy')));

CREATE POLICY "Authenticated users can view classes"
  ON public.classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage classes"
  ON public.classes FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'academy')));

CREATE POLICY "Authenticated users can view enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage enrollments"
  ON public.enrollments FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'academy')));

CREATE POLICY "Authenticated users can view grades"
  ON public.grades FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage grades"
  ON public.grades FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'academy')));

CREATE POLICY "Authenticated users can view sports_teams"
  ON public.sports_teams FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage sports_teams"
  ON public.sports_teams FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'academy')));

CREATE POLICY "Authenticated users can view sports_events"
  ON public.sports_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage sports_events"
  ON public.sports_events FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'academy')));

-- Foundation policies
CREATE POLICY "Authenticated users can view foundation_projects"
  ON public.foundation_projects FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage foundation_projects"
  ON public.foundation_projects FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

CREATE POLICY "Authenticated users can view beneficiaries"
  ON public.beneficiaries FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage beneficiaries"
  ON public.beneficiaries FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

CREATE POLICY "Authenticated users can view donations"
  ON public.donations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage donations"
  ON public.donations FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

CREATE POLICY "Authenticated users can view volunteers"
  ON public.volunteers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage volunteers"
  ON public.volunteers FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

CREATE POLICY "Authenticated users can view impact_metrics"
  ON public.impact_metrics FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage impact_metrics"
  ON public.impact_metrics FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Farm policies
CREATE POLICY "Entity users can access farm_plots"
  ON public.farm_plots FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'farm')));

CREATE POLICY "Entity users can access crops"
  ON public.crops FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'farm')));

CREATE POLICY "Entity users can access livestock"
  ON public.livestock FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'farm')));

CREATE POLICY "Entity users can access harvests"
  ON public.harvests FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'farm')));

CREATE POLICY "Entity users can access farm_activities"
  ON public.farm_activities FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'farm')));

CREATE POLICY "Entity users can access farm_equipment"
  ON public.farm_equipment FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'farm')));

-- Consultancy policies
CREATE POLICY "Entity users can access consultancy_clients"
  ON public.consultancy_clients FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'consultancy')));

CREATE POLICY "Entity users can access consultancy_projects"
  ON public.consultancy_projects FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'consultancy')));

CREATE POLICY "Entity users can access services"
  ON public.services FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'consultancy')));

CREATE POLICY "Entity users can access contracts"
  ON public.contracts FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'consultancy')));

CREATE POLICY "Entity users can access timesheets"
  ON public.timesheets FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'consultancy')));

CREATE POLICY "Entity users can access deliverables"
  ON public.deliverables FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'consultancy')));

-- Trading policies
CREATE POLICY "Entity users can access trading_customers"
  ON public.trading_customers FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'trading')));

CREATE POLICY "Entity users can access trading_products"
  ON public.trading_products FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'trading')));

CREATE POLICY "Entity users can access sales_orders"
  ON public.sales_orders FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'trading')));

CREATE POLICY "Entity users can access order_items"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_orders
      WHERE sales_orders.id = order_items.order_id
      AND public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'trading'))
    )
  );

CREATE POLICY "Entity users can access shipments"
  ON public.shipments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_orders
      WHERE sales_orders.id = shipments.order_id
      AND public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'trading'))
    )
  );

CREATE POLICY "Entity users can access retail_locations"
  ON public.retail_locations FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'trading')));

-- Automation policies
CREATE POLICY "Entity users can access production_lines"
  ON public.production_lines FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'automation')));

CREATE POLICY "Entity users can access production_orders"
  ON public.production_orders FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'automation')));

CREATE POLICY "Entity users can access raw_materials"
  ON public.raw_materials FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'automation')));

CREATE POLICY "Entity users can access quality_checks"
  ON public.quality_checks FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'automation')));

CREATE POLICY "Entity users can access machines"
  ON public.machines FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'automation')));

CREATE POLICY "Entity users can access maintenance_schedules"
  ON public.maintenance_schedules FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'automation')));

-- IT Company policies
CREATE POLICY "Entity users can access it_clients"
  ON public.it_clients FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'it_company')));

CREATE POLICY "Entity users can access it_projects"
  ON public.it_projects FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'it_company')));

CREATE POLICY "Entity users can access sprints"
  ON public.sprints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.it_projects
      WHERE it_projects.id = sprints.project_id
      AND public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'it_company'))
    )
  );

CREATE POLICY "Entity users can access tasks"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.it_projects
      WHERE it_projects.id = tasks.project_id
      AND public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'it_company'))
    )
  );

CREATE POLICY "Entity users can access bugs"
  ON public.bugs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.it_projects
      WHERE it_projects.id = bugs.project_id
      AND public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'it_company'))
    )
  );

CREATE POLICY "Entity users can access repositories"
  ON public.repositories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.it_projects
      WHERE it_projects.id = repositories.project_id
      AND public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'it_company'))
    )
  );

-- Communication policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view sent messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can view announcements"
  ON public.announcements FOR SELECT
  USING (
    entity_id IS NULL 
    OR public.has_entity_access(auth.uid(), entity_id)
  );

CREATE POLICY "Managers can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Entity users can access documents"
  ON public.documents FOR ALL
  USING (public.has_entity_access(auth.uid(), entity_id));

CREATE POLICY "Anyone can view activity_logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert activity_logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- Analytics policies
CREATE POLICY "Users can view kpi_definitions"
  ON public.kpi_definitions FOR SELECT
  USING (
    entity_id IS NULL 
    OR public.has_entity_access(auth.uid(), entity_id)
  );

CREATE POLICY "Managers can manage kpi_definitions"
  ON public.kpi_definitions FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Users can view kpi_values"
  ON public.kpi_values FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert kpi_values"
  ON public.kpi_values FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view reports"
  ON public.reports FOR SELECT
  USING (
    entity_id IS NULL 
    OR public.has_entity_access(auth.uid(), entity_id)
  );

CREATE POLICY "Users can manage their own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own dashboard_widgets"
  ON public.dashboard_widgets FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- PHASE 19: TRIGGERS & FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_foundation_projects_updated_at BEFORE UPDATE ON public.foundation_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PHASE 20: SEED DATA
-- =============================================

-- Insert the 7 entities
INSERT INTO public.entities (name, code, description, color, icon, status) VALUES
  ('RORIRI Academy', 'academy', 'Educational institution for academics and sports', '#3B82F6', 'GraduationCap', 'active'),
  ('RORIRI Foundation', 'foundation', 'Social welfare and community development', '#10B981', 'Heart', 'active'),
  ('Rithish Farms', 'farm', 'Agricultural and livestock management', '#84CC16', 'Sprout', 'active'),
  ('RIYA Consultancy', 'consultancy', 'Business consulting and advisory services', '#8B5CF6', 'Briefcase', 'active'),
  ('ROSHAN Traders', 'trading', 'Trading and retail operations', '#F59E0B', 'ShoppingCart', 'active'),
  ('RORIRI Automation', 'automation', 'Manufacturing and industrial automation', '#EF4444', 'Factory', 'active'),
  ('RORIRI IT Company', 'it_company', 'Software development and IT services', '#06B6D4', 'Code', 'active');

-- =============================================
-- PHASE 21: STORAGE BUCKETS
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('entity-files', 'entity-files', false),
  ('product-images', 'product-images', true);

-- Storage policies for avatars (public)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for documents (private)
CREATE POLICY "Users can view documents from their entities"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid() IS NOT NULL
  );

-- Storage policies for entity-files (private)
CREATE POLICY "Users can view entity files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'entity-files' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can upload entity files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'entity-files' 
    AND auth.uid() IS NOT NULL
  );

-- Storage policies for product-images (public)
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Staff can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.uid() IS NOT NULL
  );

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_entity_id ON public.user_roles(entity_id);
CREATE INDEX idx_employees_entity_id ON public.employees(entity_id);
CREATE INDEX idx_transactions_entity_id ON public.transactions(entity_id);
CREATE INDEX idx_invoices_entity_id ON public.invoices(entity_id);
CREATE INDEX idx_assets_entity_id ON public.assets(entity_id);
CREATE INDEX idx_inventory_items_entity_id ON public.inventory_items(entity_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_id ON public.activity_logs(entity_id);