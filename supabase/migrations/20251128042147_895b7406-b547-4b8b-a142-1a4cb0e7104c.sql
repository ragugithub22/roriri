-- Ensure pgcrypto is available for password encryption
create extension if not exists pgcrypto with schema public;

-- Sync Supabase Auth password for the actual user with this email
update auth.users
set encrypted_password = crypt('admin', gen_salt('bf'))
where id = 'f671301f-e93d-4b97-a733-717eefe9e780';