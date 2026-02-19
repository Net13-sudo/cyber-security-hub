#!/usr/bin/env node

/**
 * Create Test User Script
 * This script creates a test admin user for testing the application
 */

require('dotenv').config();
const { supabaseAdmin } = require('./src/db/supabase');

async function createTestUser() {
    console.log('👤 Creating Test User for Scorpion Security Hub');
    console.log('===============================================');

    if (!supabaseAdmin) {
        console.error('❌ Supabase not configured. Check your .env file.');
        return false;
    }

    try {
        // Test user credentials
        const testUser = {
            email: 'admin@scorpionsecurity.com',
            password: 'ScorpionAdmin2024!',
            username: 'admin',
            full_name: 'System Administrator'
        };

        console.log('📋 Creating test user with credentials:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        console.log(`   Username: ${testUser.username}`);
        console.log('');

        // Create auth user
        console.log('🔐 Creating authentication user...');
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: testUser.email,
            password: testUser.password,
            email_confirm: true,
            user_metadata: {
                username: testUser.username,
                full_name: testUser.full_name
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('⚠️  User already exists, updating profile...');

                // Get existing user
                const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = existingUsers.users.find(u => u.email === testUser.email);

                if (existingUser) {
                    // Update user profile
                    const { error: profileError } = await supabaseAdmin
                        .from('user_profiles')
                        .upsert({
                            id: existingUser.id,
                            username: testUser.username,
                            full_name: testUser.full_name,
                            email: testUser.email,
                            role_id: 1, // Super admin role
                            is_super_admin: true,
                            is_active: true
                        });

                    if (profileError) {
                        console.error('❌ Error updating profile:', profileError.message);
                        return false;
                    } else {
                        console.log('✅ User profile updated successfully!');
                        return true;
                    }
                }
            } else {
                console.error('❌ Error creating auth user:', authError.message);
                return false;
            }
        } else {
            console.log('✅ Authentication user created successfully!');

            // Create user profile
            console.log('👤 Creating user profile...');
            const { error: profileError } = await supabaseAdmin
                .from('user_profiles')
                .insert({
                    id: authUser.user.id,
                    username: testUser.username,
                    full_name: testUser.full_name,
                    email: testUser.email,
                    role_id: 1, // Super admin role
                    is_super_admin: true,
                    is_active: true
                });

            if (profileError) {
                console.error('❌ Error creating profile:', profileError.message);
                // Clean up auth user
                await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
                return false;
            } else {
                console.log('✅ User profile created successfully!');
            }
        }

        // Verify the user was created
        console.log('\n🔍 Verifying user creation...');
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select(`
                *,
                roles (
                    name,
                    permissions
                )
            `)
            .eq('email', testUser.email)
            .single();

        if (profile) {
            console.log('✅ User verification successful!');
            console.log(`   ID: ${profile.id}`);
            console.log(`   Username: ${profile.username}`);
            console.log(`   Email: ${profile.email}`);
            console.log(`   Role: ${profile.roles?.name || 'Unknown'}`);
            console.log(`   Super Admin: ${profile.is_super_admin ? 'Yes' : 'No'}`);
        } else {
            console.log('⚠️  Could not verify user creation');
        }

        console.log('\n🎉 Test user created successfully!');
        console.log('\n📝 Login Instructions:');
        console.log('   1. Open your browser to the login page');
        console.log('   2. Use these credentials:');
        console.log(`      Email: ${testUser.email}`);
        console.log(`      Password: ${testUser.password}`);
        console.log('   3. You should be redirected to the admin dashboard');

        return true;

    } catch (error) {
        console.error('\n❌ Error creating test user:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

// Run the script
if (require.main === module) {
    createTestUser()
        .then((success) => {
            if (success) {
                console.log('\n✅ Test user creation completed successfully!');
                process.exit(0);
            } else {
                console.log('\n❌ Test user creation failed!');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('\n❌ Script error:', error);
            process.exit(1);
        });
}

module.exports = { createTestUser };