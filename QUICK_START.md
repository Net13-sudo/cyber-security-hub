# 🦂 Scorpion Security Hub - Quick Start Guide

## Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

## Setup Instructions

### Step 1: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Go back to root
cd ..
```

### Step 2: Start the Server

```bash
cd server

# For development with auto-reload
npm run dev

# Or for production
npm start
```

The server will start on `http://localhost:3001`

### Step 3: Initialize the Database & Create Admin User

In a new terminal (with server still running):

```bash
cd server

# Create admin user
npm run create-admin
```

This creates a super admin account:
- **Username:** admin
- **Password:** ScorpionAdmin2024!
- **Email:** admin@scorpionsecurity.com

⚠️ **Change this password after first login!**

### Step 4: Access the Application

1. **Frontend (Public):** Open `index.html` in your browser
   - Open with Live Server or any HTTP server
   - Or navigate to `http://localhost:3001/` if serving from Node

2. **Login:** Go to `pages/login.html`
   - Sign up with a new account, or
   - Use admin credentials to test admin dashboard

3. **Admin Dashboard:** `pages/admin_dashboard.html`
   - Only accessible with admin account
   - Manage users and view statistics

## Configuration

### Environment Variables (server/.env)

The `.env` file is already configured for local development:

```dotenv
PORT=3001
NODE_ENV=development
JWT_SECRET=scorpion_security_secret_key_2024_change_this_in_production
DB_PATH=./src/db/database.sqlite
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500,http://localhost:3001
```

**For production**, update:
- `JWT_SECRET` - Use a secure random string
- `NODE_ENV` - Set to "production"
- `SUPABASE_*` - Configure Supabase PostgreSQL instead of SQLite

## API Endpoints

### Authentication
- `POST /api/auth/register` - Public user registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/change-password` - Change password (requires auth)

### Admin (requires super admin authentication)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Dashboard statistics

### Threat Intelligence
- `GET /api/threat-intelligence/feeds` - List threat feeds
- `GET /api/threat-intelligence/feeds/:id` - Get threat details

### Incidents
- `GET /api/incidents` - List incidents
- `GET /api/incidents/:id` - Get incident details
- `POST /api/incidents` - Create incident
- `PATCH /api/incidents/:id/status` - Update incident status

### Digital Library
- `GET /api/library` - List library items
- `GET /api/library/:id` - Get library item
- `POST /api/library` - Create library item
- `PUT /api/library/:id` - Update library item

### Research Projects
- `GET /api/research` - List projects
- `GET /api/research/:id` - Get project details
- `POST /api/research` - Create project

### AI Chat
- `POST /api/ai/chat` - Chat with AI (requires message text)

## Troubleshooting

### Server won't start
```bash
# Check if port 3001 is already in use
# The server will automatically try port 3002, 3003, etc.
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows
```

### Database errors
```bash
# Reset database (deletes all data)
rm server/src/db/database.sqlite

# Start server again to reinitialize
npm run dev
```

### Login fails
1. Make sure server is running on port 3001
2. Check browser console for API errors
3. Verify `.env` file has correct configuration
4. Try creating a new user via signup

### Admin dashboard won't load
1. Ensure you're logged in with an admin account
2. Check browser console for errors
3. Verify admin role in database

### CORS errors
The server allows requests from:
- `http://localhost:3000`
- `http://127.0.0.1:5500` (Live Server default)
- `http://localhost:3001`

If running from a different port, add it to `CORS_ORIGIN` in `.env`

## Development

### Project Structure

```
server/
├── src/
│   ├── index.js              # Main server entry
│   ├── db/
│   │   ├── database.js       # Database wrapper (SQLite/Supabase)
│   │   ├── supabase.js       # Supabase client
│   │   └── create-admin.js   # Admin setup script
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── admin.js          # Admin routes
│   │   └── ...other routes
│   └── services/
│       └── ai.js             # AI service
├── .env                      # Environment configuration
└── package.json              # Dependencies

frontend/
├── index.html                # Homepage
├── pages/                    # HTML pages
│   ├── login.html
│   ├── admin_dashboard.html
│   └── ...other pages
└── js/                       # JavaScript files
    ├── config.js             # Frontend configuration
    ├── login-logic.js        # Login/signup logic
    ├── admin-dashboard.js    # Admin dashboard logic
    └── ...other scripts
```

## Next Steps

1. **Database:** Switch to Supabase PostgreSQL for production
2. **Security:** Update JWT_SECRET and SESSION_SECRET
3. **Authentication:** Implement proper 2FA setup
4. **Deployment:** Deploy to DigitalOcean, Heroku, or Railway
5. **Frontend:** Build with React/Vue for better UX

## Support

For issues or questions, check:
- Server logs in terminal
- Browser console (F12)
- API responses in Network tab
- `.env` configuration

