# 🚀 Scorpion Security Hub - Supabase PostgreSQL Setup Guide

## 🎯 Overview

This guide will help you set up the Scorpion Security Hub with **Supabase PostgreSQL** following enterprise-grade best practices with **Row Level Security (RLS)**, proper relationships, and performance optimization.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Scorpion Security Hub                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend (HTML/JS) ←→ Backend (Node.js) ←→ Database       │
│                                                             │
│  🌐 Client Pages    ⚡ Express API      🗄️ Supabase        │
│  • Digital Library  • Authentication    • PostgreSQL       │
│  • Research Projects• CRUD Operations   • RLS Policies     │
│  • Admin Dashboard  • JWT Tokens        • Real-time        │
│  • Threat Intel     • 2FA Support       • Auto-scaling     │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Step 1: Create Supabase Project

### 1.1 Sign up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google or email
4. Create a new organization (if needed)

### 1.2 Create New Project
1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `scorpion-security-hub`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### 1.3 Get Your Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ✅ Step 2: Run Database Migration

### 2.1 Execute SQL Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `server/src/db/supabase-migrations.sql`
4. Paste into the SQL editor
5. Click **Run** (this may take 30-60 seconds)
6. You should see "Success. No rows returned" message

### 2.2 Verify Tables Created
1. Go to **Table Editor**
2. You should see these tables:
   - `roles`
   - `user_profiles`
   - `digital_library`
   - `research_projects`
   - `research_collaborators`
   - `threat_intelligence`
   - `security_incidents`
   - `activity_logs`
   - `api_keys`
   - `notifications`
   - `company_info`
   - `security_metrics`

## ✅ Step 3: Configure Environment

### 3.1 Create Environment File
```bash
cd server
cp .env.example .env
```

### 3.2 Update .env File
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3.3 Install Dependencies
```bash
npm install
```

## ✅ Step 4: Test the System

### 4.1 Start the Server
```bash
npm start
```

You should see:
```
[Supabase] Connected successfully
[Server] Scorpion Security Hub API running on port 3001
```

### 4.2 Health Check
```bash
npm run health
```

Expected output:
```json
{
  "status": "connected",
  "message": "Supabase connection healthy",
  "database": "supabase"
}
```

### 4.3 Test Frontend
1. Open `pages/security_command_homepage.html` in your browser
2. Navigate to different sections
3. Try the admin login at `pages/login.html`

## 🔐 Step 5: Create Super Admin

### 5.1 Using Supabase Auth
1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click "Add user"
3. Fill in:
   - **Email**: `admin@scorpionsecurity.com`
   - **Password**: `ScorpionAdmin2024!`
   - **Email Confirm**: ✅ Checked
4. Click "Create user"

### 5.2 Add User Profile
1. Go to **Table Editor** → `user_profiles`
2. Click "Insert" → "Insert row"
3. Fill in:
   - **id**: Copy the UUID from the auth.users table
   - **username**: `admin`
   - **full_name**: `Super Administrator`
   - **email**: `admin@scorpionsecurity.com`
   - **role_id**: `1` (super_admin role)
   - **is_super_admin**: `true`
4. Click "Save"

## 🛡️ Step 6: Verify Security (RLS Policies)

### 6.1 Test Row Level Security
1. Go to **Authentication** → **Policies**
2. You should see policies for each table
3. Test by creating a regular user and verifying they can't access admin data

### 6.2 Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ScorpionAdmin2024!"}'
```

## 📊 Step 7: Verify Sample Data

### 7.1 Check Tables Have Data
1. Go to **Table Editor**
2. Check these tables have sample data:
   - `company_info` (1 row)
   - `security_metrics` (8 rows)
   - `roles` (4 rows)

### 7.2 Add Sample Library Items (Optional)
```sql
INSERT INTO digital_library (user_id, title, type, author, description, tags, is_public) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'admin@scorpionsecurity.com'),
  'Advanced Threat Detection with AI',
  'ebook',
  'Dr. Sarah Chen',
  'Comprehensive guide on using artificial intelligence for cybersecurity threat detection.',
  ARRAY['AI', 'Threat Detection', 'Machine Learning'],
  true
);
```

## 🚀 Step 8: Production Deployment

### 8.1 Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret-256-bits-minimum
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
CORS_ORIGIN=https://yourdomain.com
```

### 8.2 Security Checklist
- [ ] Change default JWT secret
- [ ] Update admin password
- [ ] Configure CORS for your domain
- [ ] Enable Supabase email confirmations
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Enable audit logging

## 🔧 Advanced Configuration

### Database Optimization
```sql
-- Add custom indexes for better performance
CREATE INDEX CONCURRENTLY idx_digital_library_search 
ON digital_library USING GIN(to_tsvector('english', title || ' ' || description));

-- Add partial indexes for active records
CREATE INDEX CONCURRENTLY idx_research_projects_active 
ON research_projects (created_at DESC) WHERE status = 'active';
```

### Real-time Subscriptions
```javascript
// Enable real-time updates for threat intelligence
const { data, error } = await supabase
  .from('threat_intelligence')
  .on('INSERT', payload => {
    console.log('New threat detected:', payload.new);
  })
  .subscribe();
```

## 🐛 Troubleshooting

### Common Issues

**1. "Supabase not configured" Error**
- Check your `.env` file has correct Supabase keys
- Verify the keys are not wrapped in quotes
- Restart the server after changing `.env`

**2. RLS Policy Errors**
- Ensure you're using the service role key for server operations
- Check that policies are created correctly
- Verify user has proper role assignments

**3. Connection Timeouts**
- Check your internet connection
- Verify Supabase project is not paused
- Try a different region if persistent issues

**4. Migration Fails**
- Run the SQL in smaller chunks
- Check for syntax errors in the migration file
- Verify you have proper permissions

### Fallback to SQLite
If Supabase is unavailable, the system automatically falls back to SQLite:
```
[Database] Supabase health check failed, falling back to SQLite
[SQLite] Connected to fallback SQLite database
```

## 📈 Monitoring & Analytics

### Supabase Dashboard
- **Database**: Monitor query performance
- **Auth**: Track user registrations and logins
- **Storage**: Monitor file uploads (if used)
- **Edge Functions**: Monitor serverless function calls

### Custom Metrics
The system tracks these security metrics:
- Threats blocked today
- Systems monitored
- Incidents resolved
- Vulnerabilities patched
- Response time averages

## 🎯 Next Steps

1. **Customize the Schema**: Add your specific security requirements
2. **Implement Real-time**: Add live updates for threat intelligence
3. **Add File Storage**: Use Supabase Storage for document uploads
4. **Set up Backups**: Configure automated database backups
5. **Add Monitoring**: Implement application performance monitoring
6. **Scale**: Configure connection pooling and read replicas

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/database-design)

---

## 🎉 Congratulations!

You now have a production-ready cybersecurity platform with:
- ✅ **Scalable PostgreSQL Database** with Supabase
- ✅ **Enterprise Security** with RLS policies
- ✅ **Real-time Capabilities** for threat intelligence
- ✅ **Automatic Backups** and high availability
- ✅ **Professional Admin Dashboard**
- ✅ **Hybrid Fallback System** (Supabase + SQLite)

Your Scorpion Security Hub is ready to protect digital assets at scale! 🦂🛡️