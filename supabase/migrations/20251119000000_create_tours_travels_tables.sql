-- Create tours & travels tables for Rithish Tours & Travels module

-- Tour Packages table
CREATE TABLE IF NOT EXISTS tours_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_code TEXT NOT NULL UNIQUE,
  package_name TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  duration_nights INTEGER NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  max_participants INTEGER,
  inclusions TEXT[],
  exclusions TEXT[],
  itinerary TEXT,
  terms_conditions TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS tours_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  id_proof_type TEXT,
  id_proof_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries/Leads table
CREATE TABLE IF NOT EXISTS tours_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  destination TEXT,
  travel_date DATE,
  duration_days INTEGER,
  no_of_adults INTEGER DEFAULT 1,
  no_of_children INTEGER DEFAULT 0,
  budget_range TEXT,
  requirements TEXT,
  lead_source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'confirmed', 'cancelled')),
  assigned_to UUID,
  follow_up_date DATE,
  remarks TEXT,
  converted_booking_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS tours_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES tours_customers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES tours_packages(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES tours_enquiries(id),
  booking_date DATE DEFAULT CURRENT_DATE,
  travel_date DATE NOT NULL,
  return_date DATE,
  no_of_adults INTEGER DEFAULT 1,
  no_of_children INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  advance_amount DECIMAL(10,2) DEFAULT 0,
  balance_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  assigned_agent UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip Management table
CREATE TABLE IF NOT EXISTS tours_trip_management (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES tours_bookings(id) ON DELETE CASCADE,
  trip_status TEXT DEFAULT 'planned' CHECK (trip_status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  departure_date DATE,
  return_date DATE,
  assigned_driver_id UUID,
  assigned_vehicle_id UUID,
  pickup_location TEXT,
  pickup_time TIME,
  drop_location TEXT,
  actual_departure_time TIME,
  actual_return_time TIME,
  trip_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle Management table
CREATE TABLE IF NOT EXISTS tours_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_code TEXT NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bus', 'van', 'tempo')),
  vehicle_model TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  seating_capacity INTEGER NOT NULL,
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'cng', 'electric')),
  ac_available BOOLEAN DEFAULT false,
  vehicle_condition TEXT DEFAULT 'good' CHECK (vehicle_condition IN ('excellent', 'good', 'fair', 'poor')),
  insurance_expiry DATE,
  permit_expiry DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver Management table
CREATE TABLE IF NOT EXISTS tours_drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  address TEXT,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  date_of_birth DATE,
  experience_years INTEGER,
  languages_known TEXT[],
  rating DECIMAL(3,2) DEFAULT 5.0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotations table
CREATE TABLE IF NOT EXISTS tours_quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_code TEXT NOT NULL UNIQUE,
  enquiry_id UUID REFERENCES tours_enquiries(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES tours_customers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES tours_packages(id),
  quotation_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  no_of_adults INTEGER DEFAULT 1,
  no_of_children INTEGER DEFAULT 0,
  base_amount DECIMAL(10,2),
  taxes DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  terms_conditions TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS tours_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES tours_bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES tours_customers(id) ON DELETE CASCADE,
  payment_date DATE DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online', 'cheque', 'card')),
  transaction_id TEXT,
  payment_for TEXT CHECK (payment_for IN ('advance', 'full', 'balance', 'refund')),
  received_by UUID,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS tours_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date DATE DEFAULT CURRENT_DATE,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('fuel', 'maintenance', 'food', 'accommodation', 'guide', 'toll', 'parking', 'misc')),
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  booking_id UUID REFERENCES tours_bookings(id),
  vehicle_id UUID REFERENCES tours_vehicles(id),
  paid_by UUID,
  approved_by UUID,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS tours_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT CHECK (document_type IN ('customer_id', 'booking_voucher', 'invoice', 'receipt', 'insurance', 'permit', 'license')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  related_id UUID, -- Can reference any related record
  related_type TEXT, -- 'booking', 'customer', 'vehicle', 'driver', etc.
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_packages_status ON tours_packages(status);
CREATE INDEX IF NOT EXISTS idx_tours_packages_destination ON tours_packages(destination);
CREATE INDEX IF NOT EXISTS idx_tours_customers_status ON tours_customers(status);
CREATE INDEX IF NOT EXISTS idx_tours_customers_phone ON tours_customers(phone);
CREATE INDEX IF NOT EXISTS idx_tours_enquiries_status ON tours_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_tours_enquiries_phone ON tours_enquiries(phone);
CREATE INDEX IF NOT EXISTS idx_tours_bookings_customer_id ON tours_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_tours_bookings_status ON tours_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_tours_bookings_travel_date ON tours_bookings(travel_date);
CREATE INDEX IF NOT EXISTS idx_tours_trip_management_booking_id ON tours_trip_management(booking_id);
CREATE INDEX IF NOT EXISTS idx_tours_trip_management_status ON tours_trip_management(trip_status);
CREATE INDEX IF NOT EXISTS idx_tours_vehicles_status ON tours_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_tours_vehicles_type ON tours_vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_tours_drivers_status ON tours_drivers(status);
CREATE INDEX IF NOT EXISTS idx_tours_drivers_phone ON tours_drivers(phone);
CREATE INDEX IF NOT EXISTS idx_tours_quotations_status ON tours_quotations(status);
CREATE INDEX IF NOT EXISTS idx_tours_quotations_customer_id ON tours_quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_tours_payments_booking_id ON tours_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_tours_payments_date ON tours_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_tours_expenses_type ON tours_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_tours_expenses_date ON tours_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_tours_documents_type ON tours_documents(document_type);

-- Enable RLS (Row Level Security)
ALTER TABLE tours_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_trip_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for authenticated users)
CREATE POLICY "Allow authenticated users to manage tours_packages" ON tours_packages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_customers" ON tours_customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_enquiries" ON tours_enquiries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_bookings" ON tours_bookings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_trip_management" ON tours_trip_management
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_vehicles" ON tours_vehicles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_drivers" ON tours_drivers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_quotations" ON tours_quotations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_payments" ON tours_payments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_expenses" ON tours_expenses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tours_documents" ON tours_documents
  FOR ALL USING (auth.role() = 'authenticated');
