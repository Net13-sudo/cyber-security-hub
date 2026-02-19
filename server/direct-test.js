// Direct test with your actual Supabase credentials
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    console.log('🔍 Testing Direct Supabase Connection...\n');

    // Your actual credentials from the .env file
    const supabaseUrl = 'https://tzfhxsffpownbxdyfklr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Zmh4c2ZmcG93bmJ4ZHlma2xyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMjM0OCwiZXhwIjoyMDg2OTA4MzQ4fQ.w2LfjpCbVMRnPOBbyh7DF3zHk44tcAF8-R33aDRpz9w';

    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 Service Key:', supabaseKey.substring(0, 20) + '...');

    try {
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        console.log('✅ Supabase client created');

        // Test basic connection
        console.log('\n🧪 Testing connection...');
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('❌ Connection failed:', authError.message);
            return;
        }
        
        console.log('✅ Connection successful!');
        console.log(`📊 Found ${authData.users.length} users in your project`);

        // Test if our tables exist
        console.log('\n🧪 Checking for Scorpion Security tables...');
        
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
                    console.log(`❌ Table '${table}': Not found`);
                } else {
                    console.log(`✅ Table '${table}': Exists`);
                    tablesExist++;
                }
            } catch (err) {
                console.log(`❌ Table '${table}': Error`);
            }
        }

        if (tablesExist === 0) {
            console.log('\n⚠️  No Scorpion Security tables found!');
            console.log('\n📋 Next Steps:');
            console.log('1. Go to your Supabase project dashboard');
            console.log('2. Open SQL Editor');
            console.log('3. Copy and run the migration script from:');
            console.log('   server/src/db/existing-supabase-migration.sql');
            console.log('\n🚀 After running the migration, your server will work perfectly!');
        } else {
            console.log(`\n🎉 Found ${tablesExist}/${tablesToCheck.length} tables!`);
            if (tablesExist < tablesToCheck.length) {
                console.log('⚠️  Some tables are missing. Please run the migration script.');
            } else {
                console.log('✅ All tables found! Your setup is complete.');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testConnection().catch(console.error);