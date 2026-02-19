-- =====================================================
-- Scorpion Security Hub - Migration for Existing Supabase Project
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 🔍 Check if tables already exist to avoid conflicts
DO $$ 
BEGIN
    -- Only create tables if they don't exist
    
    -- 1️⃣ Roles Table (if not exists)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles') THEN
        CREATE TABLE roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            permissions JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert default roles
        INSERT INTO roles (name, description, permissions) VALUES 
        ('super_admin', 'Super Administrator with full system access', '{"all": true}'),
        ('admin', 'Administrator with management access', '{"manage_users": true, "manage_content": true}'),
        ('analyst', 'Security Analyst with read/write access', '{"view_threats": true, "create_reports": true}'),
        ('user', 'Standard user with limited access', '{"view_public": true}');
    END IF;

    -- 2️⃣ User Profiles Table (extends your existing auth.users)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            username VARCHAR(50) UNIQUE NOT NULL,
            full_name VARCHAR(100),
            email VARCHAR(255),
            role_id INTEGER REFERENCES roles(id) DEFAULT 4,
            is_super_admin BOOLEAN DEFAULT FALSE,
            two_factor_secret TEXT,
            avatar_url TEXT,
            department VARCHAR(100),
            phone VARCHAR(20),
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- 3️⃣ Digital Library Table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'digital_library') THEN
        CREATE TABLE digital_library (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN ('ebook', 'article', 'whitepaper', 'research', 'report')),
            author VARCHAR(150) NOT NULL,
            description TEXT,
            url TEXT,
            file_path TEXT,
            file_size BIGINT,
            tags TEXT[],
            is_public BOOLEAN DEFAULT FALSE,
            is_online BOOLEAN DEFAULT TRUE,
            download_count INTEGER DEFAULT 0,
            rating DECIMAL(3,2) DEFAULT 0.00,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- 4️⃣ Research Projects Table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'research_projects') THEN
        CREATE TABLE research_projects (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'pending', 'completed', 'archived', 'on_hold')),
            type VARCHAR(50) NOT NULL CHECK (type IN ('online', 'offline', 'hybrid')),
            lead_researcher VARCHAR(150) NOT NULL,
            description TEXT,
            objectives TEXT,
            methodology TEXT,
            start_date DATE,
            end_date DATE,
            budget DECIMAL(12,2),
            tags TEXT[],
            progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            is_confidential BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- 5️⃣ Research Collaborators Table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'research_collaborators') THEN
        CREATE TABLE research_collaborators (
            id BIGSERIAL PRIMARY KEY,
            project_id BIGINT REFERENCES research_projects(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            researcher_name VARCHAR(150) NOT NULL,
            role VARCHAR(100),
            email VARCHAR(255),
            contribution_percentage DECIMAL(5,2) DEFAULT 0.00,
            is_active BOOLEAN DEFAULT TRUE,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- 6️⃣ Threat Intelligence Table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'threat_intelligence') THEN
        CREATE TABLE threat_intelligence (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            source VARCHAR(100) NOT NULL,
            title VARCHAR(200) NOT NULL,
            severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
            type VARCHAR(50) NOT NULL,
            description TEXT,
            iocs JSONB,
            mitigation TEXT,
            affected_systems TEXT[],
            confidence_level INTEGER DEFAULT 50 CHECK (confidence_level >= 0 AND confidence_level <= 100),
            is_verified BOOLEAN DEFAULT FALSE,
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- 7️⃣ Security Incidents Table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_incidents') THEN
        CREATE TABLE security_incidents (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
            status VARCHAR(30) NOT NULL CHECK (status IN ('OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED')),
            category VARCHAR(50),
            assigned_to UUID REFERENCES auth.users(id),
            reported_by UUID REFERENCES auth.users(id),
            affected_systems TEXT[],
            impact_assessment TEXT,
            resolution_notes TEXT,
            estimated_cost DECIMAL(12,2),
            reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- 8️⃣ Company Information Table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_info') THEN
        CREATE TABLE company_info (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL DEFAULT 'Scorpion Security',
            description TEXT,
            website VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(50),
            address TEXT,
            founded_year INTEGER,
            employee_count INTEGER,
            certifications TEXT[],
            services TEXT[],
            logo_url TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert default company information
        INSERT INTO company_info (name, description, website, email, phone, founded_year, employee_count, certifications, services)
        VALUES (
            'Scorpion Security',
            'Advanced cybersecurity solutions that protect, detect, and respond to threats before they impact your business.',
            'https://scorpionsecurity.com',
            'info@scorpionsecurity.com',
            '+1-800-SECURITY',
            2009,
            150,
            ARRAY['CISSP', 'CISM', 'CEH', 'ISO 27001'],
            ARRAY['Managed Security Services', 'Penetration Testing', 'Compliance & Risk', 'Incident Response', 'Threat Intelligence']
        );
    END IF;

    -- 9️⃣ Security Metrics Table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_metrics') THEN
        CREATE TABLE security_metrics (
            id BIGSERIAL PRIMARY KEY,
            metric_name VARCHAR(100) NOT NULL,
            metric_value DECIMAL(15,2) NOT NULL,
            metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
            unit VARCHAR(20),
            tags JSONB,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert sample security metrics
        INSERT INTO security_metrics (metric_name, metric_value, metric_type, unit) VALUES
        ('threats_blocked_today', 2847, 'counter', 'count'),
        ('systems_monitored', 15234, 'gauge', 'count'),
        ('incidents_resolved', 156, 'counter', 'count'),
        ('vulnerabilities_patched', 89, 'counter', 'count'),
        ('malware_blocked', 847, 'counter', 'count'),
        ('phishing_attempts', 234, 'counter', 'count'),
        ('ddos_mitigated', 12, 'counter', 'count'),
        ('response_time_avg', 1.8, 'gauge', 'minutes');
    END IF;

END $$;

-- ✅ Enable Row Level Security on New Tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics ENABLE ROW LEVEL SECURITY;

-- ✅ Create Essential RLS Policies

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Digital Library Policies
DROP POLICY IF EXISTS "Anyone can view public library items" ON digital_library;
CREATE POLICY "Anyone can view public library items" ON digital_library FOR SELECT TO anon, authenticated USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own library items" ON digital_library;
CREATE POLICY "Users can view own library items" ON digital_library FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own library items" ON digital_library;
CREATE POLICY "Users can insert own library items" ON digital_library FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own library items" ON digital_library;
CREATE POLICY "Users can update own library items" ON digital_library FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own library items" ON digital_library;
CREATE POLICY "Users can delete own library items" ON digital_library FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Research Projects Policies
DROP POLICY IF EXISTS "Users can view non-confidential projects" ON research_projects;
CREATE POLICY "Users can view non-confidential projects" ON research_projects FOR SELECT TO authenticated 
    USING (is_confidential = false OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON research_projects;
CREATE POLICY "Users can insert own projects" ON research_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Project owners can update projects" ON research_projects;
CREATE POLICY "Project owners can update projects" ON research_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Project owners can delete projects" ON research_projects;
CREATE POLICY "Project owners can delete projects" ON research_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Security Metrics Policies (Read-only for most users)
DROP POLICY IF EXISTS "Users can view security metrics" ON security_metrics;
CREATE POLICY "Users can view security metrics" ON security_metrics FOR SELECT TO authenticated USING (true);

-- ✅ Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_digital_library_user_id ON digital_library(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_library_type ON digital_library(type);
CREATE INDEX IF NOT EXISTS idx_digital_library_tags ON digital_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_research_projects_user_id ON research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status);
CREATE INDEX IF NOT EXISTS idx_research_projects_tags ON research_projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_research_collaborators_project_id ON research_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_user_id ON threat_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_severity ON threat_intelligence(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id ON security_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_metrics_name ON security_metrics(metric_name);

-- ✅ Create Update Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_digital_library_updated_at ON digital_library;
CREATE TRIGGER update_digital_library_updated_at BEFORE UPDATE ON digital_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_projects_updated_at ON research_projects;
CREATE TRIGGER update_research_projects_updated_at BEFORE UPDATE ON research_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_threat_intelligence_updated_at ON threat_intelligence;
CREATE TRIGGER update_threat_intelligence_updated_at BEFORE UPDATE ON threat_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_security_incidents_updated_at ON security_incidents;
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Migration Complete for Existing Supabase Project!
-- 
-- What was added:
-- ✅ 9 new tables for Scorpion Security Hub
-- ✅ Row Level Security policies
-- ✅ Performance indexes
-- ✅ Update triggers
-- ✅ Sample data
-- 
-- Next: Update your .env file with your Supabase credentials
-- =====================================================