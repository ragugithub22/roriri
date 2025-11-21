-- =============================================
-- RORIRI Foundation - Additional Tables Migration
-- =============================================

-- =============================================
-- PHASE 1: FOUNDATION EVENTS & PROGRAMS
-- =============================================

CREATE TABLE public.foundation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'program', 'event', 'workshop', etc.
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15,2),
  status project_status DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.event_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.foundation_events(id) ON DELETE CASCADE NOT NULL,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE NOT NULL,
  participation_status TEXT DEFAULT 'registered', -- 'registered', 'attended', 'absent'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, beneficiary_id)
);

CREATE TABLE public.event_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.foundation_events(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE NOT NULL,
  role TEXT, -- 'organizer', 'helper', 'coordinator', etc.
  assigned_tasks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, volunteer_id)
);

CREATE TABLE public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.foundation_events(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 2: DONORS & SPONSORS
-- =============================================

CREATE TABLE public.foundation_donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  pan_number TEXT,
  address TEXT,
  donor_type TEXT DEFAULT 'individual', -- 'individual', 'corporate', 'foundation'
  status status_type DEFAULT 'active',
  total_donations DECIMAL(15,2) DEFAULT 0,
  last_donation_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update donations table to reference donors
ALTER TABLE public.donations ADD COLUMN donor_id UUID REFERENCES public.foundation_donors(id);
ALTER TABLE public.donations ADD COLUMN payment_mode TEXT; -- 'cash', 'cheque', 'online', 'bank_transfer'
ALTER TABLE public.donations ADD COLUMN receipt_number TEXT;
ALTER TABLE public.donations ADD COLUMN payment_status payment_status DEFAULT 'pending';

-- =============================================
-- PHASE 3: EXPENSES (Update existing)
-- =============================================

ALTER TABLE public.expenses ADD COLUMN category TEXT NOT NULL DEFAULT 'general';
ALTER TABLE public.expenses ADD COLUMN bill_copy_url TEXT;
ALTER TABLE public.expenses ADD COLUMN approved_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.expenses ADD COLUMN approved_at TIMESTAMPTZ;

-- =============================================
-- PHASE 4: ANNOUNCEMENTS (Update existing)
-- =============================================

ALTER TABLE public.announcements ADD COLUMN priority TEXT DEFAULT 'normal'; -- 'low', 'normal', 'high', 'urgent'
ALTER TABLE public.announcements ADD COLUMN target_audience TEXT DEFAULT 'all'; -- 'all', 'beneficiaries', 'volunteers', 'donors'

-- =============================================
-- PHASE 5: CERTIFICATES & APPRECIATION LETTERS
-- =============================================

CREATE TABLE public.foundation_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  recipient_type TEXT NOT NULL, -- 'beneficiary', 'volunteer', 'donor'
  recipient_id UUID NOT NULL, -- References beneficiaries, volunteers, or donors
  certificate_type TEXT NOT NULL, -- 'appreciation', 'participation', 'achievement', 'donation'
  title TEXT NOT NULL,
  description TEXT,
  issue_date DATE NOT NULL,
  issued_by UUID REFERENCES public.profiles(id),
  template_used TEXT,
  certificate_url TEXT, -- Generated PDF URL
  status TEXT DEFAULT 'active', -- 'active', 'revoked'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 6: BENEFICIARY SUPPORT HISTORY
-- =============================================

CREATE TABLE public.beneficiary_support_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE NOT NULL,
  support_type TEXT NOT NULL, -- 'medical', 'education', 'financial', etc.
  support_date DATE NOT NULL,
  amount DECIMAL(15,2),
  description TEXT,
  provided_by UUID REFERENCES public.profiles(id),
  documents_url TEXT, -- Supporting documents
  status TEXT DEFAULT 'completed', -- 'planned', 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Update beneficiaries table
ALTER TABLE public.beneficiaries ADD COLUMN date_of_birth DATE;
ALTER TABLE public.beneficiaries ADD COLUMN gender TEXT;
ALTER TABLE public.beneficiaries ADD COLUMN category TEXT; -- 'medical', 'education', 'financial', etc.
ALTER TABLE public.beneficiaries ADD COLUMN help_type TEXT;
ALTER TABLE public.beneficiaries ADD COLUMN documents_url TEXT; -- Aadhar, medical reports, etc.
ALTER TABLE public.beneficiaries ADD COLUMN status status_type DEFAULT 'active';
ALTER TABLE public.beneficiaries ADD COLUMN date_added DATE DEFAULT CURRENT_DATE;

-- =============================================
-- PHASE 7: VOLUNTEER ACTIVITY HISTORY
-- =============================================

CREATE TABLE public.volunteer_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'event_participation', 'fundraising', 'administration', etc.
  activity_date DATE NOT NULL,
  hours_contributed DECIMAL(5,2),
  description TEXT,
  event_id UUID REFERENCES public.foundation_events(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Update volunteers table
ALTER TABLE public.volunteers ADD COLUMN date_of_birth DATE;
ALTER TABLE public.volunteers ADD COLUMN address TEXT;
ALTER TABLE public.volunteers ADD COLUMN experience_years INTEGER;
ALTER TABLE public.volunteers ADD COLUMN emergency_contact TEXT;
ALTER TABLE public.volunteers ADD COLUMN total_hours DECIMAL(8,2) DEFAULT 0;
ALTER TABLE public.volunteers ADD COLUMN last_activity_date DATE;

-- =============================================
-- PHASE 8: REPORTS & ANALYTICS
-- =============================================

CREATE TABLE public.foundation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- 'donation', 'expense', 'beneficiary', 'volunteer', 'event', 'impact'
  report_name TEXT NOT NULL,
  parameters JSONB,
  generated_by UUID REFERENCES public.profiles(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  report_data JSONB,
  file_url TEXT, -- PDF/Excel file URL
  status TEXT DEFAULT 'completed' -- 'processing', 'completed', 'failed'
);

-- =============================================
-- PHASE 9: SETTINGS & CONFIGURATION
-- =============================================

CREATE TABLE public.foundation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  category TEXT, -- 'general', 'categories', 'help_types', 'permissions'
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO public.foundation_settings (setting_key, setting_value, description, category) VALUES
  ('beneficiary_categories', '["medical", "education", "financial", "housing", "nutrition", "other"]'::jsonb, 'Available beneficiary categories', 'categories'),
  ('help_types', '["emergency", "ongoing", "one-time", "seasonal"]'::jsonb, 'Types of help provided', 'categories'),
  ('donation_payment_modes', '["cash", "cheque", "online", "bank_transfer", "card"]'::jsonb, 'Available payment modes for donations', 'general'),
  ('certificate_templates', '["appreciation", "participation", "achievement", "donation"]'::jsonb, 'Available certificate templates', 'general'),
  ('event_types', '["program", "workshop", "seminar", "fundraiser", "community_service", "training"]'::jsonb, 'Types of foundation events', 'categories');

-- =============================================
-- PHASE 10: ENABLE RLS
-- =============================================

ALTER TABLE public.foundation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiary_support_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PHASE 11: RLS POLICIES
-- =============================================

-- Foundation events policies
CREATE POLICY "Authenticated users can view foundation_events"
  ON public.foundation_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage foundation_events"
  ON public.foundation_events FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Event beneficiaries policies
CREATE POLICY "Authenticated users can view event_beneficiaries"
  ON public.event_beneficiaries FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage event_beneficiaries"
  ON public.event_beneficiaries FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Event volunteers policies
CREATE POLICY "Authenticated users can view event_volunteers"
  ON public.event_volunteers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage event_volunteers"
  ON public.event_volunteers FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Event photos policies
CREATE POLICY "Authenticated users can view event_photos"
  ON public.event_photos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage event_photos"
  ON public.event_photos FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Foundation donors policies
CREATE POLICY "Authenticated users can view foundation_donors"
  ON public.foundation_donors FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage foundation_donors"
  ON public.foundation_donors FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Foundation certificates policies
CREATE POLICY "Authenticated users can view foundation_certificates"
  ON public.foundation_certificates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage foundation_certificates"
  ON public.foundation_certificates FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Beneficiary support history policies
CREATE POLICY "Authenticated users can view beneficiary_support_history"
  ON public.beneficiary_support_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage beneficiary_support_history"
  ON public.beneficiary_support_history FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Volunteer activities policies
CREATE POLICY "Authenticated users can view volunteer_activities"
  ON public.volunteer_activities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage volunteer_activities"
  ON public.volunteer_activities FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Foundation reports policies
CREATE POLICY "Authenticated users can view foundation_reports"
  ON public.foundation_reports FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Entity users can manage foundation_reports"
  ON public.foundation_reports FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'foundation')));

