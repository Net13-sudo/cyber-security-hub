#!/usr/bin/env node

/**
 * DigitalOcean App Platform Deployment Script
 * Scorpion Security Hub - Full Stack Deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌊 Scorpion Security Hub - DigitalOcean Deployment');
console.log('===============================================');

function runCommand(command, description) {
    console.log(`\n📋 ${description}...`);
    try {
        const output = execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completed successfully`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

function checkPrerequisites() {
    console.log('\n🔍 Checking prerequisites...');
    
    // Check if doctl is installed
    try {
        execSync('doctl version', { stdio: 'pipe' });
        console.log('✅ DigitalOcean CLI (doctl) is installed');
    } catch (error) {
        console.error('❌ DigitalOcean CLI not found. Please install it first:');
        console.error('   Visit: https://docs.digitalocean.com/reference/doctl/how-to/install/');
        return false;
    }

    // Check if we're in a git repository
    try {
        execSync('git status', { stdio: 'pipe' });
        console.log('✅ Git repository detected');
    } catch (error) {
        console.log('⚠️  Not a git repository. Initializing...');
        if (!runCommand('git init', 'Initialize Git repository')) return false;
        if (!runCommand('git add .', 'Add files to Git')) return false;
        if (!runCommand('git commit -m "Initial commit for DigitalOcean deployment"', 'Create initial commit')) return false;
    }

    // Check if app.yaml exists
    const appYamlPath = path.join(__dirname, '.do', 'app.yaml');
    if (!fs.existsSync(appYamlPath)) {
        console.error('❌ .do/app.yaml not found');
        return false;
    } else {
        console.log('✅ DigitalOcean app.yaml configuration found');
    }

    return true;
}

function displayEnvironmentVariables() {
    console.log('\n🔐 Environment Variables Required for DigitalOcean:');
    console.log('==================================================');
    
    const envVars = [
        'SUPABASE_URL - Your Supabase project URL',
        'SUPABASE_ANON_KEY - Your Supabase anonymous key', 
        'SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key',
        'JWT_SECRET - A secure random string for JWT tokens'
    ];

    envVars.forEach(envVar => {
        console.log(`   ${envVar}`);
    });

    console.log('\n📝 You will need to set these in DigitalOcean App Platform dashboard after deployment.');
}

function updateAppYaml() {
    console.log('\n⚙️  Updating DigitalOcean app.yaml configuration...');
    
    const appYamlPath = path.join(__dirname, '.do', 'app.yaml');
    let appYaml = fs.readFileSync(appYamlPath, 'utf8');
    
    // Update GitHub repository reference
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your GitHub username: ', (username) => {
            rl.question('Enter your repository name (default: scorpion-security-hub): ', (repoName) => {
                const repo = repoName || 'scorpion-security-hub';
                
                // Update the app.yaml with actual repository info
                appYaml = appYaml.replace(/your-username\/scorpion-security-hub/g, `${username}/${repo}`);
                
                fs.writeFileSync(appYamlPath, appYaml);
                console.log('✅ Updated app.yaml with your repository information');
                
                rl.close();
                resolve(true);
            });
        });
    });
}

async function deployToDigitalOcean() {
    console.log('\n🌊 Starting DigitalOcean deployment...');
    
    // Authenticate with DigitalOcean
    console.log('\n🔑 Please ensure you are authenticated with DigitalOcean CLI');
    console.log('   Run: doctl auth init');
    
    // Create the app
    const appYamlPath = path.join(__dirname, '.do', 'app.yaml');
    if (!runCommand(`doctl apps create --spec ${appYamlPath}`, 'Create DigitalOcean App')) {
        return false;
    }

    console.log('\n🎉 DigitalOcean deployment initiated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to your DigitalOcean dashboard: https://cloud.digitalocean.com/apps');
    console.log('   2. Find your new app: scorpion-security-hub');
    console.log('   3. Go to Settings → Environment Variables');
    console.log('   4. Add your Supabase credentials');
    console.log('   5. Wait for deployment to complete');
    console.log('   6. Test your live application');

    return true;
}

async function main() {
    try {
        // Check prerequisites
        if (!checkPrerequisites()) {
            console.log('\n❌ Prerequisites check failed. Please fix the issues above.');
            process.exit(1);
        }

        // Display required environment variables
        displayEnvironmentVariables();

        // Update app.yaml with repository info
        await updateAppYaml();

        // Ask user if they want to proceed
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\n🚀 Ready to deploy to DigitalOcean? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                rl.close();
                
                if (await deployToDigitalOcean()) {
                    console.log('\n✅ DigitalOcean deployment completed successfully!');
                    process.exit(0);
                } else {
                    console.log('\n❌ DigitalOcean deployment failed!');
                    process.exit(1);
                }
            } else {
                console.log('\n❌ Deployment cancelled.');
                rl.close();
                process.exit(0);
            }
        });

    } catch (error) {
        console.error('\n❌ Deployment script error:', error);
        process.exit(1);
    }
}

// Run the deployment script
if (require.main === module) {
    main();
}

module.exports = { deployToDigitalOcean, checkPrerequisites };