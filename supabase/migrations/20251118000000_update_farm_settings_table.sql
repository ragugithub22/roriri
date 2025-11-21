-- Update farm_settings table to match the FarmSettings interface

-- Drop existing farm_settings table if it exists
DROP TABLE IF EXISTS farm_settings CASCADE;

-- Create new farm_settings table with proper structure
CREATE TABLE IF NOT EXISTS farm_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_name VARCHAR(255) DEFAULT 'Roriri Farm',
  farm_description TEXT DEFAULT 'A beautiful farm experience with animals, games, and delicious food.',
  contact_email VARCHAR(255) DEFAULT 'info@roririfarm.com',
  contact_phone VARCHAR(20) DEFAULT '+91-9876543210',
  address TEXT DEFAULT '123 Farm Road, Rural Area, State - 123456',
  operating_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "18:00", "closed": false},
    "sunday": {"open": "09:00", "close": "18:00", "closed": false}
  }',
  pricing JSONB DEFAULT '{
    "adult_ticket": 500,
    "child_ticket": 300,
    "senior_ticket": 400,
    "group_discount": 10
  }',
  notifications JSONB DEFAULT '{
    "email_notifications": true,
    "sms_notifications": false,
    "booking_confirmations": true,
    "payment_reminders": true,
    "maintenance_alerts": true
  }',
  features JSONB DEFAULT '{
    "online_booking": true,
    "food_orders": true,
    "events": true,
    "games": true
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO farm_settings DEFAULT VALUES;

-- Enable RLS
ALTER TABLE farm_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow authenticated users to manage farm_settings" ON farm_settings FOR ALL TO authenticated USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_farm_settings_updated_at BEFORE UPDATE ON farm_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