-- Foundation settings policies (Super admin only)
CREATE POLICY "Authenticated users can view foundation_settings"
  ON public.foundation_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage foundation_settings"
  ON public.foundation_settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- =============================================
-- PHASE 12: TRIGGERS
-- =============================================

-- Update timestamps
CREATE TRIGGER update_foundation_events_updated_at BEFORE UPDATE ON public.foundation_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_foundation_donors_updated_at BEFORE UPDATE ON public.foundation_donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update donor totals when donations are added/modified
CREATE OR REPLACE FUNCTION update_donor_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.foundation_donors
    SET
      total_donations = COALESCE(total_donations, 0) + COALESCE(NEW.amount, 0),
      last_donation_date = GREATEST(last_donation_date, NEW.donation_date)
    WHERE id = NEW.donor_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Subtract old amount and add new amount
    UPDATE public.foundation_donors
    SET
      total_donations = COALESCE(total_donations, 0) - COALESCE(OLD.amount, 0) + COALESCE(NEW.amount, 0),
      last_donation_date = GREATEST(last_donation_date, NEW.donation_date)
    WHERE id = NEW.donor_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.foundation_donors
    SET total_donations = COALESCE(total_donations, 0) - COALESCE(OLD.amount, 0)
    WHERE id = OLD.donor_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donor_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION update_donor_totals();

