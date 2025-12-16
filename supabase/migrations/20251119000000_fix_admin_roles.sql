-- Fix admin roles: Only bpotrovita1998@gmail.com should be admin
-- Remove admin role from all users except the designated admin

-- First, let's remove all admin roles
DELETE FROM public.user_roles 
WHERE role = 'admin';

-- Now add admin role only to the correct user
-- We need to get the user_id from auth.users table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'bpotrovita1998@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure all other users have the 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::public.app_role
FROM auth.users
WHERE email != 'bpotrovita1998@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
