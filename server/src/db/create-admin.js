const bcrypt = require('bcrypt');
const { run, get } = require('./database');

async function createSuperAdmin() {
    try {
        console.log('[Admin Setup] Creating new super admin...');

        // Check if any super admin exists
        const existingSuperAdmin = await get('SELECT COUNT(*) as count FROM users WHERE is_super_admin = 1');
        
        if (existingSuperAdmin.count > 0) {
            console.log('[Admin Setup] Super admin already exists. Removing old admin...');
            // Remove all existing admins
            await run('DELETE FROM users WHERE role = ? OR is_super_admin = 1', ['admin']);
            console.log('[Admin Setup] Old admins removed.');
        }

        // Create new super admin
        const username = 'admin';
        const password = 'ScorpionAdmin2024!';
        const email = 'admin@scorpionsecurity.com';

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await run(
            `INSERT INTO users (username, password_hash, email, role, is_super_admin) 
             VALUES (?, ?, ?, ?, ?)`,
            [username, hashedPassword, email, 'admin', 1]
        );

        console.log('[Admin Setup] ✅ New super admin created successfully!');
        console.log('[Admin Setup] Username: admin');
        console.log('[Admin Setup] Password: ScorpionAdmin2024!');
        console.log('[Admin Setup] Email: admin@scorpionsecurity.com');
        console.log('[Admin Setup] Please change the password after first login.');

        return {
            id: result.id,
            username,
            email,
            role: 'admin',
            is_super_admin: true
        };

    } catch (error) {
        console.error('[Admin Setup] Error creating super admin:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    createSuperAdmin()
        .then(() => {
            console.log('[Admin Setup] Setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('[Admin Setup] Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { createSuperAdmin };