# 🦂 Scorpion Security Hub - Database & Connection Fixes

## ✅ Completed Fixes

### 1. **Database Configuration**
- ✅ Created `.env` file with proper environment variables
- ✅ Configured SQLite as fallback database with path: `./src/db/database.sqlite`
- ✅ Maintained Supabase configuration for production use
- ✅ Added SESSION_SECRET for session management
- ✅ Proper JWT_SECRET configuration

### 2. **Authentication & Registration**
- ✅ Fixed public registration endpoint (`POST /api/auth/register`)
  - Now accepts: `username`, `password`, `email`, `firstName`, `lastName`
  - Returns user data and JWT token
- ✅ Created admin-only registration endpoint (`POST /api/auth/admin/register`)
  - Requires super admin authentication
  - Includes 2FA setup for admin users
- ✅ Fixed login redirection logic
  - Stores `authToken`, `username`, and `userRole` in localStorage
  - Redirects admin users to admin dashboard
  - Redirects regular users to home page

### 3. **Frontend-Backend Connection**
- ✅ Created centralized API configuration (`js/config.js`)
  - Dynamic API base URL detection
  - Exports `SCORPION_CONFIG` to global window object
  - Provides utility functions for API calls
- ✅ Updated all JavaScript files to use dynamic API configuration:
  - `admin-dashboard.js` - Uses `window.SCORPION_CONFIG.API_BASE_URL`
  - `incident-response.js` - Falls back to http://localhost:3001/api
  - `threat-intelligence.js` - Uses config with fallback
  - `digital-library.js` - Uses config with fallback
  - `ai-widget.js` - Uses config with fallback
  - `login-logic.js` - Uses `SCORPION_CONFIG.AUTH_API_URL`

### 4. **HTML Page Configuration**
- ✅ Added `js/config.js` to all pages before specific JavaScript files:
  - `pages/admin_dashboard.html` - Now loads config.js before admin-dashboard.js
  - `pages/digital_library.html` - Now loads config.js before digital-library.js
  - `pages/threat_intelligence_center.html` - Now loads config.js before threat-intelligence.js
  - `pages/incident_response_center.html` - Now loads config.js before incident-response.js
  - `pages/research_projects.html` - Now loads config.js before research-projects.js
  - `pages/login.html` - Config loads before login-logic.js

### 5. **Admin Dashboard Fixes**
- ✅ Fixed authentication check to verify `user` object exists
- ✅ Updated redirect path to use correct login page location
- ✅ Admin dashboard now requires proper admin role verification
- ✅ Statistics endpoint correctly protected with super admin middleware

### 6. **Port Number Fixes (Previous)**
- ✅ Fixed all hardcoded `30011` port references to `3001`
- ✅ All API endpoints now use correct server port

### 7. **Deployment Files Cleanup**
- ✅ Removed Netlify deployment files (netlify.toml, netlify/ directory)
- ✅ Removed Railway deployment files (nixpacks.toml)
- ✅ Removed serverless-http dependency from package.json

### 8. **Homepage Fixes**
- ✅ Fixed invalid `max-sm` Tailwind class
- ✅ Removed unnecessary admin scripts from public homepage
- ✅ Updated footer links to point to valid pages

## 🚀 Server Setup & Database Initialization

### Step 1: Install Dependencies
```bash
cd server
npm install
```

### Step 2: Start Server
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Server will start on `http://localhost:3001`

