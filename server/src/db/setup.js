const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    const dbPath = path.join(__dirname, 'database.sqlite');
    const schemaPath = path.join(__dirname, 'init.sql');

    console.log(`Setting up database at ${dbPath}...`);

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon to run statements individually, as exec() can sometimes be picky
        const statements = schema.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            await db.exec(statement);
        }

        console.log('Database schema applied successfully.');
        await db.close();
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
}

setupDatabase();
