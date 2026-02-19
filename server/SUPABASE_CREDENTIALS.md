# 🔐 Supabase Database Credentials & Setup Guide

## Super Admin Credentials

**Username:** `Net13`  
**Password:** `Polaris@1024#`  
**Email:** `legrangelouise0@gmail.com`  
**Role:** `admin`  
**Super Admin:** `true`

---

## 📊 Beekeeper Studio Connection Details

> [!IMPORTANT]
> **Use Direct Connection (Port 5432)** - This is the standard connection method that works with IPv4, Beekeeper Studio, and Node.js.

### Connection Settings

| Setting | Value |
|---------|-------|
| **Connection Type** | PostgreSQL |
| **Host** | `aws-0-[REGION].pooler.supabase.com` |
| **Port** | `5432` **(Direct Connection - REQUIRED)** |
| **Database** | `postgres` |
| **User** | `postgres.[YOUR-PROJECT-REF]` |
| **Password** | `[YOUR-DATABASE-PASSWORD]` |
| **SSL Mode** | **Require** (MUST be enabled) |

> [!WARNING]
> **Do NOT use port 6543** - That's for Session Pooler. Always use **port 5432** for Direct Connection.

### Where to Find These Values

1. **Go to Supabase Dashboard** → Your Project
2. **Navigate to:** Settings → Database
3. **Connection String** section:
   - Click the dropdown that says "Method: Session pooler"
   - **Change it to: "Direct connection"**
4. You'll see the connection string with port **5432**:
   ```
   postgresql://postgres.[PROJECT-REF]:PASSWORD@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

### Example Connection String (Direct Connection)
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**✅ Benefits of Direct Connection:**
- Works on IPv4
- Compatible with Beekeeper Studio
- Standard PostgreSQL connection
- Simple and straightforward
- No connection pooling overhead

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name:** Scorpion Security Hub
   - **Database Password:** (save this - you'll need it!)
   - **Region:** Choose closest to you
5. Wait for project to be created (~2 minutes)

### Step 2: Run Migration SQL

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `server/src/db/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" or press `Ctrl+Enter`
6. Verify tables were created in **Table Editor**

### Step 3: Update Environment Variables

1. Copy `server/.env.example` to `server/.env`
2. **In Supabase Dashboard:**
   - Go to Settings → Database
   - Find "Connection String" section
   - **IMPORTANT:** Click dropdown and select **"Direct connection"** (NOT "Session pooler")
3. Fill in your Supabase credentials:

```env
# Direct Connection String (Port 5432)
# Get from: Settings → Database → Connection String → Direct connection
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Get from: Settings → API → Project URL
SUPABASE_URL=https://[PROJECT-REF].supabase.co

# Get from: Settings → API → Project API keys → anon public
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Get from: Settings → API → Project API keys → service_role
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!CAUTION]
> **Port MUST be 5432** (Direct Connection), NOT 6543 (Session Pooler)

### Step 4: Install Dependencies & Restart

```bash
cd server
npm install
npm start
```

---

## 🔧 Beekeeper Studio Setup

### Quick Connect (Direct Connection)

1. Open Beekeeper Studio
2. Click "New Connection"
3. Select "PostgreSQL"
4. **Fill in these details:**
   - **Host:** `aws-0-[REGION].pooler.supabase.com`
   - **Port:** `5432` ⚠️ **(MUST be 5432, NOT 6543)**
   - **User:** `postgres.[YOUR-PROJECT-REF]`
   - **Password:** `[YOUR-DATABASE-PASSWORD]`
   - **Database:** `postgres`
5. **IMPORTANT:** Enable SSL (check the SSL checkbox and set to "Require")
6. Click "Test Connection"
7. If successful, click "Connect"

> [!TIP]
> **How to get Direct Connection details from Supabase:**
> 1. Go to Settings → Database
> 2. Find "Connection String"
> 3. Click dropdown: Change from "Session pooler" to **"Direct connection"**
> 4. Copy the host, port (5432), and user from the displayed string

### Troubleshooting

**Connection Timeout:**
- Make sure SSL is enabled
- **Verify you're using port 5432** (Direct Connection), not 6543
- Check if you selected "Direct connection" in Supabase dashboard dropdown
- Verify your IP is not blocked by Supabase firewall

**Authentication Failed:**
- Double-check your database password
- Ensure username format is `postgres.[PROJECT-REF]`
- Password should NOT include brackets
- Make sure you copied from the correct connection string (Direct connection, not Session pooler)

**SSL Error:**
- SSL Mode must be set to "Require" or "Verify-Full"
- Do not use "Disable" or "Prefer"

**Wrong Port Error:**
- If you see connection refused on port 6543, you're using Session Pooler
- Switch to Direct Connection in Supabase UI and use port 5432

---

## 📋 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_super_admin BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  link_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing the Connection

### From Your Application

```bash
# In server directory
node src/db/test-connection.js
```

### Manual SQL Test

Run this in Supabase SQL Editor or Beekeeper Studio:

```sql
-- Check if super admin exists
SELECT id, username, email, role, is_super_admin 
FROM users 
WHERE username = 'Net13';

-- Should return 1 row with:
-- username: Net13
-- role: admin
-- is_super_admin: true
```

---

## 📝 Notes

- **Password Hash:** The super admin password is hashed with bcrypt (10 rounds)
- **JWT Secret:** Keep `JWT_SECRET` in `.env` - do NOT change it or all tokens will be invalidated
- **Service Role Key:** This is a PRIVATE key - never expose it in frontend code
- **Anon Key:** This is safe to use in frontend code
- **Direct Connection:** Port 5432 is the standard direct connection (currently configured)
- **Connection Pooler:** Port 6543 uses connection pooling (alternative option for high-traffic production)

---

## 🔒 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Service role key is never used in frontend
- [ ] Database password is strong and unique
- [ ] SSL is enabled for all connections
- [ ] Row Level Security (RLS) policies are enabled
- [ ] Super admin password has been changed from default

---

## 📞 Support

If you encounter issues:
1. Check Supabase Dashboard → Logs for errors
2. Verify all environment variables are set correctly
3. Ensure your IP is allowed in Supabase settings
4. Test connection with Beekeeper Studio first
5. Check server logs for detailed error messages

---

**Generated:** 2026-02-17  
**Project:** Scorpion Security Hub  
**Database:** Supabase PostgreSQL
