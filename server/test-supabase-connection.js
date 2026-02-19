// Test script for your existing Supabase connection
require('dotenv').config();

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection...\n');

    // Debug: Show what we're actually reading from .env
    console.log('🔧 Debug: Environment Variables');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'NOT SET');
    console.log('');

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env file');
        return;
    }

    if (supabaseUrl.includes('your-project-ref') || supabaseKey.includes('your-service-role-key')) {
        console.error('❌ You still have placeholder values in your .env file');
        console.log('Please update .env with your actual Supabase credentials');
        return;
    }

    console.log('✅ Environment variables found');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Service Key: ${supabaseKey.substring(0, 20)}...`);

    try {
        // Import Supabase after we know the env vars are loaded
        const { createClient } = require('@supabase/supabase-js');
        
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        console.log('✅ Supabase client created');

        // Test basic connection by checking auth users table
        console.log('\n🧪 Test 1: Basic Connection');
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('❌ Connection failed:', authError.message);
            console.log('\n💡 This might be because:');
            console.log('1. Your service role key is incorrect');
            console.log('2. Your project URL is wrong');
            console.log('3. Your Supabase project is paused');
            return;
        }
        
        console.log('✅ Connection successful!');
        console.log(`📊 Found ${authData.users.length} users in your project`);

        // Test if our tables exist by trying to query them
        console.log('\n🧪 Test 2: Check if Scorpion Security tables exist');
        
        const tablesToCheck = [
            'roles',
            'user_profiles', 
            'digital_library',
            'research_projects',
            'security_metrics'
        ];

        let tablesExist = 0;
        for (const table of tablesToCheck) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('id')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ Table '${table}': Not found (${error.message})`);
                } else {
                    console.log(`✅ Table '${table}': Exists`);
                    tablesExist++;
                }
            } catch (err) {
                console.log(`❌ Table '${table}': Error - ${err.message}`);
            }
        }

        if (tablesExist === 0) {
            console.log('\n⚠️  No Scorpion Security tables found!');
            console.log('📋 Next Steps:');
            console.log('1. Go to your Supabase project dashboard');
            console.log('2. Open SQL Editor');
            console.log('3. Run the migration script from: server/src/db/existing-supabase-migration.sql');
        } else if (tablesExist < tablesToCheck.length) {
            console.log('\n⚠️  Some tables are missing. Please run the migration script.');
        } else {
            console.log('\n🎉 All tables found! Your setup looks good.');
            
            // Check for admin user
            console.log('\n🧪 Test 3: Check for admin user');
            const { data: adminUser, error: adminError } = await supabase
                .from('user_profiles')
                .select('username, email, is_super_admin')
                .eq('username', 'admin')
                .single();

            if (adminError) {
                console.log('⚠️  Admin user not found. You need to create it.');
                console.log('📋 To create admin user:');
                console.log('1. Go to Authentication → Users in Supabase Dashboard');
                console.log('2. Add user: admin@scorpionsecurity.com / ScorpionAdmin2024!');
                console.log('3. Run the SQL from: server/src/db/create-supabase-admin.sql');
            } else {
                console.log(`✅ Admin user found: ${adminUser.email} (Super Admin: ${adminUser.is_super_admin})`);
            }
        }

        console.log('\n🚀 Ready to start your server with: npm start');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Verify your Supabase project is not paused');
        console.log('3. Double-check your credentials in .env file');
    }
}

// Run the test
testSupabaseConnection().catch(console.error);