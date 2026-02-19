-- Users table with 2FA and Admin support
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'super_admin'
  is_super_admin BOOLEAN DEFAULT 0,
  two_factor_secret VARCHAR(100),
  is_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects/Portfolio table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  link_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
