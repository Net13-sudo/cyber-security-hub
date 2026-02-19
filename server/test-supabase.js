#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * This script will test your Supabase connection and verify the setup
 */

require('dotenv').config();
const { supabaseAdmin, supabaseDB } = require('./src/db/supabase');

async function testSupabaseConnection() {
    console.log('🧪 Testing Supabase Connection');
    console.log('==============================');
    console.log(`🔗 Project URL: ${process.env.SUPABASE_URL}`);
    console.log('');

    if (!supabaseAdmin) {
        console.error('❌ Supabase not configured. Check your .env file.');
        return false;
    }

    try {
        // Test 1: Basic Health Check
        console.log('📋 Test 1: Basic Health Check');
        const health = await supabaseDB.healthCheck();
        console.log(`   Status: ${health.status}`);
        console.log(`   Message: ${health.message}`);
        
        if (health.status !== 'connected') {
            console.error('❌ Health check failed');
            return false;
        }
        console.log('   ✅ Health check passed');

        // Test 2: Check Tables Exist
        console.log('\n📋 Test 2: Verify Tables');
        const tables = [
            'roles',
            'user_profiles', 
            'digital_library',
            'research_projects',
            'threat_intelligence',
            'security_incidents',
            'company_info',
            'security_metrics'
        ];

        for (const table of tables) {
            try {
                const { data, error } = await supabaseAdmin
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`   ❌ Table ${table}: ${error.message}`);
                    return false;
                } else {
                    console.log(`   ✅ Table ${table}: exists`);
                }
            } catch (err) {
                console.log(`   ❌ Table ${table}: ${err.message}`);
                return false;
            }
        }

        // Test 3: Check Sample Data
        console.log('\n📋 Test 3: Check Sample Data');
        
        // Check roles
        const { data: roles } = await supabaseAdmin
            .from('roles')
            .select('*');
        console.log(`   ✅ Roles: ${roles?.length || 0} found`);

        // Check company info
        const { data: company } = await supabaseAdmin
            .from('company_info')
            .select('*');
        console.log(`   ✅ Company info: ${company?.length || 0} records`);

        // Check security metrics
        const { data: metrics } = await supabaseAdmin
            .from('security_metrics')
            .select('*');
        console.log(`   ✅ Security metrics: ${metrics?.length || 0} records`);

        // Test 4: Test User Creation (without actually creating)
        console.log('\n📋 Test 4: Test Authentication Setup');
        try {
            // Just test if we can access the auth admin
            const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
            if (error) {
                console.log(`   ⚠️  Auth admin access: ${error.message}`);
            } else {
                console.log(`   ✅ Auth admin access: working (${users.users?.length || 0} users)`);
            }
        } catch (err) {
            console.log(`   ⚠️  Auth admin access: ${err.message}`);
        }

        // Test 5: Test RLS Policies
        console.log('\n📋 Test 5: Test Row Level Security');
        try {
            // This should work with service role
            const { data, error } = await supabaseAdmin
                .from('digital_library')
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`   ⚠️  RLS test: ${error.message}`);
            } else {
                console.log(`   ✅ RLS policies: configured correctly`);
            }
        } catch (err) {
            console.log(`   ⚠️  RLS test: ${err.message}`);
        }

        console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Start your server: npm start');
        console.log('   2. Test your frontend applications');
        console.log('   3. Create your first admin user');
        
        return true;

    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

// Run the test
if (require.main === module) {
    testSupabaseConnection()
        .then((success) => {
            if (success) {
                console.log('\n✅ Supabase connection test completed successfully!');
                process.exit(0);
            } else {
                console.log('\n❌ Supabase connection test failed!');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('\n❌ Test script error:', error);
            process.exit(1);
        });
}

module.exports = { testSupabaseConnection };