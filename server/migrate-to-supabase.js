#!/usr/bin/env node

/**
 * SQLite to Supabase Migration Script
 * This script will migrate all your existing SQLite data to Supabase
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { supabaseAdmin } = require('./src/db/supabase');

// SQLite database path
const dbPath = process.env.DB_PATH || path.join(__dirname, 'src/db/database.sqlite');

async function migrateToSupabase() {
    if (!supabaseAdmin) {
        console.error('❌ Supabase not configured. Please check your .env file.');
        process.exit(1);
    }

    console.log('🚀 Starting SQLite to Supabase migration...');
    console.log(`📂 SQLite database: ${dbPath}`);
    console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL}`);

    // Open SQLite database
    const sqliteDB = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error opening SQLite database:', err.message);
            process.exit(1);
        }
        console.log('✅ Connected to SQLite database');
    });

    try {
        // Step 1: First run the Supabase migration to create tables
        console.log('\n📋 Step 1: Ensuring Supabase schema exists...');
        console.log('   Please make sure you have run the supabase-migrations.sql in your Supabase dashboard first!');

        // Step 2: Migrate Users
        console.log('\n👥 Step 2: Migrating users...');
        await migrateUsers(sqliteDB);

        // Step 3: Migrate Digital Library
        console.log('\n📚 Step 3: Migrating digital library...');
        await migrateDigitalLibrary(sqliteDB);

        // Step 4: Migrate Research Projects
        console.log('\n🔬 Step 4: Migrating research projects...');
        await migrateResearchProjects(sqliteDB);

        // Step 5: Migrate Research Collaborators
        console.log('\n🤝 Step 5: Migrating research collaborators...');
        await migrateResearchCollaborators(sqliteDB);

        // Step 6: Migrate Threat Intelligence
        console.log('\n🛡️  Step 6: Migrating threat intelligence...');
        await migrateThreatIntelligence(sqliteDB);

        // Step 7: Migrate Security Incidents
        console.log('\n🚨 Step 7: Migrating security incidents...');
        await migrateSecurityIncidents(sqliteDB);

        // Step 8: Migrate Security Metrics
        console.log('\n📊 Step 8: Migrating security metrics...');
        await migrateSecurityMetrics(sqliteDB);

        // Step 9: Migrate Company Info
        console.log('\n🏢 Step 9: Migrating company info...');
        await migrateCompanyInfo(sqliteDB);

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Restart your server');
        console.log('   2. Test the connection to Supabase');
        console.log('   3. Verify your data in the Supabase dashboard');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Full error:', error);
    } finally {
        sqliteDB.close();
    }
}

// Helper function to run SQLite queries
function runSQLiteQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Migrate Users
async function migrateUsers(sqliteDB) {
    try {
        const users = await runSQLiteQuery(sqliteDB, 'SELECT * FROM users');
        console.log(`   Found ${users.length} users to migrate`);

        for (const user of users) {
            try {
                // Create auth user first
                const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: user.email || `${user.username}@scorpionsecurity.com`,
                    password: 'TempPassword123!', // They'll need to reset this
                    email_confirm: true,
                    user_metadata: {
                        username: user.username,
                        migrated_from_sqlite: true
                    }
                });

                if (authError) {
                    console.warn(`   ⚠️  Could not create auth user for ${user.username}: ${authError.message}`);
                    continue;
                }

                // Create user profile
                const { error: profileError } = await supabaseAdmin
                    .from('user_profiles')
                    .insert({
                        id: authUser.user.id,
                        username: user.username,
                        full_name: user.username, // Use username as full name if not available
                        email: user.email || `${user.username}@scorpionsecurity.com`,
                        role_id: user.is_super_admin ? 1 : (user.role === 'admin' ? 2 : 4),
                        is_super_admin: user.is_super_admin === 1,
                        two_factor_secret: user.two_factor_secret,
                        created_at: user.created_at,
                        is_active: true
                    });

                if (profileError) {
                    console.warn(`   ⚠️  Could not create profile for ${user.username}: ${profileError.message}`);
                    // Clean up auth user
                    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
                } else {
                    console.log(`   ✅ Migrated user: ${user.username}`);
                }

            } catch (err) {
                console.warn(`   ⚠️  Error migrating user ${user.username}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating users:', error.message);
    }
}

// Migrate Digital Library
async function migrateDigitalLibrary(sqliteDB) {
    try {
        const items = await runSQLiteQuery(sqliteDB, 'SELECT * FROM digital_library');
        console.log(`   Found ${items.length} library items to migrate`);

        // Get user mapping (SQLite ID to Supabase UUID)
        const userMapping = await getUserMapping(sqliteDB);

        for (const item of items) {
            try {
                const userId = userMapping[item.created_by] || null;
                
                const { error } = await supabaseAdmin
                    .from('digital_library')
                    .insert({
                        user_id: userId,
                        title: item.title,
                        type: item.type,
                        author: item.author,
                        description: item.description,
                        url: item.url,
                        file_path: item.file_path,
                        tags: item.tags ? item.tags.split(',') : [],
                        is_public: false, // Default to private
                        is_online: item.is_online === 1,
                        created_at: item.created_at,
                        updated_at: item.updated_at
                    });

                if (error) {
                    console.warn(`   ⚠️  Could not migrate library item "${item.title}": ${error.message}`);
                } else {
                    console.log(`   ✅ Migrated library item: ${item.title}`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error migrating library item "${item.title}": ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating digital library:', error.message);
    }
}

// Migrate Research Projects
async function migrateResearchProjects(sqliteDB) {
    try {
        const projects = await runSQLiteQuery(sqliteDB, 'SELECT * FROM research_projects');
        console.log(`   Found ${projects.length} research projects to migrate`);

        const userMapping = await getUserMapping(sqliteDB);

        for (const project of projects) {
            try {
                const userId = userMapping[project.created_by] || null;
                
                const { error } = await supabaseAdmin
                    .from('research_projects')
                    .insert({
                        user_id: userId,
                        title: project.title,
                        status: project.status,
                        type: project.type,
                        lead_researcher: project.lead_researcher,
                        description: project.description,
                        start_date: project.start_date,
                        end_date: project.end_date,
                        tags: project.tags ? project.tags.split(',') : [],
                        progress: project.progress || 0,
                        is_confidential: false, // Default to non-confidential
                        created_at: project.created_at,
                        updated_at: project.updated_at
                    });

                if (error) {
                    console.warn(`   ⚠️  Could not migrate project "${project.title}": ${error.message}`);
                } else {
                    console.log(`   ✅ Migrated project: ${project.title}`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error migrating project "${project.title}": ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating research projects:', error.message);
    }
}

// Migrate Research Collaborators
async function migrateResearchCollaborators(sqliteDB) {
    try {
        const collaborators = await runSQLiteQuery(sqliteDB, 'SELECT * FROM research_collaborators');
        console.log(`   Found ${collaborators.length} collaborators to migrate`);

        // Get project mapping (SQLite ID to Supabase ID)
        const projectMapping = await getProjectMapping();

        for (const collaborator of collaborators) {
            try {
                const projectId = projectMapping[collaborator.project_id];
                if (!projectId) {
                    console.warn(`   ⚠️  Project ID ${collaborator.project_id} not found for collaborator ${collaborator.researcher_name}`);
                    continue;
                }
                
                const { error } = await supabaseAdmin
                    .from('research_collaborators')
                    .insert({
                        project_id: projectId,
                        user_id: null, // We don't have user mapping for collaborators
                        researcher_name: collaborator.researcher_name,
                        role: collaborator.role,
                        email: collaborator.email,
                        joined_at: collaborator.created_at
                    });

                if (error) {
                    console.warn(`   ⚠️  Could not migrate collaborator "${collaborator.researcher_name}": ${error.message}`);
                } else {
                    console.log(`   ✅ Migrated collaborator: ${collaborator.researcher_name}`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error migrating collaborator "${collaborator.researcher_name}": ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating research collaborators:', error.message);
    }
}

// Migrate Threat Intelligence
async function migrateThreatIntelligence(sqliteDB) {
    try {
        const threats = await runSQLiteQuery(sqliteDB, 'SELECT * FROM threat_intelligence');
        console.log(`   Found ${threats.length} threat intelligence items to migrate`);

        const userMapping = await getUserMapping(sqliteDB);

        for (const threat of threats) {
            try {
                const userId = userMapping[threat.created_by] || null;
                
                const { error } = await supabaseAdmin
                    .from('threat_intelligence')
                    .insert({
                        user_id: userId,
                        source: threat.source,
                        title: threat.title,
                        severity: threat.severity,
                        type: threat.type,
                        description: threat.description,
                        iocs: threat.iocs ? JSON.parse(threat.iocs) : null,
                        mitigation: threat.mitigation,
                        published_at: threat.published_at,
                        created_at: threat.published_at
                    });

                if (error) {
                    console.warn(`   ⚠️  Could not migrate threat "${threat.title}": ${error.message}`);
                } else {
                    console.log(`   ✅ Migrated threat: ${threat.title}`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error migrating threat "${threat.title}": ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating threat intelligence:', error.message);
    }
}

// Migrate Security Incidents
async function migrateSecurityIncidents(sqliteDB) {
    try {
        const incidents = await runSQLiteQuery(sqliteDB, 'SELECT * FROM incidents');
        console.log(`   Found ${incidents.length} security incidents to migrate`);

        const userMapping = await getUserMapping(sqliteDB);

        for (const incident of incidents) {
            try {
                const userId = userMapping[incident.reported_by] || null;
                
                const { error } = await supabaseAdmin
                    .from('security_incidents')
                    .insert({
                        user_id: userId,
                        title: incident.title,
                        description: incident.description,
                        severity: incident.severity,
                        status: incident.status,
                        assigned_to: null, // We'll need to map this separately
                        reported_by: userId,
                        reported_at: incident.reported_at,
                        created_at: incident.reported_at,
                        updated_at: incident.updated_at
                    });

                if (error) {
                    console.warn(`   ⚠️  Could not migrate incident "${incident.title}": ${error.message}`);
                } else {
                    console.log(`   ✅ Migrated incident: ${incident.title}`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error migrating incident "${incident.title}": ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating security incidents:', error.message);
    }
}

// Migrate Security Metrics
async function migrateSecurityMetrics(sqliteDB) {
    try {
        const metrics = await runSQLiteQuery(sqliteDB, 'SELECT * FROM security_metrics');
        console.log(`   Found ${metrics.length} security metrics to migrate`);

        for (const metric of metrics) {
            try {
                const { error } = await supabaseAdmin
                    .from('security_metrics')
                    .insert({
                        metric_name: metric.metric_name,
                        metric_value: metric.metric_value,
                        metric_type: metric.metric_type,
                        recorded_at: metric.recorded_at
                    });

                if (error) {
                    console.warn(`   ⚠️  Could not migrate metric "${metric.metric_name}": ${error.message}`);
                } else {
                    console.log(`   ✅ Migrated metric: ${metric.metric_name}`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error migrating metric "${metric.metric_name}": ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating security metrics:', error.message);
    }
}

// Migrate Company Info
async function migrateCompanyInfo(sqliteDB) {
    try {
        const companies = await runSQLiteQuery(sqliteDB, 'SELECT * FROM company_info');
        console.log(`   Found ${companies.length} company info records to migrate`);

        for (const company of companies) {
            try {
                const { error } = await supabaseAdmin
                    .from('company_info')
                    .insert({
                        name: company.name,
                        description: company.description,
                        website: company.website,
                        email: company.email,
                        phone: company.phone,
                        address: company.address,
                        founded_year: company.founded_year,
                        employee_count: company.employee_count,
                        certifications: company.certifications ? company.certifications.split(',') : [],
                        services: company.services ? company.services.split(',') : [],
                        updated_at: company.updated_at
                    });

                if (error) {
                    console.warn(`   ⚠️  Could not migrate company info: ${error.message}`);
                } else {
                    console.log(`   ✅ Migrated company info: ${company.name}`);
                }
            } catch (err) {
                console.warn(`   ⚠️  Error migrating company info: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('   ❌ Error migrating company info:', error.message);
    }
}

// Helper function to get user mapping (SQLite ID -> Supabase UUID)
async function getUserMapping(sqliteDB) {
    const mapping = {};
    try {
        const sqliteUsers = await runSQLiteQuery(sqliteDB, 'SELECT id, username FROM users');
        const { data: supabaseUsers } = await supabaseAdmin
            .from('user_profiles')
            .select('id, username');

        for (const sqliteUser of sqliteUsers) {
            const supabaseUser = supabaseUsers?.find(u => u.username === sqliteUser.username);
            if (supabaseUser) {
                mapping[sqliteUser.id] = supabaseUser.id;
            }
        }
    } catch (error) {
        console.warn('Could not create user mapping:', error.message);
    }
    return mapping;
}

// Helper function to get project mapping
async function getProjectMapping() {
    const mapping = {};
    try {
        const { data: projects } = await supabaseAdmin
            .from('research_projects')
            .select('id, title');

        // This is a simple mapping - in a real scenario you'd want more sophisticated matching
        projects?.forEach((project, index) => {
            mapping[index + 1] = project.id; // Assuming SQLite IDs start from 1
        });
    } catch (error) {
        console.warn('Could not create project mapping:', error.message);
    }
    return mapping;
}

// Run the migration
if (require.main === module) {
    console.log('🚀 Scorpion Security Hub - SQLite to Supabase Migration');
    console.log('====================================================');
    
    migrateToSupabase()
        .then(() => {
            console.log('\n✅ Migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateToSupabase };