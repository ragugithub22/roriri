-- Create farm tables for Rithish Farms module

-- Farm Events Table
CREATE TABLE IF NOT EXISTS farm_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  capacity INTEGER,
  ticket_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Games/Activities Table
CREATE TABLE IF NOT EXISTS farm_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price DECIMAL(10,2) NOT NULL,
  capacity INTEGER,
  age_limit INTEGER,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Food Items Table
CREATE TABLE IF NOT EXISTS farm_food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  veg_non_veg VARCHAR(10) CHECK (veg_non_veg IN ('veg', 'non-veg')),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Visitors Table
CREATE TABLE IF NOT EXISTS farm_visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  visitor_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  adults_count INTEGER DEFAULT 0,
  kids_count INTEGER DEFAULT 0,
  entry_type VARCHAR(50) DEFAULT 'single' CHECK (entry_type IN ('single', 'family', 'package')),
  event_id UUID REFERENCES farm_events(id),
  ticket_price DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Tickets & Pricing Table
CREATE TABLE IF NOT EXISTS farm_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_type VARCHAR(100) NOT NULL,
  adult_price DECIMAL(10,2),
  kid_price DECIMAL(10,2),
  description TEXT,
  valid_from DATE,
  valid_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Bookings Table
CREATE TABLE IF NOT EXISTS farm_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  contact VARCHAR(15) NOT NULL,
  event_date DATE NOT NULL,
  adults_count INTEGER DEFAULT 0,
  kids_count INTEGER DEFAULT 0,
  event_id UUID REFERENCES farm_events(id),
  advance_payment DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'cancelled')),
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Food Orders Table
CREATE TABLE IF NOT EXISTS farm_food_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code VARCHAR(50) UNIQUE NOT NULL,
  visitor_id UUID REFERENCES farm_visitors(id),
  visitor_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL, -- Array of {item_id, quantity, price}
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  order_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Payments Table
CREATE TABLE IF NOT EXISTS farm_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_code VARCHAR(50) UNIQUE NOT NULL,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('entry_ticket', 'game', 'food', 'booking', 'expense')),
  reference_id UUID NOT NULL, -- ID from respective table
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'online')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Expenses Table
CREATE TABLE IF NOT EXISTS farm_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  paid_by VARCHAR(255),
  bill_copy_url TEXT,
  status VARCHAR(50) DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Announcements Table
CREATE TABLE IF NOT EXISTS farm_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_to TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Settings Table
CREATE TABLE IF NOT EXISTS farm_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction Tables for Event-Game and Event-Food associations
CREATE TABLE IF NOT EXISTS farm_event_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES farm_events(id) ON DELETE CASCADE,
  game_id UUID REFERENCES farm_games(id) ON DELETE CASCADE,
  available_slots INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, game_id)
);

CREATE TABLE IF NOT EXISTS farm_event_food (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES farm_events(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES farm_food_items(id) ON DELETE CASCADE,
  available_quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, food_item_id)
);

-- Insert default settings
INSERT INTO farm_settings (setting_key, setting_value, setting_type, description) VALUES
('default_adult_ticket_price', '100.00', 'decimal', 'Default adult entry ticket price'),
('default_kid_ticket_price', '50.00', 'decimal', 'Default kid entry ticket price'),
('farm_opening_time', '09:00', 'time', 'Farm opening time'),
('farm_closing_time', '18:00', 'time', 'Farm closing time'),
('max_daily_visitors', '500', 'integer', 'Maximum daily visitor capacity'),
('contact_number', '+91-9876543210', 'string', 'Farm contact number'),
('email', 'info@rithishfarms.com', 'string', 'Farm email address')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default ticket types
INSERT INTO farm_tickets (ticket_type, adult_price, kid_price, description, is_active) VALUES
('Regular Entry', 100.00, 50.00, 'Standard entry ticket', true),
('Weekend Entry', 150.00, 75.00, 'Weekend entry ticket with premium pricing', true),
('Family Package', 300.00, 150.00, 'Family package for 2 adults and 2 kids', true),
('VIP Package', 500.00, 250.00, 'VIP package with priority entry and exclusive areas', true)
ON CONFLICT DO NOTHING;

-- Insert default games
INSERT INTO farm_games (game_code, name, description, duration_minutes, price, capacity, age_limit, category, status) VALUES
('BC001', 'Bullock Cart Ride', 'Traditional bullock cart ride around the farm', 15, 50.00, 4, 5, 'Transport', 'active'),
('HR001', 'Horse Riding', 'Guided horse riding experience', 30, 200.00, 1, 8, 'Riding', 'active'),
('AR001', 'Archery', 'Learn basic archery skills', 20, 100.00, 6, 10, 'Sports', 'active'),
('BS001', 'Balloon Shooting', 'Balloon shooting game', 10, 30.00, 10, 6, 'Games', 'active'),
('TR001', 'Trampoline', 'Jumping on trampoline', 15, 40.00, 8, 5, 'Sports', 'active'),
('PZ001', 'Petting Zoo', 'Interact with farm animals', 20, 60.00, 20, 3, 'Animal', 'active'),
('TT001', 'Tractor Ride', 'Ride on farm tractor', 10, 80.00, 12, 4, 'Transport', 'active'),
('RG001', 'Rope Games', 'Various rope climbing and swinging games', 25, 70.00, 6, 7, 'Adventure', 'active')
ON CONFLICT (game_code) DO NOTHING;

-- Insert default food items
INSERT INTO farm_food_items (item_code, name, category, veg_non_veg, price, description, available, status) VALUES
('FJ001', 'Fresh Orange Juice', 'Beverages', 'veg', 40.00, 'Freshly squeezed orange juice', true, 'active'),
('FJ002', 'Fresh Apple Juice', 'Beverages', 'veg', 45.00, 'Fresh apple juice', true, 'active'),
('FJ003', 'Fresh Pineapple Juice', 'Beverages', 'veg', 50.00, 'Fresh pineapple juice', true, 'active'),
('FJ004', 'Fresh Watermelon Juice', 'Beverages', 'veg', 35.00, 'Fresh watermelon juice', true, 'active'),
('FJ005', 'Fresh Mixed Fruit Juice', 'Beverages', 'veg', 60.00, 'Mixed seasonal fruits juice', true, 'active'),
('FJ006', 'Lassi', 'Beverages', 'veg', 30.00, 'Traditional yogurt drink', true, 'active'),
('FJ007', 'Buttermilk', 'Beverages', 'veg', 20.00, 'Spiced buttermilk', true, 'active'),
('FJ008', 'Coffee', 'Beverages', 'veg', 25.00, 'South Indian filter coffee', true, 'active'),
('FJ009', 'Tea', 'Beverages', 'veg', 15.00, 'Indian masala tea', true, 'active'),
('FJ010', 'Ice Cream', 'Desserts', 'veg', 50.00, 'Vanilla ice cream', true, 'active'),
('FJ011', 'Kulfi', 'Desserts', 'veg', 40.00, 'Traditional Indian ice cream', true, 'active'),
('FJ012', 'Fresh Fruits Platter', 'Snacks', 'veg', 80.00, 'Seasonal fresh fruits', true, 'active'),
('FJ013', 'Popcorn', 'Snacks', 'veg', 30.00, 'Buttered popcorn', true, 'active'),
('FJ014', 'Peanuts', 'Snacks', 'veg', 25.00, 'Roasted peanuts', true, 'active'),
('FJ015', 'Banana Chips', 'Snacks', 'veg', 35.00, 'Crispy banana chips', true, 'active'),
('FJ016', 'Veg Puff', 'Snacks', 'veg', 25.00, 'Vegetable puff pastry', true, 'active'),
('FJ017', 'Chicken Puff', 'Snacks', 'non-veg', 40.00, 'Chicken puff pastry', true, 'active'),
('FJ018', 'Egg Puff', 'Snacks', 'non-veg', 30.00, 'Egg puff pastry', true, 'active'),
('FJ019', 'Veg Meals', 'Meals', 'veg', 120.00, 'South Indian vegetarian thali', true, 'active'),
('FJ020', 'Non-Veg Meals', 'Meals', 'non-veg', 150.00, 'Chicken/mutton thali', true, 'active')
ON CONFLICT (item_code) DO NOTHING;

-- Enable RLS
ALTER TABLE farm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_event_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_event_food ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users - adjust as needed)
CREATE POLICY "Allow authenticated users to manage farm_events" ON farm_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_games" ON farm_games FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_food_items" ON farm_food_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_visitors" ON farm_visitors FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_tickets" ON farm_tickets FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_bookings" ON farm_bookings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_food_orders" ON farm_food_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_payments" ON farm_payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_expenses" ON farm_expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_announcements" ON farm_announcements FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_settings" ON farm_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_event_games" ON farm_event_games FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage farm_event_food" ON farm_event_food FOR ALL TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farm_events_date ON farm_events(event_date);
CREATE INDEX IF NOT EXISTS idx_farm_events_status ON farm_events(status);
CREATE INDEX IF NOT EXISTS idx_farm_visitors_entry_time ON farm_visitors(entry_time);
CREATE INDEX IF NOT EXISTS idx_farm_visitors_mobile ON farm_visitors(mobile);
CREATE INDEX IF NOT EXISTS idx_farm_bookings_event_date ON farm_bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_farm_payments_date ON farm_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_farm_expenses_date ON farm_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_farm_food_orders_time ON farm_food_orders(order_time);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_farm_events_updated_at BEFORE UPDATE ON farm_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_games_updated_at BEFORE UPDATE ON farm_games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_food_items_updated_at BEFORE UPDATE ON farm_food_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_bookings_updated_at BEFORE UPDATE ON farm_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_announcements_updated_at BEFORE UPDATE ON farm_announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_settings_updated_at BEFORE UPDATE ON farm_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
