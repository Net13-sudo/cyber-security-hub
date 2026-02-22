# 🗄️ Scorpion Security Hub - Database Architecture

## 🎯 Overview

The Scorpion Security Hub now features a **hybrid database architecture** that can seamlessly switch between **Supabase PostgreSQL** (production) and **SQLite** (development/fallback), following enterprise-grade security practices.

## 🏗️ Database Schema Design

### 📋 Core Tables Structure

```sql
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE SCHEMA                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👥 USERS & ROLES                                          │
│  ├── roles (RBAC foundation)                               │
│  └── user_profiles (extends auth.users)                    │
│                                                             │
│  📚 CONTENT MANAGEMENT                                      │
│  ├── digital_library (ebooks, articles, research)         │
│  ├── research_projects (project tracking)                  │
│  └── research_collaborators (team management)              │
│                                                             │
│  🛡️ SECURITY OPERATIONS                                    │
│  ├── threat_intelligence (threat data)                     │
│  ├── security_incidents (incident tracking)                │
│  └── security_metrics (real-time metrics)                  │
│                                                             │
│  🔧 SYSTEM MANAGEMENT                                       │
│  ├── activity_logs (audit trail)                          │
│  ├── api_keys (API management)                            │
│  ├── notifications (user alerts)                          │
│  └── company_info (organization data)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔐 Security Implementation

#### Row Level Security (RLS) Policies
```sql
-- Example: Digital Library Security
CREATE POLICY "Users can view public items" 
ON digital_library FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can manage own items" 
ON digital_library FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all items" 
ON digital_library FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE id = auth.uid() 
  AND (role_id <= 2 OR is_super_admin = true)
));
```

#### Role-Based Access Control (RBAC)
```sql
roles:
├── super_admin (id: 1) - Full system access
├── admin (id: 2) - Management access  
├── analyst (id: 3) - Security operations
└── user (id: 4) - Limited access
```

## 🚀 Hybrid Database System

### Architecture Benefits
```javascript
┌─────────────────────────────────────────────────────────────┐
│                   HYBRID DATABASE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 PRODUCTION (Supabase PostgreSQL)                       │
│  ├── ✅ Auto-scaling and high availability                 │
│  ├── ✅ Real-time subscriptions                           │
│  ├── ✅ Built-in authentication                           │
│  ├── ✅ Row Level Security (RLS)                          │
│  ├── ✅ Automatic backups                                 │
│  └── ✅ Global CDN and edge functions                     │
│                                                             │
│  💻 DEVELOPMENT/FALLBACK (SQLite)                          │
│  ├── ✅ Zero configuration setup                          │
│  ├── ✅ Offline development                               │
│  ├── ✅ Fast local testing                                │
│  ├── ✅ No external dependencies                          │
│  └── ✅ Automatic fallback system                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Smart Fallback Logic
```javascript
class HybridDatabase {
  async init() {
    if (isSupabaseConfigured) {
      try {
        // Try Supabase first
        await supabaseDB.healthCheck();
        this.useSupabase = true;
      } catch (error) {
        // Fall back to SQLite
        console.warn('Supabase unavailable, using SQLite');
        this.useSupabase = false;
        await initializeSQLite();
      }
    }
  }
}
```

## 📊 Performance Optimization

### Indexes Strategy
```sql
-- User lookup optimization
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_role_id ON user_profiles(role_id);

-- Content search optimization  
CREATE INDEX idx_digital_library_tags ON digital_library USING GIN(tags);
CREATE INDEX idx_digital_library_search ON digital_library 
USING GIN(to_tsvector('english', title || ' ' || description));

-- Time-series optimization
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_security_metrics_recorded_at ON security_metrics(recorded_at DESC);

-- Relationship optimization
CREATE INDEX idx_research_collaborators_project_id ON research_collaborators(project_id);
CREATE INDEX idx_research_collaborators_user_id ON research_collaborators(user_id);
```

### Query Optimization Examples
```sql
-- Efficient threat intelligence lookup
SELECT ti.*, up.username as created_by_name
FROM threat_intelligence ti
JOIN user_profiles up ON ti.user_id = up.id
WHERE ti.severity = 'CRITICAL'
  AND ti.published_at >= NOW() - INTERVAL '7 days'
ORDER BY ti.published_at DESC
LIMIT 10;

-- Research project dashboard query
SELECT 
  rp.*,
  COUNT(rc.id) as collaborator_count,
  up.username as lead_name
FROM research_projects rp
LEFT JOIN research_collaborators rc ON rp.id = rc.project_id
JOIN user_profiles up ON rp.user_id = up.id
WHERE rp.status = 'active'
GROUP BY rp.id, up.username
ORDER BY rp.created_at DESC;
```

## 🔄 Real-time Features

### Supabase Real-time Subscriptions
```javascript
// Live threat intelligence updates
const threatSubscription = supabase
  .from('threat_intelligence')
  .on('INSERT', payload => {
    console.log('🚨 New threat detected:', payload.new);
    updateThreatDashboard(payload.new);
  })
  .on('UPDATE', payload => {
    console.log('📝 Threat updated:', payload.new);
    refreshThreatItem(payload.new);
  })
  .subscribe();

// Live incident updates
const incidentSubscription = supabase
  .from('security_incidents')
  .on('*', payload => {
    console.log('🔔 Incident change:', payload);
    refreshIncidentBoard();
  })
  .subscribe();
```

## 🛡️ Security Features

