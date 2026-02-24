# 🚀 Deploy Scorpion Security Hub to Render

## What is Render?
Render is a modern cloud platform that:
- ✅ Supports Node.js applications
- ✅ Provides free tier with auto-deployment
- ✅ Includes PostgreSQL database (free)
- ✅ SSL/TLS certificates included
- ✅ Easy GitHub integration
- ✅ Automatic deploys on git push

## Prerequisites
1. GitHub account with the project pushed
2. Render.com account (free)
3. Environment variables ready

## Step 1: Push to GitHub

```bash
# If not already on GitHub
git init
git add .
git commit -m "Initial commit - ready for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/Scorpion-Security-Hub.git
git push -u origin main
```

## Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account (recommended)
3. Click "Authorize render-vc"

## Step 3: Create Web Service (Backend)

### Option A: Using Dashboard (Easiest)
1. Click **"+ New"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in details:
   - **Name:** `scorpion-security-hub-api`
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free
4. Add Environment Variables:
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=<generate-strong-random-string>
   BCRYPT_ROUNDS=12
   CORS_ORIGIN=https://scorpion-security-hub.onrender.com
   ```
5. Click **"Create Web Service"**

### Option B: Using Render.yaml (Advanced)
1. Skip dashboard and use the `render.yaml` in repository
2. Render will auto-detect and deploy

## Step 4: Deploy Frontend (Static Site)

### Create Render Static Site
1. Click **"+ New"** → **"Static Site"**
2. Connect your GitHub repository
3. Fill in details:
   - **Name:** `scorpion-security-hub`
   - **Publish Directory:** Leave blank or `.`
   - **Build Command:** Leave empty (optional)
4. Click **"Create Static Site"**

Render will give you a URL like: `https://scorpion-security-hub.onrender.com`

## Step 5: Update Frontend Configuration

After frontend is deployed, update `js/config.js`:

```javascript
const CONFIG = {
    isDevelopment: false,
    
    get API_BASE_URL() {
        return 'https://scorpion-security-hub-api.onrender.com/api';
    },
    
    get AUTH_API_URL() {
        return `${this.API_BASE_URL}/auth`;
    },
    // ... rest of config
};
```

Then push the change:
```bash
git add js/config.js
git commit -m "Update API URL for Render deployment"
git push
```

Render will auto-redeploy!

## Step 6: Initialize Database & Admin User

### Connect to Backend Service
1. Go to Render dashboard
2. Find your backend service: `scorpion-security-hub-api`
3. Click on it
4. Go to **"Shell"** tab
5. Run:
   ```bash
   cd server && npm run create-admin
   ```

This creates the admin user:
- Username: `admin`
- Password: `ScorpionAdmin2024!`
- Email: `admin@scorpionsecurity.com`

## Step 7: Access Your Application

- **Frontend:** `https://scorpion-security-hub.onrender.com`
- **API:** `https://scorpion-security-hub-api.onrender.com/api`
- **Health Check:** `https://scorpion-security-hub-api.onrender.com/api/health`

### Login Credentials
- Username: `admin`
- Password: `ScorpionAdmin2024!`

⚠️ **Change password after first login!**

## Step 8: Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click **"Settings"**
3. Under **"Custom Domain"**, add your domain
4. Follow DNS setup instructions

## Monitoring & Logs

1. Go to Render dashboard
2. Click your service
3. View **"Logs"** in real-time
4. Check **"Metrics"** for performance

## Updating Your Application

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically detect and redeploy!

## Environment Variables Reference

| Variable | Value | Notes |
|----------|-------|-------|
| NODE_ENV | production | Set for production |
| PORT | 3001 | Render assigns automatically |
| JWT_SECRET | Strong random string | Change from default |
| BCRYPT_ROUNDS | 12 | Security level |
| CORS_ORIGIN | Frontend URL | Allow requests from frontend |
| SUPABASE_URL | (optional) | For PostgreSQL instead of SQLite |
| SUPABASE_ANON_KEY | (optional) | For Supabase |
| SUPABASE_SERVICE_ROLE_KEY | (optional) | For Supabase |

## Troubleshooting

### Service won't start
1. Check **Logs** tab in Render
2. Ensure all npm scripts exist
3. Make sure dependencies are installed
4. Check environment variables

### Database errors
1. First deployment initializes SQLite database
2. Database persists in `/opt/render/project/server/src/db`
3. If corrupted, delete and Render will recreate on restart

### CORS errors
1. Update `CORS_ORIGIN` in environment variables
2. Must be exact domain URL
3. Redeploy after update

### Frontend can't reach API
1. Verify API URL in `js/config.js`
2. Check `CORS_ORIGIN` includes frontend domain
3. Test with API health endpoint

### Login fails
1. Check server logs for errors
2. Verify admin user was created
3. Confirm credentials are correct
4. Check token is stored in localStorage

## Production Best Practices

### Security Updates
1. Change JWT_SECRET to strong random string
2. Change admin password after first login
3. Use HTTPS (Render handles this automatically)
4. Update CORS_ORIGIN to only allow your domain

### Database
1. For production, switch to PostgreSQL (available on Render)
2. Or backup SQLite database regularly
3. Monitor database size

### Monitoring
1. Set up alerts for service failures
2. Monitor logs for errors
3. Check API response times
4. Track database usage

### Backups
1. Export database regularly
2. Keep git history
3. Store backups separately

## Scaling to Production

When you outgrow free tier:

### Upgrade to Paid Tier
1. More RAM and CPU
2. Persistent storage
3. Priority support
4. Recommended when > 1000 users

### Switch Database
1. Migrate from SQLite to PostgreSQL
2. Render provides PostgreSQL service
3. Update connection string in .env

### Add Services
1. Add background jobs service
2. Add cron jobs for maintenance
3. Add paid dyno for stability

## Support & Resources

- Render Docs: https://render.com/docs
- Node.js Guide: https://render.com/docs/deploy-node-express-app
- Database Setup: https://render.com/docs/databases

## Next Steps

1. ✅ Verified deployment setup
2. ✅ Created necessary files
3. ✅ Ready to deploy!

**Happy deploying! 🚀**
