const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role for server-side operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Anonymous key for client-side operations

// Create Supabase clients
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? 
    createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }) : null;

const supabaseClient = supabaseUrl && supabaseAnonKey ? 
    createClient(supabaseUrl, supabaseAnonKey) : null;

// Database helper functions using Supabase
class SupabaseDB {
    constructor() {
        this.client = supabaseAdmin;
        this.isConnected = !!this.client;
        
        if (!this.isConnected) {
            console.warn('[Supabase] Not configured. Using fallback SQLite database.');
        } else {
            console.log('[Supabase] Connected successfully');
        }
    }

    // Generic query method
    async query(table, options = {}) {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            let query = this.client.from(table);

            // Apply select
            if (options.select) {
                query = query.select(options.select);
            } else {
                query = query.select('*');
            }

            // Apply filters
            if (options.filters) {
                for (const [column, value] of Object.entries(options.filters)) {
                    if (Array.isArray(value)) {
                        query = query.in(column, value);
                    } else {
                        query = query.eq(column, value);
                    }
                }
            }

            // Apply ordering
            if (options.orderBy) {
                const { column, ascending = false } = options.orderBy;
                query = query.order(column, { ascending });
            }

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            // Apply range
            if (options.range) {
                const { from, to } = options.range;
                query = query.range(from, to);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            return { rows: data || [] };
        } catch (error) {
            console.error(`[Supabase] Query error on table ${table}:`, error);
            throw error;
        }
    }

    // Insert method
    async insert(table, data) {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            const { data: result, error } = await this.client
                .from(table)
                .insert(data)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return { id: result.id, changes: 1 };
        } catch (error) {
            console.error(`[Supabase] Insert error on table ${table}:`, error);
            throw error;
        }
    }

    // Update method
    async update(table, id, data) {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            const { data: result, error } = await this.client
                .from(table)
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return { id: result.id, changes: 1 };
        } catch (error) {
            console.error(`[Supabase] Update error on table ${table}:`, error);
            throw error;
        }
    }

    // Delete method
    async delete(table, id) {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            const { error } = await this.client
                .from(table)
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            return { changes: 1 };
        } catch (error) {
            console.error(`[Supabase] Delete error on table ${table}:`, error);
            throw error;
        }
    }

    // Get single record
    async get(table, id, select = '*') {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            const { data, error } = await this.client
                .from(table)
                .select(select)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`[Supabase] Get error on table ${table}:`, error);
            throw error;
        }
    }

    // User management methods
    async createUser(userData) {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            // Create auth user
            const { data: authUser, error: authError } = await this.client.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: {
                    username: userData.username,
                    full_name: userData.full_name
                }
            });

            if (authError) {
                throw authError;
            }

            // Create user profile
            const { data: profile, error: profileError } = await this.client
                .from('user_profiles')
                .insert({
                    id: authUser.user.id,
                    username: userData.username,
                    full_name: userData.full_name,
                    email: userData.email,
                    role_id: userData.role_id || 4, // Default to user role
                    is_super_admin: userData.is_super_admin || false,
                    two_factor_secret: userData.two_factor_secret
                })
                .select()
                .single();

            if (profileError) {
                // Cleanup auth user if profile creation fails
                await this.client.auth.admin.deleteUser(authUser.user.id);
                throw profileError;
            }

            return { user: authUser.user, profile };
        } catch (error) {
            console.error('[Supabase] Create user error:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            const { data, error } = await this.client
                .from('user_profiles')
                .select(`
                    *,
                    roles (
                        name,
                        permissions
                    )
                `)
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('[Supabase] Get user by email error:', error);
            throw error;
        }
    }

    async getUserByUsername(username) {
        if (!this.isConnected) {
            throw new Error('Supabase not configured');
        }

        try {
            const { data, error } = await this.client
                .from('user_profiles')
                .select(`
                    *,
                    roles (
                        name,
                        permissions
                    )
                `)
                .eq('username', username)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('[Supabase] Get user by username error:', error);
            throw error;
        }
    }

    // Activity logging
    async logActivity(userId, action, resourceType, resourceId, details = {}) {
        if (!this.isConnected) {
            return; // Silently fail if not connected
        }

        try {
            await this.client
                .from('activity_logs')
                .insert({
                    user_id: userId,
                    action,
                    resource_type: resourceType,
                    resource_id: resourceId,
                    details,
                    ip_address: details.ip_address,
                    user_agent: details.user_agent,
                    session_id: details.session_id
                });
        } catch (error) {
            console.error('[Supabase] Activity log error:', error);
            // Don't throw - logging should not break the main operation
        }
    }

    // Health check
    async healthCheck() {
        if (!this.isConnected) {
            return { status: 'disconnected', message: 'Supabase not configured' };
        }

        try {
            const { data, error } = await this.client
                .from('company_info')
                .select('id')
                .limit(1);

            if (error) {
                throw error;
            }

            return { status: 'connected', message: 'Supabase connection healthy' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

// Create singleton instance
const supabaseDB = new SupabaseDB();

module.exports = {
    supabaseClient,
    supabaseAdmin,
    supabaseDB,
    isSupabaseConfigured: !!supabaseUrl && !!supabaseServiceKey
};