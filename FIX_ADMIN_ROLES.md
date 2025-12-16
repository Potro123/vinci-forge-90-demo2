# Fix Admin Roles Issue

## Problem
The user `bogdan.potrovita@theaccessgroup.com` is showing "Unlimited" coins, which indicates they have admin privileges. Only `bpotrovita1998@gmail.com` should have admin access.

## Root Cause
The user was incorrectly assigned the 'admin' role in the `user_roles` table in the database.

## Solution

### Step 1: Run the SQL Script in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the following SQL:

```sql
-- Fix admin roles: Only bpotrovita1998@gmail.com should be admin
-- Remove admin role from all users except the designated admin

-- First, let's see who currently has admin role
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Remove all admin roles
DELETE FROM public.user_roles 
WHERE role = 'admin';

-- Add admin role only to the correct user
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
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'user'
  );

-- Verify the fix
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY ur.role DESC, u.email;
```

4. Click **Run** to execute the script

### Step 2: Verify the Fix

1. Log out of the application
2. Log back in as `bogdan.potrovita@theaccessgroup.com`
3. Check that the coin counter shows **0** instead of "Unlimited"
4. Log in as `bpotrovita1998@gmail.com` and verify it still shows "Unlimited"

### Step 3: Prevent Future Issues

The migration file `supabase/migrations/20251119000000_fix_admin_roles.sql` has been created. This will ensure that:
- Only `bpotrovita1998@gmail.com` has admin role
- All other users have 'user' role
- The trigger `handle_new_user_subscription` correctly assigns 'user' role to new users

## How New Users Are Created

When a new user signs up:
1. The `handle_new_user_subscription` trigger fires
2. It creates a subscription record with status 'inactive'
3. It creates a token balance with 0 balance and 5 free tokens
4. It assigns the 'user' role (NOT admin)

## Admin Privileges

Only users with 'admin' role in the `user_roles` table get:
- Unlimited coins (no token deduction)
- Unlimited storage
- Bypass subscription checks
- Access to all features without payment

## Troubleshooting

If the issue persists:

1. **Check the database directly:**
   ```sql
   SELECT u.email, ur.role 
   FROM auth.users u
   LEFT JOIN public.user_roles ur ON u.id = ur.user_id
   WHERE u.email IN ('bpotrovita1998@gmail.com', 'bogdan.potrovita@theaccessgroup.com');
   ```

2. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'user_roles';
   ```

3. **Clear browser cache and local storage:**
   - Open browser DevTools (F12)
   - Go to Application tab
   - Clear Local Storage and Session Storage
   - Refresh the page

4. **Check the browser console for errors:**
   - Look for any errors related to fetching user roles
   - Check if the `useSubscription` hook is working correctly
