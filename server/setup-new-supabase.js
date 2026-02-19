#!/usr/bin/env node

/**
 * Supabase Project Setup Script
 * This script will help you set up your new Supabase project
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupSupabase() {
    console.log('🚀 Scorpion Security Hub - Supabase Setup');
    console.log('=========================================');
    console.log('');
    console.log('This script will help you configure your new Supabase project.');
    console.log('');
    console.log('📋 Before continuing, make sure you have:');
    console.log('   1. Created a new Supabase project at https://supabase.com');
    console.log('   2. Copied your project credentials from Settings → API');
    console.log('');

    const proceed = await question('Ready to continue? (y/n): ');
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        rl.close();
        return;
    }

    console.log('');
    console.log('🔑 Enter your Supabase project credentials:');
    console.log('');

    // Get Supabase credentials
    const supabaseUrl = await question('Project URL (https://xxx.supabase.co): ');
    const anonKey = await question('Anon Key (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...): ');
    const serviceKey = await question('Service Role Key (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...): ');

    // Validate inputs
    if (!supabaseUrl || !anonKey || !serviceKey) {
        console.log('❌ All fields are required. Please try again.');
        rl.close();
        return;
    }

    if (!supabaseUrl.includes('supabase.co')) {
        console.log('❌ Invalid Supabase URL. Should be like: https://xxx.supabase.co');
        rl.close();
        return;
    }

    // Update .env file
    try {
        const envPath = path.join(__dirname, '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Replace the placeholder values
        envContent = envContent.replace('SUPABASE_URL=YOUR_NEW_PROJECT_URL_HERE', `SUPABASE_URL=${supabaseUrl}`);
        envContent = envContent.replace('SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY_HERE', `SUPABASE_ANON_KEY=${anonKey}`);
        envContent = envContent.replace('SUPABASE_SERVICE_ROLE_KEY=YOUR_NEW_SERVICE_ROLE_KEY_HERE', `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`);

        fs.writeFileSync(envPath, envContent);
        console.log('');
        console.log('✅ Environment file updated successfully!');

    } catch (error) {
        console.log('❌ Error updating .env file:', error.message);
        rl.close();
        return;
    }

    console.log('');
    console.log('📋 Next Steps:');
    console.log('');
    console.log('1. 🗄️  Set up your database schema:');
    console.log('   → Go to your Supabase dashboard');
    console.log('   → Click "SQL Editor" in the sidebar');
    console.log('   → Click "New Query"');
    console.log('   → Copy and paste the contents of "supabase-migrations.sql"');
    console.log('   → Click "Run" to create all tables');
    console.log('');
    console.log('2. 🚀 Test your connection:');
    console.log('   → Run: npm start');
    console.log('   → Look for "Using Supabase PostgreSQL" in the logs');
    console.log('');
    console.log('3. 📊 Migrate your existing data (optional):');
    console.log('   → Run: node migrate-to-supabase.js');
    console.log('');

    const runMigration = await question('Would you like to run the database migration now? (y/n): ');

    if (runMigration.toLowerCase() === 'y' || runMigration.toLowerCase() === 'yes') {
        console.log('');
        console.log('🔄 Please run the SQL migration in your Supabase dashboard first.');
        console.log('   Then come back and run: node migrate-to-supabase.js');
        console.log('');
    }

    console.log('🎉 Setup completed! Your Supabase project is ready to use.');
    rl.close();
}

// Run the setup
if (require.main === module) {
    setupSupabase().catch((error) => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });
}

module.exports = { setupSupabase };