### Step 3: Initialize Admin User
```bash
# In a new terminal (with server running)
cd server
npm run create-admin
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `ScorpionAdmin2024!`
- Email: `admin@scorpionsecurity.com`

⚠️ **Change password after first login!**

## 📋 API Endpoints Available

### Authentication
```
POST /api/auth/register       - Public sign up
POST /api/auth/login          - User login
POST /api/auth/logout         - User logout
POST /api/auth/verify-token   - Verify JWT
POST /api/auth/change-password - Change password (auth required)
```

### Admin Operations (requires super admin auth)
```
GET  /api/admin/users         - List all users
GET  /api/admin/users/:id     - Get user details
PATCH /api/admin/users/:id/role - Update user role
DELETE /api/admin/users/:id   - Delete user
GET  /api/admin/stats         - Dashboard statistics
```

### Threat Intelligence
```
GET /api/threat-intelligence/feeds    - List threats
GET /api/threat-intelligence/feeds/:id - Get threat details
```

### Incidents
```
GET  /api/incidents           - List incidents
GET  /api/incidents/:id       - Get incident
POST /api/incidents           - Create incident
PATCH /api/incidents/:id/status - Update incident
```

### Digital Library
```
GET  /api/library             - List items
GET  /api/library/:id         - Get item
POST /api/library             - Create item
PUT  /api/library/:id         - Update item
```

### Research Projects
```
GET  /api/research            - List projects
GET  /api/research/:id        - Get project
POST /api/research            - Create project
```

### AI Chat
```
POST /api/ai/chat             - Chat with AI
```

### Health Check
```
GET /api/health               - Server status
```

## 🔐 Authentication Flow

### User Registration
1. User fills signup form on `pages/login.html`
2. Frontend sends to `POST /api/auth/register`
3. Server creates user in database
4. After signup, user redirected to login

### User Login
1. User enters credentials on login page
2. Frontend sends to `POST /api/auth/login`
3. Server validates credentials
4. Returns JWT token and user data
5. Frontend stores in localStorage:
   - `authToken` - JWT token
   - `user` - User object (JSON)
   - `username` - Username
   - `userRole` - User role

### Admin Authentication
1. Super admin logs in with admin credentials
2. Receives JWT with `is_super_admin: true`
3. Can access `/api/admin/*` endpoints
4. Redirected to `pages/admin_dashboard.html`

## 🌐 Frontend Access

### Public Pages
- `index.html` - Homepage
- `pages/login.html` - Login/Signup
- `pages/about.html` - About page
- `pages/contact.html` - Contact page
- `pages/portfolio.html` - Case studies
- etc.

### Protected Pages (require login)
- `pages/threat_intelligence_center.html` - Threat data
- `pages/incident_response_center.html` - Incident management
- `pages/digital_library.html` - Knowledge base
- `pages/research_projects.html` - Research
- `pages/admin_dashboard.html` - Admin only
- etc.

## 🔧 Environment Configuration

### Development (.env)
```dotenv
PORT=3001
NODE_ENV=development
JWT_SECRET=104c496c-f9e6-4213-b231-b167185a6f4a
DB_PATH=./src/db/database.sqlite
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500,http://localhost:3001
```

### Production (Update before deploying)
```dotenv
PORT=3001
NODE_ENV=production
JWT_SECRET=<use strong random string>
SUPABASE_URL=<your supabase url>
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

## 🧪 Testing the Connection

### 1. Start Server
```bash
cd server
npm run dev
```

### 2. Test Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "scorpion-security-hub",
  "version": "1.0.0",
  "backend": "node"
}
```

### 3. Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 4. Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@scorpionsecurity.com",
    "password": "ScorpionAdmin2024!"
  }'
```

Expected response includes `token` and `user` data.

### 5. Test Admin Access
```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer <token_from_login>"
```

## 📝 Notes

- Database automatically initializes on first server start
- Admin user must be created with `npm run create-admin`
- All API calls require proper CORS headers (handled by server)
- JWT tokens expire after 24 hours
- SQLite database stored at `server/src/db/database.sqlite`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Errors
```bash
# Reset database (deletes all data)
rm server/src/db/database.sqlite
npm run dev  # Will reinitialize
```

### Login Issues
- Verify `.env` configuration
- Check server is running on port 3001
- Check browser console for API errors
- Verify user credentials

### Admin Dashboard Won't Load
- Ensure logged in with admin account
- Check browser console
- Verify JWT token is stored in localStorage

