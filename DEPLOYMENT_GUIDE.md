# 🚀 Scorpion Security Hub - Deployment Guide

This guide covers deployment options for your Scorpion Security Hub application using **DigitalOcean App Platform** and **Vercel**.

## 📋 **Current Status**
✅ **Backend**: Node.js server with Supabase PostgreSQL  
✅ **Frontend**: Static HTML/CSS/JavaScript  
✅ **Database**: Supabase (PostgreSQL with RLS)  
✅ **Authentication**: Supabase Auth  
✅ **Navigation**: Dynamic navigation system  

---

## 🌐 **Deployment Options**

### **Option 1: DigitalOcean App Platform (Recommended)**

**Best for**: Full-stack applications, predictable pricing, managed infrastructure

#### **Features**:
- ✅ Full-stack deployment (frontend + backend)
- ✅ Automatic SSL certificates
- ✅ Built-in monitoring and alerts
- ✅ Easy scaling and management
- ✅ Custom domains support
- ✅ Predictable pricing

#### **Quick Deploy**:
```bash
# Run the deployment script
node deploy-digitalocean.js
```

#### **Manual Setup**:
1. **Install DigitalOcean CLI**:
   ```bash
   # Visit: https://docs.digitalocean.com/reference/doctl/how-to/install/
   ```

2. **Authenticate**:
   ```bash
   doctl auth init
   ```

3. **Deploy**:
   ```bash
   doctl apps create --spec .do/app.yaml
   ```

4. **Set Environment Variables** in DigitalOcean dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`

---

### **Option 2: Vercel (Serverless)**

**Best for**: Serverless deployment, automatic scaling, global CDN

#### **Features**:
- ✅ Serverless functions for API
- ✅ Global CDN for frontend
- ✅ Automatic deployments from Git
- ✅ Built-in analytics
- ✅ Zero-config deployment
- ✅ Free tier available

#### **Quick Deploy**:
```bash
# Run the deployment script
node deploy-vercel.js
```

#### **Manual Setup**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add JWT_SECRET production
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
```

### **Repository Setup**
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Update Repository URLs** in configuration files

---

## 🌍 **Domain & DNS Setup**

### **DigitalOcean Custom Domain**:
1. **Add Domain** in DigitalOcean App settings
2. **Update DNS Records**:
   ```
   Type: CNAME
   Name: www
   Value: your-app.ondigitalocean.app

   Type: A
   Name: @
   Value: [DigitalOcean IP]
   ```

### **Vercel Custom Domain**:
1. **Add Domain** in Vercel project settings
2. **Update DNS Records**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

---

## 🔒 **Security Considerations**

### **Production Security Checklist**:

- ✅ **Environment Variables**: Never commit secrets to Git
- ✅ **HTTPS Only**: Force SSL in production
- ✅ **CORS Configuration**: Restrict to your domains only
- ✅ **Rate Limiting**: Implement API rate limits
- ✅ **Input Validation**: Sanitize all user inputs
- ✅ **Authentication**: Secure JWT tokens
- ✅ **Row Level Security**: Enabled in Supabase

### **CORS Configuration**:
Update your server CORS settings for production:
```javascript
// In server/src/index.js
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://your-app.ondigitalocean.app',
    'https://your-app.vercel.app'
  ]
};
```

---

## 📊 **Monitoring & Analytics**

### **DigitalOcean Monitoring**:
- Built-in app metrics
- CPU and memory usage
- Request/response monitoring
- Custom alerts

### **Vercel Analytics**:
- Built-in web analytics
- Function execution metrics
- Performance insights
- Error tracking

### **Additional Tools**:
1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Error Tracking**: Sentry, LogRocket
3. **Performance**: Lighthouse, WebPageTest

---

## 🚀 **Deployment Commands Summary**

### **DigitalOcean**:
```bash
# Quick deploy
node deploy-digitalocean.js

# Manual deploy
doctl apps create --spec .do/app.yaml
```

### **Vercel**:
```bash
# Quick deploy
node deploy-vercel.js

# Manual deploy
vercel --prod
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
// Update CORS_ORIGIN in environment variables
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

**Database Connection**:
```bash
# Test Supabase connection
node server/test-supabase.js
```

**Build Failures**:
```bash
# Check Node.js version compatibility
node --version  # Should be 16+ for most platforms
```

### **DigitalOcean Specific**:
- Check app logs in dashboard
- Verify environment variables
- Monitor resource usage

### **Vercel Specific**:
- Check function logs
- Verify serverless function limits
- Monitor cold start times

---

## 📞 **Support Resources**

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

Your Scorpion Security Hub is ready for deployment! Choose between DigitalOcean for traditional hosting or Vercel for serverless deployment. 🎉