### Authentication Flow
```javascript
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ User Login Request                                     │
│     ├── Username/Password validation                       │
│     ├── 2FA verification (if enabled)                      │
│     └── JWT token generation                               │
│                                                             │
│  2️⃣ Token Verification                                     │
│     ├── JWT signature validation                           │
│     ├── Token expiration check                             │
│     └── User role/permission lookup                        │
│                                                             │
│  3️⃣ RLS Policy Enforcement                                 │
│     ├── Supabase: Automatic RLS                           │
│     ├── SQLite: Manual permission checks                   │
│     └── Resource access control                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Protection
```sql
-- Sensitive data encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt API keys
INSERT INTO api_keys (user_id, name, key_hash) 
VALUES (user_id, 'API Key Name', crypt('actual_key', gen_salt('bf')));

-- Audit trail for all operations
CREATE TRIGGER log_digital_library_activity 
AFTER INSERT OR UPDATE OR DELETE ON digital_library 
FOR EACH ROW EXECUTE FUNCTION log_user_activity();
```

## 📈 Monitoring & Analytics

### Built-in Metrics Collection
```sql
-- Security metrics tracking
INSERT INTO security_metrics (metric_name, metric_value, metric_type) VALUES
('threats_blocked_today', 2847, 'counter'),
('systems_monitored', 15234, 'gauge'),
('response_time_avg', 1.8, 'gauge'),
('incidents_resolved', 156, 'counter');

-- Query performance monitoring
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

### Activity Logging
```sql
-- Comprehensive audit trail
SELECT 
  al.created_at,
  up.username,
  al.action,
  al.resource_type,
  al.details->>'title' as resource_title
FROM activity_logs al
JOIN user_profiles up ON al.user_id = up.id
WHERE al.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC;
```

## 🔧 API Integration

### RESTful Endpoints
```javascript
// Digital Library API
GET    /api/library              // List items
POST   /api/library              // Create item  
GET    /api/library/:id          // Get item
PUT    /api/library/:id          // Update item
DELETE /api/library/:id          // Delete item

// Research Projects API  
GET    /api/research             // List projects
POST   /api/research             // Create project
GET    /api/research/:id         // Get project
PUT    /api/research/:id         // Update project
DELETE /api/research/:id         // Delete project

// Admin Management API
GET    /api/admin/users          // List users
PATCH  /api/admin/users/:id/role // Update user role
DELETE /api/admin/users/:id      // Delete user
GET    /api/admin/stats          // System statistics
```

### Database Abstraction Layer
```javascript
// Unified API regardless of database backend
const db = new HybridDatabase();

// Works with both Supabase and SQLite
await db.insertRecord('digital_library', {
  title: 'New Security Guide',
  type: 'ebook',
  author: 'Security Expert'
});

// Automatic query optimization
const items = await db.queryTable('digital_library', {
  filters: { type: 'research' },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10
});
```

## 🚀 Deployment Architecture

### Production Setup
```yaml
┌─────────────────────────────────────────────────────────────┐
│                 PRODUCTION DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 Frontend (Static Hosting)                              │
│  ├── DigitalOcean/Netlify/CloudFlare Pages                │
│  ├── CDN distribution                                      │
│  └── SSL/TLS termination                                   │
│                                                             │
│  ⚡ Backend API (Node.js)                                  │
│  ├── Railway/Heroku/DigitalOcean                          │
│  ├── Auto-scaling                                         │
│  ├── Health checks                                        │
│  └── Environment variables                                │
│                                                             │
│  🗄️ Database (Supabase)                                   │
│  ├── PostgreSQL cluster                                   │
│  ├── Automatic backups                                    │
│  ├── Connection pooling                                   │
│  └── Global distribution                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Migration Checklist

### From SQLite to Supabase
- [ ] Create Supabase project
- [ ] Run migration SQL script
- [ ] Update environment variables
- [ ] Test RLS policies
- [ ] Migrate existing data
- [ ] Update API endpoints
- [ ] Test authentication flow
- [ ] Verify real-time features
- [ ] Configure backups
- [ ] Monitor performance

### Development Workflow
```bash
# 1. Start with SQLite for rapid development
npm run dev

# 2. Test with Supabase for production features  
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npm start

# 3. Run migrations
npm run migrate

# 4. Seed sample data
npm run seed

# 5. Create admin user
npm run create-admin
```

## 🎯 Best Practices Summary

### ✅ Security
- Row Level Security (RLS) enabled on all tables
- JWT-based authentication with 2FA support
- Encrypted sensitive data storage
- Comprehensive audit logging
- Role-based access control (RBAC)

### ✅ Performance  
- Strategic indexing for fast queries
- Connection pooling and caching
- Optimized queries with proper JOINs
- Real-time subscriptions for live updates
- CDN distribution for static assets

### ✅ Scalability
- Horizontal scaling with Supabase
- Automatic failover to SQLite
- Microservices-ready architecture
- API-first design approach
- Cloud-native deployment

### ✅ Maintainability
- Clean separation of concerns
- Comprehensive error handling
- Detailed logging and monitoring
- Automated testing capabilities
- Documentation and code comments

---

## 🎉 Result

The Scorpion Security Hub now features a **world-class database architecture** that combines the power of **Supabase PostgreSQL** for production with the simplicity of **SQLite** for development, providing:

- 🚀 **Enterprise-grade security** with RLS and RBAC
- ⚡ **Real-time capabilities** for threat intelligence
- 🔄 **Automatic failover** and high availability  
- 📊 **Performance optimization** with strategic indexing
- 🛡️ **Comprehensive audit trails** for compliance
- 🌐 **Global scalability** with edge distribution

Your cybersecurity platform is now ready to handle enterprise workloads while maintaining the flexibility for rapid development and testing! 🦂🛡️