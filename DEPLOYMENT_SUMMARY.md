# 🚀 RENDER DEPLOYMENT GUIDE
# Scorpion Security Hub - Complete Deployment Instructions

## ✅ Deployment Ready Checklist

- ✅ Project structure optimized for Render
- ✅ Procfile configured
- ✅ render.yaml prepared
- ✅ .gitignore set up
- ✅ All dependencies in package.json
- ✅ Database auto-initialization ready
- ✅ Admin setup script ready

## 📋 Quick Deployment Steps

### 1️⃣ Prepare GitHub Repository

```bash
# Add all files
git add .

# Commit
git commit -m "🚀 Ready for Render deployment"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Scorpion-Security-Hub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2️⃣ Create Render Account

- Visit https://render.com
- Sign up (GitHub recommended)
- Click "Authorize render-vc"

### 3️⃣ Deploy Backend Service

1. In Render Dashboard: Click **"+ New"** → **"Web Service"**
2. Select your GitHub repository
3. Fill in the form:
   - **Name:** `scorpion-security-api`
   - **Environment:** `Node`
   - **Region:** `Oregon` (or nearest)
   - **Branch:** `main`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** `Free`

4. Click **"Advanced"** and add Environment Variables:

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| PORT | 3001 |
| JWT_SECRET | *Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| BCRYPT_ROUNDS | 12 |
| CORS_ORIGIN | (Update after frontend deploys) |

5. Click **"Create Web Service"**
6. Wait for deployment (2-3 minutes)

### 4️⃣ Initialize Admin User

Once backend is deployed:

1. Go to your service in Render dashboard
2. Click **"Shell"** tab at the top
3. Run these commands:

```bash
cd server
npm run create-admin
```

Note the credentials:
- Username: `admin`
- Password: `ScorpionAdmin2024!`
- Email: `admin@scorpionsecurity.com`

⚠️ **Change password after first login!**

### 5️⃣ Deploy Frontend

1. Click **"+ New"** → **"Static Site"**
2. Select same GitHub repository
3. Fill in:
   - **Name:** `scorpion-security-hub`
   - **Region:** `Oregon`
   - **Build Command:** Leave empty
   - **Publish Directory:** `.` (current directory)

4. Click **"Create Static Site"**
5. Wait for deployment

### 6️⃣ Configure Frontend for Production

After frontend is deployed, Render will show your frontned URL (e.g., `https://scorpion-security-hub.onrender.com`)

Update `js/config.js`:

```javascript
const CONFIG = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    get API_BASE_URL() {
        // For production on Render
        if (!this.isDevelopment) {
            return 'https://scorpion-security-api.onrender.com/api';
        }
        // For local development
        return `${window.location.origin}/api`;
    },

    get AUTH_API_URL() {
        return `${this.API_BASE_URL}/auth`;
    },
    // ... rest of config
};
```

### 7️⃣ Update Backend CORS

Go back to backend service in Render:

1. Click "Environment" tab
2. Edit `CORS_ORIGIN` variable
3. Set to: `https://scorpion-security-hub.onrender.com`
4. Click "Save"
5. Service will auto-restart

### 8️⃣ Redeploy Frontend

In frontend service:

1. Click **"Manual Deploy"** → **"Trigger Deploy"**
2. Wait for redeploy (1-2 minutes)

## 🌐 Live Application URLs

After deployment, your application will be available at:

- **Frontend:** `https://scorpion-security-hub.onrender.com`
- **Backend API:** `https://scorpion-security-api.onrender.com/api`
- **Health Check:** `https://scorpion-security-api.onrender.com/api/health`

### Admin Credentials
```
Username: admin
Password: ScorpionAdmin2024!
Email: admin@scorpionsecurity.com
```

⚠️ Change password immediately!

## 📊 Monitoring

Access logs and metrics:

1. Go to service in Render dashboard
2. View **"Logs"** in real-time
3. Monitor **"Metrics"** for performance
4. Check **"Events"** for deployment info

## 🔄 Update Your Application

Push changes to GitHub and Render auto-redeploys:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Render automatically detects and redeploys both services!
```

## 🆘 Troubleshooting

### Service shows "Deploy failed"
- Check **Logs** tab for errors
- Ensure `npm install` works locally
- Verify all dependencies in `package.json`

### Login fails
- Check backend logs for errors
- Verify admin user was created
- Ensure CORS_ORIGIN matches your frontend URL

### Frontend shows API errors
- Check `js/config.js` has correct API URL
- Verify backend service is running
- Check CORS_ORIGIN in backend environment

### Database errors
- Database auto-initializes on first deploy
- Check logs for initialization errors
- To reset: delete service and redeploy

## 💾 Database & Backups

SQLite database persists in:
- `/opt/render/project/server/src/db/database.sqlite`

For production with more data:
1. Upgrade to Paid tier
2. Add PostgreSQL database
3. Update connection string

## 🔐 Production Security

Before going live:

1. ✅ Change JWT_SECRET to strong random value
2. ✅ Change admin password
3. ✅ Update CORS_ORIGIN to your domain only
4. ✅ Set NODE_ENV=production
5. ✅ Use HTTPS (Render handles automatically)

## 📱 Custom Domain (Optional)

1. In Render, go to service settings
2. Under "Custom Domain", add your domain
3. Update DNS records as shown
4. Update `CORS_ORIGIN` if changing domain

## 🆙 Upgrade Path

Free tier limitations:
- ⏸️ Service spins down after 15 min inactivity
- 💾 Limited storage
- 📊 Limited bandwidth

To maintain active service:
- Upgrade to Paid tier ($7/month minimum)
- Services stay always-on
- Full performance

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Static Site Guide](https://render.com/docs/deploy-static-site)

## 🎉 Success!

Your Scorpion Security Hub is now live on Render! 

### What's Working:
- ✅ Public signup and login
- ✅ Admin dashboard
- ✅ All API endpoints
- ✅ Database persistence
- ✅ Auto HTTPS/SSL

### Next Steps:
1. Test all features
2. Set up custom domain
3. Monitor logs and performance
4. Plan upgrade when needed

**Congratulations on deploying! 🚀**