-- Update volunteer hours when activities are added
CREATE OR REPLACE FUNCTION update_volunteer_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.volunteers
    SET
      total_hours = COALESCE(total_hours, 0) + COALESCE(NEW.hours_contributed, 0),
      last_activity_date = GREATEST(last_activity_date, NEW.activity_date)
    WHERE id = NEW.volunteer_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.volunteers
    SET
      total_hours = COALESCE(total_hours, 0) - COALESCE(OLD.hours_contributed, 0) + COALESCE(NEW.hours_contributed, 0),
      last_activity_date = GREATEST(last_activity_date, NEW.activity_date)
    WHERE id = NEW.volunteer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.volunteers
    SET total_hours = COALESCE(total_hours, 0) - COALESCE(OLD.hours_contributed, 0)
    WHERE id = OLD.volunteer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_volunteer_hours_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.volunteer_activities
  FOR EACH ROW EXECUTE FUNCTION update_volunteer_hours();

-- =============================================
-- PHASE 13: INDEXES
-- =============================================

CREATE INDEX idx_foundation_events_status ON public.foundation_events(status);
CREATE INDEX idx_foundation_events_start_date ON public.foundation_events(start_date);
CREATE INDEX idx_event_beneficiaries_event_id ON public.event_beneficiaries(event_id);
CREATE INDEX idx_event_beneficiaries_beneficiary_id ON public.event_beneficiaries(beneficiary_id);
CREATE INDEX idx_event_volunteers_event_id ON public.event_volunteers(event_id);
CREATE INDEX idx_event_volunteers_volunteer_id ON public.event_volunteers(volunteer_id);
CREATE INDEX idx_foundation_donors_status ON public.foundation_donors(status);
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_foundation_certificates_recipient_id ON public.foundation_certificates(recipient_id);
CREATE INDEX idx_beneficiary_support_history_beneficiary_id ON public.beneficiary_support_history(beneficiary_id);
CREATE INDEX idx_volunteer_activities_volunteer_id ON public.volunteer_activities(volunteer_id);
