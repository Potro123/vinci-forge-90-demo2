-- ============================================
-- Fix Admin Roles - Run this in Supabase SQL Editor
-- ============================================
-- This script ensures only bpotrovita1998@gmail.com has admin role
-- All other users will have 'user' role

-- Step 1: Check who currently has admin role
SELECT 'Current admin users:' as info;
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Step 2: Remove all admin roles
DELETE FROM public.user_roles 
WHERE role = 'admin';

-- Step 3: Add admin role only to the correct user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'bpotrovita1998@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Ensure all other users have the 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::public.app_role
FROM auth.users
WHERE email != 'bpotrovita1998@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'user'
  );

-- Step 5: Verify the fix
SELECT 'After fix - all users and their roles:' as info;
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY ur.role DESC, u.email;

-- Expected result:
-- bpotrovita1998@gmail.com should have 'admin' role
-- bogdan.potrovita@theaccessgroup.com should have 'user' role
-- All other users should have 'user' role
