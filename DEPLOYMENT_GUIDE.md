# 🚀 Scorpion Security Hub - Deployment Guide

This guide covers multiple deployment options for your Scorpion Security Hub application.

## 📋 **Current Status**
✅ **Backend**: Node.js server with Supabase PostgreSQL  
✅ **Frontend**: Static HTML/CSS/JavaScript  
✅ **Database**: Supabase (PostgreSQL with RLS)  
✅ **Authentication**: Supabase Auth  

---

## 🌐 **Deployment Options**

### **Option 1: Vercel (Recommended - Free)**

**Best for**: Quick deployment, automatic HTTPS, global CDN

#### **Backend Deployment (Vercel)**
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Prepare for deployment**:
   ```bash
   cd server
   # Create vercel.json
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

#### **Frontend Deployment (Vercel)**
1. **Deploy frontend**:
   ```bash
   cd .. # Back to root
   vercel --prod
   ```

**Vercel Configuration** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

---

### **Option 2: Netlify (Great for Frontend)**

**Best for**: Static sites, form handling, edge functions

#### **Frontend Deployment**:
1. **Build configuration** (`netlify.toml`):
   ```toml
   [build]
     publish = "."
     command = "echo 'No build needed for static site'"

   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-url.vercel.app/api/:splat"
     status = 200
   ```

2. **Deploy**:
   - Connect GitHub repository to Netlify
   - Auto-deploy on push

---

### **Option 3: Railway (Full-Stack)**

**Best for**: Full-stack applications, databases, automatic scaling

#### **Setup**:
1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

---

### **Option 4: Heroku (Traditional PaaS)**

**Best for**: Established workflows, add-ons ecosystem

#### **Setup**:
1. **Create Procfile**:
   ```
   web: cd server && npm start
   ```

2. **Deploy**:
   ```bash
   heroku create scorpion-security-hub
   git push heroku main
   ```

---

### **Option 5: DigitalOcean App Platform**

**Best for**: Predictable pricing, managed infrastructure

#### **Configuration** (`.do/app.yaml`):
```yaml
name: scorpion-security-hub
services:
- name: api
  source_dir: /server
  github:
    repo: your-username/scorpion-security-hub
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: SUPABASE_URL
    value: ${SUPABASE_URL}
  - key: SUPABASE_ANON_KEY
    value: ${SUPABASE_ANON_KEY}
  - key: SUPABASE_SERVICE_ROLE_KEY
    value: ${SUPABASE_SERVICE_ROLE_KEY}
- name: web
  source_dir: /
  github:
    repo: your-username/scorpion-security-hub
    branch: main
  build_command: echo "Static site"
  run_command: echo "Static site"
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

---

## 🔧 **Pre-Deployment Checklist**

### **Environment Variables**
Ensure these are set in your deployment platform:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security
JWT_SECRET=your-secure-jwt-secret-here
BCRYPT_ROUNDS=12

# Server Configuration
NODE_ENV=production
PORT=3001

# CORS (Update with your domain)
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

### **Frontend Configuration**
Update API URLs in your JavaScript files for production:

```javascript
// In production, use your deployed API URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api'
  : 'http://localhost:30011/api';
```

---

## 🌍 **Domain & DNS Setup**

### **Custom Domain Configuration**:

1. **Purchase Domain** (Namecheap, GoDaddy, etc.)

2. **DNS Records**:
   ```
   Type: CNAME
   Name: www
   Value: your-app.vercel.app

   Type: A
   Name: @
   Value: 76.76.19.61 (Vercel IP)
   ```

3. **SSL Certificate**: Automatic with most platforms

---

## 🔒 **Security Considerations**

### **Production Security Checklist**:

- ✅ **Environment Variables**: Never commit secrets to Git
- ✅ **HTTPS Only**: Force SSL in production
- ✅ **CORS Configuration**: Restrict to your domains only
- ✅ **Rate Limiting**: Implement API rate limits
- ✅ **Input Validation**: Sanitize all user inputs
- ✅ **SQL Injection**: Use parameterized queries (Supabase handles this)
- ✅ **XSS Protection**: Sanitize HTML output
- ✅ **Authentication**: Secure JWT tokens
- ✅ **Row Level Security**: Enabled in Supabase

### **Supabase Security**:
```sql
-- Enable RLS on all tables (already done in migration)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_library ENABLE ROW LEVEL SECURITY;
-- ... etc
```

---

## 📊 **Monitoring & Analytics**

### **Recommended Tools**:

1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Error Tracking**: Sentry, LogRocket
3. **Analytics**: Google Analytics, Plausible
4. **Performance**: Lighthouse, WebPageTest

### **Health Check Endpoint**:
Your app includes: `GET /api/health`

---

## 🚀 **Quick Deploy Commands**

### **Vercel (Recommended)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd server
vercel --prod

# Deploy frontend
cd ..
vercel --prod
```

### **Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

### **Railway**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

---

## 🎯 **Post-Deployment Tasks**

1. **Test all functionality**:
   - User registration/login
   - Digital library operations
   - Research project management
   - Threat intelligence feeds
   - Admin dashboard

2. **Set up monitoring**:
   - Configure uptime checks
   - Set up error alerts
   - Monitor performance metrics

3. **Configure backups**:
   - Supabase automatic backups
   - Export important data regularly

4. **Update documentation**:
   - API documentation
   - User guides
   - Admin procedures

---

## 🆘 **Troubleshooting**

### **Common Issues**:

**CORS Errors**:
```javascript
// Update CORS_ORIGIN in .env
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

**Database Connection**:
```bash
# Test Supabase connection
node test-supabase.js
```

**Build Failures**:
```bash
# Check Node.js version compatibility
node --version  # Should be 16+ for most platforms
```

---

## 📞 **Support Resources**

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app

---

Your Scorpion Security Hub is ready for deployment! 🎉

Choose the platform that best fits your needs and follow the corresponding setup instructions above.