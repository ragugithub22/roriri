-- Insert IT Academy entity
INSERT INTO entities (code, name, icon, color, description, status)
VALUES (
  'it_academy',
  'RORIRI IT Academy',
  'Code2',
  'from-blue-500 to-indigo-600',
  'Specialized IT training and certification programs',
  'active'
)
ON CONFLICT (code) DO NOTHING;

-- Add entity_id to courses table to distinguish IT Academy courses from regular Academy courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS entity_id uuid REFERENCES entities(id);

-- Create IT trainers table for both internal and external trainers
CREATE TABLE IF NOT EXISTS it_trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text,
  phone text,
  specialization text NOT NULL,
  is_external boolean DEFAULT false,
  employee_id uuid REFERENCES employees(id),
  hourly_rate numeric,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on it_trainers
ALTER TABLE it_trainers ENABLE ROW LEVEL SECURITY;

-- Create policy for it_trainers
CREATE POLICY "Entity users can access it_trainers"
ON it_trainers
FOR ALL
USING (
  has_entity_access(auth.uid(), (
    SELECT id FROM entities WHERE code = 'it_academy'
  ))
);

-- Add IT-specific fields to courses for IT Academy
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS course_level text,
ADD COLUMN IF NOT EXISTS prerequisites text[],
ADD COLUMN IF NOT EXISTS certification_available boolean DEFAULT false;

-- Create trigger for it_trainers updated_at
CREATE TRIGGER update_it_trainers_updated_at
  BEFORE UPDATE ON it_trainers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample IT courses
DO $$
DECLARE
  v_entity_id uuid;
BEGIN
  SELECT id INTO v_entity_id FROM entities WHERE code = 'it_academy';
  
  IF v_entity_id IS NOT NULL THEN
    INSERT INTO courses (course_code, name, description, duration_weeks, fees, status, entity_id, course_level, certification_available)
    VALUES 
      ('IT-HTML', 'HTML5 Fundamentals', 'Complete guide to HTML5 and semantic markup', 4, 5000, 'active', v_entity_id, 'Beginner', true),
      ('IT-CSS', 'CSS3 & Responsive Design', 'Master CSS3, Flexbox, Grid, and responsive design', 6, 7000, 'active', v_entity_id, 'Beginner', true),
      ('IT-JS', 'JavaScript Programming', 'Modern JavaScript, ES6+, DOM manipulation', 8, 12000, 'active', v_entity_id, 'Intermediate', true),
      ('IT-MYSQL', 'MySQL Database', 'Database design, SQL queries, optimization', 6, 10000, 'active', v_entity_id, 'Intermediate', true),
      ('IT-PHP', 'PHP Development', 'Server-side programming with PHP and MySQL', 8, 15000, 'active', v_entity_id, 'Intermediate', true),
      ('IT-TERMS', 'IT Terminology & Concepts', 'Essential IT terms, concepts, and industry standards', 2, 3000, 'active', v_entity_id, 'Beginner', false),
      ('IT-SDLC', 'Software Development Life Cycle', 'Complete SDLC, Agile, Scrum methodologies', 4, 8000, 'active', v_entity_id, 'Advanced', true)
    ON CONFLICT (course_code) DO NOTHING;
  END IF;
END $$;