# 🦂 Production Environment Configuration Template
# Copy values from this file to Render environment variables

# =====================================================
# CRITICAL - CHANGE THESE FOR PRODUCTION
# =====================================================

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=YOUR_SECURE_RANDOM_STRING_HERE

# Change admin password after first login!
# Default is: ScorpionAdmin2024!

# =====================================================
# RENDER DEPLOYMENT CONFIGURATION
# =====================================================

# Environment
NODE_ENV=production
PORT=3001

# Database (SQLite for free tier, or use Supabase)
# DB_PATH will be automatically set to /opt/render/project/server/src/db/database.sqlite

# =====================================================
# CORS - MUST MATCH YOUR FRONTEND URL
# =====================================================

# Replace with your actual Render domain
# Example: https://scorpion-security-hub.onrender.com
CORS_ORIGIN=https://scorpion-security-hub.onrender.com

# =====================================================
# SECURITY
# =====================================================

BCRYPT_ROUNDS=12
SESSION_SECRET=YOUR_SECURE_SESSION_SECRET_HERE

# =====================================================
# OPTIONAL - SUPABASE (for production database)
# =====================================================

# If upgrading from SQLite to PostgreSQL:
# SUPABASE_URL=your-supabase-url
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# =====================================================
# OPTIONAL - AI SERVICES
# =====================================================

# OPENAI_API_KEY=your-openai-key
# PYTHON_AI_URL=http://your-ai-service:8000

# =====================================================
# OPTIONAL - EMAIL (for notifications)
# =====================================================

# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# =====================================================
# SETUP INSTRUCTIONS
# =====================================================

# 1. Generate strong secrets:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Copy all values to Render dashboard:
#    - Go to your service
#    - Click "Environment"
#    - Add each variable

# 3. Create admin user:
#    - Go to "Shell" tab
#    - Run: cd server && npm run create-admin

# 4. Change admin password after first login!

# 5. Update CORS_ORIGIN after frontend deployment

# =====================================================
