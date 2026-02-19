-- =====================================================
-- Supabase Database Cleanup Script
-- Run this in your Supabase SQL Editor to clean all data
-- =====================================================

-- ⚠️  WARNING: This will delete ALL data from your database!
-- Make sure you want to proceed before running this script.

-- Step 1: Disable RLS temporarily for cleanup
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS digital_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS research_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS research_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS threat_intelligence DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS security_incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS security_metrics DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS research_collaborators CASCADE;
DROP TABLE IF EXISTS security_incidents CASCADE;
DROP TABLE IF EXISTS threat_intelligence CASCADE;
DROP TABLE IF EXISTS research_projects CASCADE;
DROP TABLE IF EXISTS digital_library CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS security_metrics CASCADE;
DROP TABLE IF EXISTS company_info CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Step 3: Drop any existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_user_activity() CASCADE;

-- Step 4: Clean up any remaining sequences
DROP SEQUENCE IF EXISTS roles_id_seq CASCADE;
DROP SEQUENCE IF EXISTS digital_library_id_seq CASCADE;
DROP SEQUENCE IF EXISTS research_projects_id_seq CASCADE;
DROP SEQUENCE IF EXISTS research_collaborators_id_seq CASCADE;
DROP SEQUENCE IF EXISTS threat_intelligence_id_seq CASCADE;
DROP SEQUENCE IF EXISTS security_incidents_id_seq CASCADE;
DROP SEQUENCE IF EXISTS activity_logs_id_seq CASCADE;
DROP SEQUENCE IF EXISTS api_keys_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notifications_id_seq CASCADE;
DROP SEQUENCE IF EXISTS company_info_id_seq CASCADE;
DROP SEQUENCE IF EXISTS security_metrics_id_seq CASCADE;

-- Step 5: Drop any existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view public library items" ON digital_library;
DROP POLICY IF EXISTS "Users can view own library items" ON digital_library;
DROP POLICY IF EXISTS "Users can insert own library items" ON digital_library;
DROP POLICY IF EXISTS "Users can update own library items" ON digital_library;
DROP POLICY IF EXISTS "Users can delete own library items" ON digital_library;
DROP POLICY IF EXISTS "Admins can manage all library items" ON digital_library;
DROP POLICY IF EXISTS "Users can view non-confidential projects" ON research_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON research_projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON research_projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON research_projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON research_projects;
DROP POLICY IF EXISTS "Users can view project collaborators" ON research_collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON research_collaborators;
DROP POLICY IF EXISTS "Analysts can view threat intelligence" ON threat_intelligence;
DROP POLICY IF EXISTS "Analysts can create threat intelligence" ON threat_intelligence;
DROP POLICY IF EXISTS "Users can update own threat intelligence" ON threat_intelligence;
DROP POLICY IF EXISTS "Admins can manage all threat intelligence" ON threat_intelligence;
DROP POLICY IF EXISTS "Users can view assigned incidents" ON security_incidents;
DROP POLICY IF EXISTS "Users can create incidents" ON security_incidents;
DROP POLICY IF EXISTS "Assigned users can update incidents" ON security_incidents;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can manage own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Analysts can view security metrics" ON security_metrics;
DROP POLICY IF EXISTS "Admins can manage security metrics" ON security_metrics;

-- Step 6: Drop any existing indexes
DROP INDEX IF EXISTS idx_user_profiles_username;
DROP INDEX IF EXISTS idx_user_profiles_role_id;
DROP INDEX IF EXISTS idx_user_profiles_is_active;
DROP INDEX IF EXISTS idx_digital_library_user_id;
DROP INDEX IF EXISTS idx_digital_library_type;
DROP INDEX IF EXISTS idx_digital_library_is_public;
DROP INDEX IF EXISTS idx_digital_library_tags;
DROP INDEX IF EXISTS idx_digital_library_created_at;
DROP INDEX IF EXISTS idx_research_projects_user_id;
DROP INDEX IF EXISTS idx_research_projects_status;
DROP INDEX IF EXISTS idx_research_projects_type;
DROP INDEX IF EXISTS idx_research_projects_tags;
DROP INDEX IF EXISTS idx_research_projects_created_at;
DROP INDEX IF EXISTS idx_research_collaborators_project_id;
DROP INDEX IF EXISTS idx_research_collaborators_user_id;
DROP INDEX IF EXISTS idx_threat_intelligence_user_id;
DROP INDEX IF EXISTS idx_threat_intelligence_severity;
DROP INDEX IF EXISTS idx_threat_intelligence_type;
DROP INDEX IF EXISTS idx_threat_intelligence_published_at;
DROP INDEX IF EXISTS idx_security_incidents_user_id;
DROP INDEX IF EXISTS idx_security_incidents_assigned_to;
DROP INDEX IF EXISTS idx_security_incidents_status;
DROP INDEX IF EXISTS idx_security_incidents_severity;
DROP INDEX IF EXISTS idx_security_incidents_reported_at;
DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_activity_logs_action;
DROP INDEX IF EXISTS idx_activity_logs_created_at;
DROP INDEX IF EXISTS idx_activity_logs_resource;
DROP INDEX IF EXISTS idx_api_keys_user_id;
DROP INDEX IF EXISTS idx_api_keys_is_active;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_security_metrics_name;
DROP INDEX IF EXISTS idx_security_metrics_recorded_at;

-- =====================================================
-- Cleanup Complete!
-- 
-- Your Supabase database is now completely clean.
-- 
-- Next Steps:
-- 1. Run the migration script (supabase-migrations.sql) to recreate the schema
-- 2. Restart your server to test the connection
-- 3. Your database is ready for fresh data
-- =====================================================

SELECT 'Database cleanup completed successfully!' as status;