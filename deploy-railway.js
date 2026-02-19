#!/usr/bin/env node

/**
 * Railway Deployment Script for Scorpion Security Hub
 * This script helps you deploy your application to Railway
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚂 Scorpion Security Hub - Railway Deployment');
console.log('===========================================');

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
    
    // Check if Railway CLI is installed
    try {
        execSync('railway --version', { stdio: 'pipe' });
        console.log('✅ Railway CLI is installed');
    } catch (error) {
        console.error('❌ Railway CLI not found. Please install it first:');
        console.error('   npm install -g @railway/cli');
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
        if (!runCommand('git commit -m "Initial commit for Railway deployment"', 'Create initial commit')) return false;
    }

    // Check if server dependencies are installed
    const serverPackageJson = path.join(__dirname, 'server', 'package.json');
    const nodeModules = path.join(__dirname, 'server', 'node_modules');
    
    if (!fs.existsSync(nodeModules)) {
        console.log('⚠️  Server dependencies not installed. Installing...');
        if (!runCommand('cd server && npm install', 'Install server dependencies')) return false;
    } else {
        console.log('✅ Server dependencies are installed');
    }

    return true;
}

function displayEnvironmentVariables() {
    console.log('\n🔐 Environment Variables Required for Railway:');
    console.log('=============================================');
    
    const envVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY', 
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET',
        'NODE_ENV=production',
        'PORT=3001',
        'BCRYPT_ROUNDS=12'
    ];

    envVars.forEach(envVar => {
        console.log(`   ${envVar}`);
    });

    console.log('\n📝 You will need to set these in Railway dashboard after deployment.');
}

function createRailwayConfig() {
    console.log('\n⚙️  Creating Railway configuration...');
    
    // Create nixpacks.toml for better build configuration
    const nixpacksConfig = `
[phases.setup]
nixPkgs = ['nodejs-18_x', 'npm-9_x']

[phases.install]
cmds = ['npm ci --prefix server']

[phases.build]
cmds = ['echo "No build step required for static frontend"']

[start]
cmd = 'cd server && npm start'
`;

    fs.writeFileSync('nixpacks.toml', nixpacksConfig.trim());
    console.log('✅ Created nixpacks.toml configuration');

    // Update package.json scripts for Railway
    const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    rootPackageJson.scripts = {
        ...rootPackageJson.scripts,
        "railway:install": "cd server && npm install",
        "railway:build": "echo 'No build step required'",
        "railway:start": "cd server && npm start"
    };

    fs.writeFileSync('package.json', JSON.stringify(rootPackageJson, null, 2));
    console.log('✅ Updated package.json for Railway');
}

async function deployToRailway() {
    console.log('\n🚂 Starting Railway deployment...');
    
    // Login to Railway
    if (!runCommand('railway login', 'Login to Railway')) {
        console.log('Please complete the login process in your browser');
        return false;
    }

    // Create new Railway project
    if (!runCommand('railway init', 'Initialize Railway project')) return false;

    // Deploy to Railway
    if (!runCommand('railway up', 'Deploy to Railway')) return false;

    console.log('\n🎉 Deployment initiated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to your Railway dashboard: https://railway.app/dashboard');
    console.log('   2. Find your new project');
    console.log('   3. Go to Variables tab and add your environment variables');
    console.log('   4. Wait for deployment to complete');
    console.log('   5. Test your live application');

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

        // Create Railway configuration
        createRailwayConfig();

        // Ask user if they want to proceed
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\n🚀 Ready to deploy to Railway? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                rl.close();
                
                if (await deployToRailway()) {
                    console.log('\n✅ Railway deployment completed successfully!');
                    process.exit(0);
                } else {
                    console.log('\n❌ Railway deployment failed!');
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

module.exports = { deployToRailway, checkPrerequisites };