-- Alter meeting_details hours column to text to allow flexible time formats
ALTER TABLE meeting_details 
ALTER COLUMN hours TYPE text USING hours::text;