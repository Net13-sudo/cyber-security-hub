const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { supabaseDB, isSupabaseConfigured } = require('./supabase');

// SQLite fallback configuration
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const dbDir = path.dirname(dbPath);

// Ensure the data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let sqliteDB = null;

// Initialize SQLite as fallback
function initializeSQLite() {
    return new Promise((resolve, reject) => {
        sqliteDB = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('[SQLite] Error opening database:', err.message);
                reject(err);
            } else {
                console.log('[SQLite] Connected to fallback SQLite database at', dbPath);
                initializeSQLiteTables().then(resolve).catch(reject);
            }
        });
    });
}

function initializeSQLiteTables() {
    return new Promise((resolve, reject) => {
        sqliteDB.serialize(async () => {
            try {
                // Create users table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        email TEXT,
                        role TEXT DEFAULT 'user',
                        is_super_admin INTEGER DEFAULT 0,
                        two_factor_secret TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Create digital library table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS digital_library (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        type TEXT NOT NULL CHECK (type IN ('ebook', 'article', 'whitepaper', 'research')),
                        author TEXT NOT NULL,
                        description TEXT,
                        url TEXT,
                        file_path TEXT,
                        tags TEXT,
                        is_online INTEGER DEFAULT 1,
                        created_by INTEGER,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (created_by) REFERENCES users(id)
                    )
                `);

                // Create research projects table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS research_projects (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'completed', 'archived')),
                        type TEXT NOT NULL CHECK (type IN ('online', 'offline')),
                        lead_researcher TEXT NOT NULL,
                        description TEXT,
                        start_date DATE,
                        end_date DATE,
                        tags TEXT,
                        progress INTEGER DEFAULT 0,
                        created_by INTEGER,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (created_by) REFERENCES users(id)
                    )
                `);

                // Create research collaborators table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS research_collaborators (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        project_id INTEGER NOT NULL,
                        researcher_name TEXT NOT NULL,
                        role TEXT,
                        email TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (project_id) REFERENCES research_projects(id) ON DELETE CASCADE
                    )
                `);

                // Create threat intelligence table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS threat_intelligence (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        source TEXT NOT NULL,
                        title TEXT NOT NULL,
                        severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
                        type TEXT NOT NULL,
                        description TEXT,
                        iocs TEXT,
                        mitigation TEXT,
                        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        created_by INTEGER,
                        FOREIGN KEY (created_by) REFERENCES users(id)
                    )
                `);

                // Create incidents table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS incidents (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        description TEXT,
                        severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
                        status TEXT NOT NULL CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
                        assigned_to TEXT,
                        reported_by INTEGER,
                        reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (reported_by) REFERENCES users(id)
                    )
                `);

                // Create company information table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS company_info (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL DEFAULT 'Scorpion Security',
                        description TEXT,
                        website TEXT,
                        email TEXT,
                        phone TEXT,
                        address TEXT,
                        founded_year INTEGER,
                        employee_count INTEGER,
                        certifications TEXT,
                        services TEXT,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Create security metrics table
                sqliteDB.run(`
                    CREATE TABLE IF NOT EXISTS security_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        metric_name TEXT NOT NULL,
                        metric_value INTEGER NOT NULL,
                        metric_type TEXT NOT NULL,
                        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, async (err) => {
                    if (!err) {
                        // Insert default company information
                        sqliteDB.run(`
                            INSERT OR IGNORE INTO company_info (id, name, description, website, email, phone, founded_year, employee_count, certifications, services)
                            VALUES (1, 'Scorpion Security', 'Advanced cybersecurity solutions that protect, detect, and respond to threats before they impact your business.', 
                                    'https://scorpionsecurity.com', 'info@scorpionsecurity.com', '+1-800-SECURITY', 2009, 150,
                                    'CISSP,CISM,CEH,ISO 27001', 'Managed Security Services,Penetration Testing,Compliance & Risk,Incident Response,Threat Intelligence')
                        `);

                        // Seed the database with sample data (skip for faster initialization)
                        try {
                            // Skip automatic seeding - let create-admin script run separately
                            // const { seedDatabase } = require('./seed-data');
                            // await seedDatabase();
                            
                            // Create super admin (skip - let create-admin script handle this)
                            // const { createSuperAdmin } = require('./create-admin');
                            // await createSuperAdmin();
                        } catch (seedError) {
                            console.log('[SQLite] Seed data not available, continuing without seeding');
                        }
                    }
                    
                    console.log('[SQLite] All tables initialized successfully');
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Hybrid Database Class
class HybridDatabase {
    constructor() {
        this.useSupabase = isSupabaseConfigured;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            if (this.useSupabase) {
                console.log('[Database] Using Supabase PostgreSQL');
                const health = await supabaseDB.healthCheck();
                if (health.status !== 'connected') {
                    console.warn('[Database] Supabase health check failed, falling back to SQLite');
                    this.useSupabase = false;
                    await initializeSQLite();
                }
            } else {
                console.log('[Database] Using SQLite fallback');
                await initializeSQLite();
            }
            this.initialized = true;
        } catch (error) {
            console.error('[Database] Initialization error:', error);
            if (this.useSupabase) {
                console.log('[Database] Falling back to SQLite due to Supabase error');
                this.useSupabase = false;
                await initializeSQLite();
                this.initialized = true;
            }
        }
    }

    // Generic query method
    async query(sql, params = []) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            // For Supabase, we need to parse the SQL and convert to Supabase query
            // This is a simplified approach - in production, you'd want more sophisticated SQL parsing
            throw new Error('Direct SQL queries not supported with Supabase. Use table-specific methods.');
        } else {
            return new Promise((resolve, reject) => {
                sqliteDB.all(sql, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve({ rows });
                });
            });
        }
    }

    // Table-specific query method for Supabase compatibility
    async queryTable(table, options = {}) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.query(table, options);
        } else {
            // Convert options to SQL for SQLite
            let sql = `SELECT * FROM ${table}`;
            const params = [];

            if (options.filters) {
                const conditions = [];
                for (const [column, value] of Object.entries(options.filters)) {
                    conditions.push(`${column} = ?`);
                    params.push(value);
                }
                if (conditions.length > 0) {
                    sql += ` WHERE ${conditions.join(' AND ')}`;
                }
            }

            if (options.orderBy) {
                const { column, ascending = false } = options.orderBy;
                sql += ` ORDER BY ${column} ${ascending ? 'ASC' : 'DESC'}`;
            }

            if (options.limit) {
                sql += ` LIMIT ${options.limit}`;
            }

            return this.query(sql, params);
        }
    }

    // Run method (INSERT, UPDATE, DELETE)
    async run(sql, params = []) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            throw new Error('Direct SQL run not supported with Supabase. Use table-specific methods.');
        } else {
            return new Promise((resolve, reject) => {
                sqliteDB.run(sql, params, function(err) {
                    if (err) return reject(err);
                    resolve({ id: this.lastID, changes: this.changes });
                });
            });
        }
    }

    // Get single record
    async get(sql, params = []) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            throw new Error('Direct SQL get not supported with Supabase. Use table-specific methods.');
        } else {
            return new Promise((resolve, reject) => {
                sqliteDB.get(sql, params, (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });
        }
    }

    // Table-specific methods that work with both databases
    async insertRecord(table, data) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.insert(table, data);
        } else {
            const columns = Object.keys(data);
            const placeholders = columns.map(() => '?').join(', ');
            const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
            return await this.run(sql, Object.values(data));
        }
    }

    async updateRecord(table, id, data) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.update(table, id, data);
        } else {
            const columns = Object.keys(data);
            const setClause = columns.map(col => `${col} = ?`).join(', ');
            const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
            return await this.run(sql, [...Object.values(data), id]);
        }
    }

    async deleteRecord(table, id) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.delete(table, id);
        } else {
            const sql = `DELETE FROM ${table} WHERE id = ?`;
            return await this.run(sql, [id]);
        }
    }

    async getRecord(table, id, select = '*') {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.get(table, id, select);
        } else {
            const sql = `SELECT ${select} FROM ${table} WHERE id = ?`;
            return await this.get(sql, [id]);
        }
    }

    // User management methods
    async getUserByUsername(username) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.getUserByUsername(username);
        } else {
            return await this.get('SELECT * FROM users WHERE username = ?', [username]);
        }
    }

    async getUserByEmail(email) {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.getUserByEmail(email);
        } else {
            return await this.get('SELECT * FROM users WHERE email = ?', [email]);
        }
    }

    // Health check
    async healthCheck() {
        if (!this.initialized) {
            await this.init();
        }

        if (this.useSupabase) {
            return await supabaseDB.healthCheck();
        } else {
            try {
                await this.get('SELECT 1');
                return { status: 'connected', message: 'SQLite connection healthy', database: 'sqlite' };
            } catch (error) {
                return { status: 'error', message: error.message, database: 'sqlite' };
            }
        }
    }

    // Get database type
    getDatabaseType() {
        return this.useSupabase ? 'supabase' : 'sqlite';
    }

    // Close database connections
    async close() {
        if (sqliteDB) {
            return new Promise((resolve) => {
                sqliteDB.close((err) => {
                    if (err) {
                        console.error('[SQLite] Error closing database:', err);
                    } else {
                        console.log('[SQLite] Database connection closed');
                    }
                    resolve();
                });
            });
        }
    }
}

// Create singleton instance
const db = new HybridDatabase();

// Export both the hybrid database and individual methods for backward compatibility
module.exports = {
    db,
    // Backward compatibility methods
    query: (sql, params) => db.query(sql, params),
    run: (sql, params) => db.run(sql, params),
    get: (sql, params) => db.get(sql, params),
    // New table-specific methods
    queryTable: (table, options) => db.queryTable(table, options),
    insertRecord: (table, data) => db.insertRecord(table, data),
    updateRecord: (table, id, data) => db.updateRecord(table, id, data),
    deleteRecord: (table, id) => db.deleteRecord(table, id),
    getRecord: (table, id, select) => db.getRecord(table, id, select),
    // Utility methods
    healthCheck: () => db.healthCheck(),
    getDatabaseType: () => db.getDatabaseType(),
    close: () => db.close()
};
