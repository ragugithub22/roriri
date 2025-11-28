-- Ensure pgcrypto is available for password encryption
create extension if not exists pgcrypto with schema public;

-- Update the existing admin profile that already has username='admin'
update public.profiles
set password = 'admin'
where id = '91f5a763-5047-4fd9-82e7-27dde97be108';

-- Clear username and password from the duplicate profile
update public.profiles
set username = null,
    password = null
where id = 'f671301f-e93d-4b97-a733-717eefe9e780';

-- Keep only the correct user as admin; remove duplicate admin roles
delete from public.user_roles
where role = 'admin'
  and user_id <> '91f5a763-5047-4fd9-82e7-27dde97be108';

-- Sync Supabase Auth password for the admin account
update auth.users
set encrypted_password = crypt('admin', gen_salt('bf'))
where id = '91f5a763-5047-4fd9-82e7-27dde97be108';