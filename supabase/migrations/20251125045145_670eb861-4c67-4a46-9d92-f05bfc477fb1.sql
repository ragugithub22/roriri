-- Create hostel_payments table
CREATE TABLE IF NOT EXISTS public.hostel_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL,
  resident_type TEXT NOT NULL CHECK (resident_type IN ('employee', 'trainee')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC NOT NULL,
  received_amount NUMERIC NOT NULL,
  pending_amount NUMERIC NOT NULL,
  received_by TEXT,
  payment_mode TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hostel_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view hostel payments
CREATE POLICY "Authenticated users can view hostel payments"
ON public.hostel_payments
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create policy for authenticated users to manage hostel payments
CREATE POLICY "Authenticated users can manage hostel payments"
ON public.hostel_payments
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_hostel_payments_resident ON public.hostel_payments(resident_id, resident_type);

-- Create trigger for updated_at
CREATE TRIGGER update_hostel_payments_updated_at
BEFORE UPDATE ON public.hostel_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();