-- Create triggers to automatically sync user_login table with source tables

-- Function to sync profiles table changes to user_login
CREATE OR REPLACE FUNCTION sync_profiles_to_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.password IS NOT NULL AND NEW.email IS NOT NULL THEN
      INSERT INTO user_login (email, username, password, user_type, original_id)
      VALUES (NEW.email, NEW.username, NEW.password, 'profile', NEW.id)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        updated_at = NOW();
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF NEW.password IS NOT NULL AND NEW.email IS NOT NULL THEN
      INSERT INTO user_login (email, username, password, user_type, original_id)
      VALUES (NEW.email, NEW.username, NEW.password, 'profile', NEW.id)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        updated_at = NOW();
    ELSE
      -- If password or email is removed, delete from user_login
      DELETE FROM user_login
      WHERE original_id = NEW.id AND user_type = 'profile';
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM user_login
    WHERE original_id = OLD.id AND user_type = 'profile';
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to sync students table changes to user_login
CREATE OR REPLACE FUNCTION sync_students_to_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.password IS NOT NULL AND NEW.email IS NOT NULL THEN
      INSERT INTO user_login (email, username, password, user_type, original_id)
      VALUES (NEW.email, NEW.student_code, NEW.password, 'student', NEW.id)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        updated_at = NOW();
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF NEW.password IS NOT NULL AND NEW.email IS NOT NULL THEN
      INSERT INTO user_login (email, username, password, user_type, original_id)
      VALUES (NEW.email, NEW.student_code, NEW.password, 'student', NEW.id)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        updated_at = NOW();
    ELSE
      -- If password or email is removed, delete from user_login
      DELETE FROM user_login
      WHERE original_id = NEW.id AND user_type = 'student';
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM user_login
    WHERE original_id = OLD.id AND user_type = 'student';
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to sync internship_candidates table changes to user_login
CREATE OR REPLACE FUNCTION sync_internship_candidates_to_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.password IS NOT NULL AND NEW.email IS NOT NULL THEN
      INSERT INTO user_login (email, username, password, user_type, original_id)
      VALUES (NEW.email, NEW.username, NEW.password, 'internship_candidate', NEW.id)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        updated_at = NOW();
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF NEW.password IS NOT NULL AND NEW.email IS NOT NULL THEN
      INSERT INTO user_login (email, username, password, user_type, original_id)
      VALUES (NEW.email, NEW.username, NEW.password, 'internship_candidate', NEW.id)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        updated_at = NOW();
    ELSE
      -- If password or email is removed, delete from user_login
      DELETE FROM user_login
      WHERE original_id = NEW.id AND user_type = 'internship_candidate';
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM user_login
    WHERE original_id = OLD.id AND user_type = 'internship_candidate';
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER profiles_user_login_sync
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profiles_to_user_login();

CREATE TRIGGER students_user_login_sync
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION sync_students_to_user_login();

CREATE TRIGGER internship_candidates_user_login_sync
  AFTER INSERT OR UPDATE OR DELETE ON internship_candidates
  FOR EACH ROW EXECUTE FUNCTION sync_internship_candidates_to_user_login();