-- =====================================================
-- Create Super Admin for Existing Supabase Project
-- Run this in your Supabase SQL Editor AFTER the migration
-- =====================================================

-- First, you need to create the auth user manually in Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add user"
-- 3. Email: admin@scorpionsecurity.com
-- 4. Password: ScorpionAdmin2024!
-- 5. Email Confirm: ✅ Checked
-- 6. Copy the generated UUID

-- Then run this SQL (replace 'YOUR_USER_UUID_HERE' with the actual UUID):
INSERT INTO user_profiles (
    id, 
    username, 
    full_name, 
    email, 
    role_id, 
    is_super_admin,
    is_active
) VALUES (
    'YOUR_USER_UUID_HERE'::uuid,  -- Replace with actual UUID from auth.users
    'admin',
    'Super Administrator',
    'admin@scorpionsecurity.com',
    1,  -- super_admin role
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    role_id = EXCLUDED.role_id,
    is_super_admin = EXCLUDED.is_super_admin;

-- Verify the admin was created
SELECT 
    up.username,
    up.email,
    r.name as role,
    up.is_super_admin,
    up.created_at
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE up.username = 'admin';

-- =====================================================
-- Instructions:
-- 1. Create the auth user in Supabase Dashboard first
-- 2. Copy the UUID from the auth.users table
-- 3. Replace 'YOUR_USER_UUID_HERE' with the actual UUID
-- 4. Run this SQL
-- =====================================================