-- =====================================================
-- Scorpion Security Hub - Supabase Database Schema
-- Following PostgreSQL best practices with RLS
-- =====================================================

-- ✅ Step 1: Create Core Tables with Proper Relationships

-- 1️⃣ Roles Table (RBAC Foundation)
CREATE TABLE IF NOT EXISTS roles (
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
('user', 'Standard user with limited access', '{"view_public": true}')
ON CONFLICT (name) DO NOTHING;

-- 2️⃣ User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(255),
    role_id INTEGER REFERENCES roles(id) DEFAULT 4, -- Default to 'user' role
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

-- 3️⃣ Digital Library Table
CREATE TABLE IF NOT EXISTS digital_library (
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

-- 4️⃣ Research Projects Table
CREATE TABLE IF NOT EXISTS research_projects (
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

-- 5️⃣ Research Collaborators Table
CREATE TABLE IF NOT EXISTS research_collaborators (
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

-- 6️⃣ Threat Intelligence Table
CREATE TABLE IF NOT EXISTS threat_intelligence (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    type VARCHAR(50) NOT NULL,
    description TEXT,
    iocs JSONB, -- Indicators of Compromise
    mitigation TEXT,
    affected_systems TEXT[],
    confidence_level INTEGER DEFAULT 50 CHECK (confidence_level >= 0 AND confidence_level <= 100),
    is_verified BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7️⃣ Security Incidents Table
CREATE TABLE IF NOT EXISTS security_incidents (
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

-- 8️⃣ Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9️⃣ API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔟 Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1️⃣1️⃣ Company Information Table
CREATE TABLE IF NOT EXISTS company_info (
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

-- 1️⃣2️⃣ Security Metrics Table
CREATE TABLE IF NOT EXISTS security_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
    unit VARCHAR(20),
    tags JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Step 2: Enable Row Level Security on All Tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics ENABLE ROW LEVEL SECURITY;

-- ✅ Step 3: Create Secure RLS Policies

-- 🔐 User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON user_profiles FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role_id <= 2 OR is_super_admin = true)));

-- 🔐 Digital Library Policies
CREATE POLICY "Anyone can view public library items" ON digital_library FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "Users can view own library items" ON digital_library FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own library items" ON digital_library FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own library items" ON digital_library FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own library items" ON digital_library FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all library items" ON digital_library FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role_id <= 2 OR is_super_admin = true)));

-- 🔐 Research Projects Policies
CREATE POLICY "Users can view non-confidential projects" ON research_projects FOR SELECT TO authenticated 
    USING (is_confidential = false OR auth.uid() = user_id OR 
           EXISTS (SELECT 1 FROM research_collaborators WHERE project_id = research_projects.id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own projects" ON research_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Project owners can update projects" ON research_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Project owners can delete projects" ON research_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all projects" ON research_projects FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role_id <= 2 OR is_super_admin = true)));

-- 🔐 Research Collaborators Policies
CREATE POLICY "Users can view project collaborators" ON research_collaborators FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM research_projects WHERE id = project_id AND 
           (is_confidential = false OR user_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM research_collaborators rc WHERE rc.project_id = research_projects.id AND rc.user_id = auth.uid()))));
CREATE POLICY "Project owners can manage collaborators" ON research_collaborators FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM research_projects WHERE id = project_id AND user_id = auth.uid()));

-- 🔐 Threat Intelligence Policies
CREATE POLICY "Analysts can view threat intelligence" ON threat_intelligence FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id <= 3));
CREATE POLICY "Analysts can create threat intelligence" ON threat_intelligence FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id <= 3) AND auth.uid() = user_id);
CREATE POLICY "Users can update own threat intelligence" ON threat_intelligence FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all threat intelligence" ON threat_intelligence FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role_id <= 2 OR is_super_admin = true)));

-- 🔐 Security Incidents Policies
CREATE POLICY "Users can view assigned incidents" ON security_incidents FOR SELECT TO authenticated 
    USING (auth.uid() = user_id OR auth.uid() = assigned_to OR auth.uid() = reported_by OR
           EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id <= 3));
