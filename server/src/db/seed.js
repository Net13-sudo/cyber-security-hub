const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');

async function seed() {
    const dbPath = path.join(__dirname, 'database.sqlite');

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        const adminUser = 'Net13';
        const adminPass = 'Polaris@1024#';

        const existing = await db.get('SELECT * FROM users WHERE username = ?', adminUser);

        if (!existing) {
            console.log(`Creating Super Admin: ${adminUser}`);
            const hashedPassword = await bcrypt.hash(adminPass, 10);

            await db.run(
                `INSERT INTO users (username, password_hash, role, is_super_admin, is_verified) 
         VALUES (?, ?, ?, 1, 1)`,
                [adminUser, hashedPassword, 'admin']
            );
            console.log('Super Admin created successfully.');
        } else {
            console.log('Super Admin already exists.');
        }

        await db.close();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
