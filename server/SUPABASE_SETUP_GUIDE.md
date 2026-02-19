# 🚀 Supabase Setup Guide for Scorpion Security Hub

This guide will help you set up a new Supabase project for your Scorpion Security Hub.

## 📋 Step 1: Create New Supabase Project

1. **Visit Supabase**: Go to [https://supabase.com](https://supabase.com)
2. **Sign In**: Use your existing account or create a new one
3. **Create Project**: Click "New Project"
4. **Project Details**:
   - **Name**: `Scorpion Security Hub`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your location
   - **Plan**: Free tier is perfect for development

5. **Wait**: Project creation takes 1-2 minutes

## 🔑 Step 2: Get Your Credentials

Once your project is ready:

1. **Go to Settings** → **API** in your Supabase dashboard
2. **Copy these values**:
   ```
   Project URL: https://your-project-ref.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role secret key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## ⚙️ Step 3: Configure Environment

Run the setup script:

```bash
node setup-new-supabase.js
```

Or manually update your `.env` file:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 🗄️ Step 4: Set Up Database Schema

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Click "New Query"**
3. **Copy and paste** the entire contents of `supabase-migrations.sql`
4. **Click "Run"** to create all tables, indexes, and security policies

The migration will create:
- ✅ User management tables
- ✅ Digital library system
- ✅ Research projects management
- ✅ Threat intelligence tracking
- ✅ Security incident management
- ✅ Activity logging and audit trails
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Sample data

## 🚀 Step 5: Test Your Setup

Start your server:

```bash
npm start
```

Look for these success messages:
```
[Supabase] Connected successfully
[Database] Using Supabase PostgreSQL
[Server] Scorpion Security Hub API running on port 3001
```

## 📊 Step 6: Migrate Existing Data (Optional)

If you have existing SQLite data to migrate:

```bash
node migrate-to-supabase.js
```

This will transfer:
- User accounts
- Digital library items
- Research projects
- Security metrics
- Company information

## 🔐 Step 7: Create Admin User

The migration includes a default admin setup, but you can create additional users through:

1. **Supabase Dashboard** → **Authentication** → **Users**
2. **Add User** manually
3. **Or use the API** to create users programmatically

## 🧪 Step 8: Test Your Application

1. **Open your frontend**: `pages/security_command_homepage.html`
2. **Try logging in**: `pages/login.html`
3. **Test features**:
   - Digital Library: `pages/digital_library.html`
   - Research Projects: `pages/research_projects.html`
   - Threat Intelligence: `pages/threat_intelligence.html`

## 🛠️ Troubleshooting

### Connection Issues
- ✅ Check your `.env` file has correct credentials
- ✅ Verify your Supabase project is active
- ✅ Ensure you've run the SQL migration

### Permission Errors
- ✅ Make sure you used the **service_role** key (not anon key)
- ✅ Check that RLS policies are properly configured
- ✅ Verify your user has the correct role

### Data Issues
- ✅ Check Supabase dashboard → **Table Editor** to see your data
- ✅ Use **SQL Editor** to run test queries
- ✅ Check server logs for detailed error messages

## 📚 Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

## 🎯 What's Next?

After setup is complete:

1. **Customize your data** in the Supabase dashboard
2. **Add more users** through the authentication panel
3. **Configure email templates** for user invitations
4. **Set up real-time subscriptions** for live updates
5. **Deploy your application** to production

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the server logs for detailed error messages
2. Verify your Supabase project status in the dashboard
3. Test your connection with a simple query in SQL Editor
4. Make sure all environment variables are correctly set

Your Scorpion Security Hub is now ready to use with Supabase! 🎉