CREATE POLICY "Users can create incidents" ON security_incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Assigned users can update incidents" ON security_incidents FOR UPDATE TO authenticated 
    USING (auth.uid() = assigned_to OR auth.uid() = user_id OR 
           EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id <= 2));

-- 🔐 Activity Logs Policies (Read-only for most users)
CREATE POLICY "Admins can view all activity logs" ON activity_logs FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role_id <= 2 OR is_super_admin = true)));
CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 🔐 API Keys Policies
CREATE POLICY "Users can manage own API keys" ON api_keys FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 🔐 Notifications Policies
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 🔐 Security Metrics Policies
CREATE POLICY "Analysts can view security metrics" ON security_metrics FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role_id <= 3));
CREATE POLICY "Admins can manage security metrics" ON security_metrics FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (role_id <= 2 OR is_super_admin = true)));

-- ✅ Step 4: Create Performance Indexes

-- User Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- Digital Library Indexes
CREATE INDEX IF NOT EXISTS idx_digital_library_user_id ON digital_library(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_library_type ON digital_library(type);
CREATE INDEX IF NOT EXISTS idx_digital_library_is_public ON digital_library(is_public);
CREATE INDEX IF NOT EXISTS idx_digital_library_tags ON digital_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_digital_library_created_at ON digital_library(created_at DESC);

-- Research Projects Indexes
CREATE INDEX IF NOT EXISTS idx_research_projects_user_id ON research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status);
CREATE INDEX IF NOT EXISTS idx_research_projects_type ON research_projects(type);
CREATE INDEX IF NOT EXISTS idx_research_projects_tags ON research_projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_research_projects_created_at ON research_projects(created_at DESC);

-- Research Collaborators Indexes
CREATE INDEX IF NOT EXISTS idx_research_collaborators_project_id ON research_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_research_collaborators_user_id ON research_collaborators(user_id);

-- Threat Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_user_id ON threat_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_severity ON threat_intelligence(severity);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_type ON threat_intelligence(type);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_published_at ON threat_intelligence(published_at DESC);

-- Security Incidents Indexes
CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id ON security_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_assigned_to ON security_incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_reported_at ON security_incidents(reported_at DESC);

-- Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- API Keys Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Security Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_security_metrics_name ON security_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_security_metrics_recorded_at ON security_metrics(recorded_at DESC);

-- ✅ Step 5: Create Useful Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digital_library_updated_at BEFORE UPDATE ON digital_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_projects_updated_at BEFORE UPDATE ON research_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threat_intelligence_updated_at BEFORE UPDATE ON threat_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply activity logging to key tables
CREATE TRIGGER log_digital_library_activity AFTER INSERT OR UPDATE OR DELETE ON digital_library FOR EACH ROW EXECUTE FUNCTION log_user_activity();
CREATE TRIGGER log_research_projects_activity AFTER INSERT OR UPDATE OR DELETE ON research_projects FOR EACH ROW EXECUTE FUNCTION log_user_activity();
CREATE TRIGGER log_threat_intelligence_activity AFTER INSERT OR UPDATE OR DELETE ON threat_intelligence FOR EACH ROW EXECUTE FUNCTION log_user_activity();
CREATE TRIGGER log_security_incidents_activity AFTER INSERT OR UPDATE OR DELETE ON security_incidents FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- ✅ Step 6: Insert Sample Data

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
) ON CONFLICT (id) DO NOTHING;

-- Insert sample security metrics
INSERT INTO security_metrics (metric_name, metric_value, metric_type, unit) VALUES
('threats_blocked_today', 2847, 'counter', 'count'),
('systems_monitored', 15234, 'gauge', 'count'),
('incidents_resolved', 156, 'counter', 'count'),
('vulnerabilities_patched', 89, 'counter', 'count'),
('malware_blocked', 847, 'counter', 'count'),
('phishing_attempts', 234, 'counter', 'count'),
('ddos_mitigated', 12, 'counter', 'count'),
('response_time_avg', 1.8, 'gauge', 'minutes')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Migration Complete!
-- 
-- Next Steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Update your application to use Supabase client
-- 3. Configure environment variables
-- 4. Test RLS policies
-- =====================================================