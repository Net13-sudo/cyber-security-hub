#!/usr/bin/env node

/**
 * Supabase Database Cleanup Script
 * This script will clean all data from your Supabase database
 * and prepare it for a fresh start.
 */

require('dotenv').config();
const { supabaseAdmin } = require('./src/db/supabase');

async function cleanSupabase() {
    if (!supabaseAdmin) {
        console.error('❌ Supabase not configured. Please check your .env file.');
        process.exit(1);
    }

    console.log('🧹 Starting Supabase database cleanup...');
    console.log(`🔗 Connected to: ${process.env.SUPABASE_URL}`);

    try {
        // Step 1: List all tables to clean
        const tablesToClean = [
            'activity_logs',
            'notifications',
            'api_keys',
            'research_collaborators',
            'security_incidents',
            'threat_intelligence',
            'research_projects',
            'digital_library',
            'user_profiles',
            'security_metrics',
            'company_info'
        ];

        console.log('\n📋 Tables to clean:');
        tablesToClean.forEach(table => console.log(`   - ${table}`));

        // Step 2: Clean each table
        console.log('\n🗑️  Cleaning tables...');
        
        for (const table of tablesToClean) {
            try {
                console.log(`   Cleaning ${table}...`);
                
                // Delete all records from the table
                const { error } = await supabaseAdmin
                    .from(table)
                    .delete()
                    .neq('id', 0); // This will match all records
                
                if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
                    console.warn(`   ⚠️  Warning cleaning ${table}: ${error.message}`);
                } else {
                    console.log(`   ✅ ${table} cleaned successfully`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error cleaning ${table}: ${err.message}`);
            }
        }

        // Step 3: Clean auth users (if needed)
        console.log('\n👥 Cleaning auth users...');
        try {
            // List all users
            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            
            if (listError) {
                console.warn(`   ⚠️  Could not list users: ${listError.message}`);
            } else if (users && users.users.length > 0) {
                console.log(`   Found ${users.users.length} users to clean`);
                
                for (const user of users.users) {
                    try {
                        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
                        if (deleteError) {
                            console.warn(`   ⚠️  Could not delete user ${user.email}: ${deleteError.message}`);
                        } else {
                            console.log(`   ✅ Deleted user: ${user.email}`);
                        }
                    } catch (err) {
                        console.warn(`   ⚠️  Error deleting user ${user.email}: ${err.message}`);
                    }
                }
            } else {
                console.log('   ✅ No users found to clean');
            }
        } catch (err) {
            console.warn(`   ⚠️  Error cleaning auth users: ${err.message}`);
        }

        // Step 4: Reset sequences (PostgreSQL specific)
        console.log('\n🔄 Resetting sequences...');
        const sequencesToReset = [
            'roles_id_seq',
            'digital_library_id_seq',
            'research_projects_id_seq',
            'research_collaborators_id_seq',
            'threat_intelligence_id_seq',
            'security_incidents_id_seq',
            'activity_logs_id_seq',
            'api_keys_id_seq',
            'notifications_id_seq',
            'company_info_id_seq',
            'security_metrics_id_seq'
        ];

        for (const sequence of sequencesToReset) {
            try {
                const { error } = await supabaseAdmin.rpc('reset_sequence', { 
                    sequence_name: sequence 
                });
                
                if (error) {
                    console.warn(`   ⚠️  Could not reset ${sequence}: ${error.message}`);
                } else {
                    console.log(`   ✅ Reset sequence: ${sequence}`);
                }
            } catch (err) {
                // Sequences might not exist, that's okay
                console.log(`   ℹ️  Sequence ${sequence} not found (this is normal)`);
            }
        }

        // Step 5: Verify cleanup
        console.log('\n🔍 Verifying cleanup...');
        for (const table of ['user_profiles', 'digital_library', 'research_projects']) {
            try {
                const { data, error } = await supabaseAdmin
                    .from(table)
                    .select('id')
                    .limit(1);
                
                if (error && error.code !== 'PGRST116') {
                    console.warn(`   ⚠️  Could not verify ${table}: ${error.message}`);
                } else if (data && data.length > 0) {
                    console.warn(`   ⚠️  ${table} still contains data`);
                } else {
                    console.log(`   ✅ ${table} is empty`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error verifying ${table}: ${err.message}`);
            }
        }

        console.log('\n🎉 Database cleanup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Run the migration script to recreate the schema');
        console.log('   2. Restart your server to test the connection');
        console.log('   3. The database is now ready for fresh data');

    } catch (error) {
        console.error('\n❌ Cleanup failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

// Helper function to create sequence reset function if it doesn't exist
async function createResetSequenceFunction() {
    try {
        const { error } = await supabaseAdmin.rpc('create_reset_sequence_function');
        if (error) {
            console.log('ℹ️  Reset sequence function already exists or could not be created');
        }
    } catch (err) {
        // Function might already exist, that's fine
    }
}

// Run the cleanup
if (require.main === module) {
    console.log('🚀 Scorpion Security Hub - Supabase Cleanup');
    console.log('==========================================');
    
    // Confirm before proceeding
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('\n⚠️  This will DELETE ALL DATA from your Supabase database. Are you sure? (yes/no): ', (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            rl.close();
            cleanSupabase()
                .then(() => {
                    console.log('\n✅ Cleanup completed successfully!');
                    process.exit(0);
                })
                .catch((error) => {
                    console.error('\n❌ Cleanup failed:', error);
                    process.exit(1);
                });
        } else {
            console.log('\n❌ Cleanup cancelled.');
            rl.close();
            process.exit(0);
        }
    });
}

module.exports = { cleanSupabase };