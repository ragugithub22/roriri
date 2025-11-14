-- Add additional_entity_id to employees table
ALTER TABLE employees
ADD COLUMN additional_entity_id uuid REFERENCES entities(id);