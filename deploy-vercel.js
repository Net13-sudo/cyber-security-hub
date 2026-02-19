#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Scorpion Security Hub - Serverless Full Stack Deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔺 Scorpion Security Hub - Vercel Deployment');
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
    
    // Check if Vercel CLI is installed
    try {
        execSync('vercel --version', { stdio: 'pipe' });
        console.log('✅ Vercel CLI is installed');
    } catch (error) {
        console.error('❌ Vercel CLI not found. Installing...');
        if (!runCommand('npm install -g vercel', 'Install Vercel CLI')) {
            return false;
        }
    }

    // Check if we're in a git repository
    try {
        execSync('git status', { stdio: 'pipe' });
        console.log('✅ Git repository detected');
    } catch (error) {
        console.log('⚠️  Not a git repository. Initializing...');
        if (!runCommand('git init', 'Initialize Git repository')) return false;
        if (!runCommand('git add .', 'Add files to Git')) return false;
        if (!runCommand('git commit -m "Initial commit for Vercel deployment"', 'Create initial commit')) return false;
    }

    // Check if vercel.json exists
    const vercelJsonPath = path.join(__dirname, 'vercel.json');
    if (!fs.existsSync(vercelJsonPath)) {
        console.error('❌ vercel.json not found');
        return false;
    } else {
        console.log('✅ Vercel configuration found');
    }

    // Check server dependencies
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
    console.log('\n🔐 Environment Variables Required for Vercel:');
    console.log('============================================');
    
    const envVars = [
        'SUPABASE_URL - Your Supabase project URL',
        'SUPABASE_ANON_KEY - Your Supabase anonymous key', 
        'SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key',
        'JWT_SECRET - A secure random string for JWT tokens'
    ];

    envVars.forEach(envVar => {
        console.log(`   ${envVar}`);
    });

    console.log('\n📝 You can set these using Vercel CLI or dashboard after deployment.');
    console.log('\nCommands to set environment variables:');
    console.log('   vercel env add SUPABASE_URL');
    console.log('   vercel env add SUPABASE_ANON_KEY');
    console.log('   vercel env add SUPABASE_SERVICE_ROLE_KEY');
    console.log('   vercel env add JWT_SECRET');
}

function createVercelIgnore() {
    console.log('\n📝 Creating .vercelignore file...');
    
    const vercelIgnore = `
# Dependencies
node_modules/
server/node_modules/

# Development files
.env
.env.local
.env.example
server/.env
server/.env.example

# Database files
*.sqlite
*.db
server/src/db/*.sqlite
server/data/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Deployment files
deploy-*.js
*.md
!README.md

# Test files
server/test-*.js
server/*test*.js
`;

    fs.writeFileSync('.vercelignore', vercelIgnore.trim());
    console.log('✅ Created .vercelignore file');
}

async function deployToVercel() {
    console.log('\n🔺 Starting Vercel deployment...');
    
    // Create .vercelignore
    createVercelIgnore();
    
    // Login to Vercel
    if (!runCommand('vercel login', 'Login to Vercel')) {
        console.log('Please complete the login process in your browser');
        return false;
    }

    // Deploy to Vercel
    if (!runCommand('vercel --prod', 'Deploy to Vercel')) return false;

    console.log('\n🎉 Vercel deployment completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to your Vercel dashboard: https://vercel.com/dashboard');
    console.log('   2. Find your project: scorpion-security-hub');
    console.log('   3. Go to Settings → Environment Variables');
    console.log('   4. Add your Supabase credentials');
    console.log('   5. Redeploy if needed: vercel --prod');
    console.log('   6. Test your live application');

    return true;
}

function setupEnvironmentVariables() {
    console.log('\n🔧 Setting up environment variables...');
    console.log('You can set these now or later in the Vercel dashboard');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('\nWould you like to set environment variables now? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                console.log('\nSetting environment variables...');
                console.log('You will be prompted for each variable:');
                
                // Note: In a real implementation, you'd collect these values
                // For now, we'll just show the commands
                console.log('\nRun these commands after deployment:');
                console.log('   vercel env add SUPABASE_URL production');
                console.log('   vercel env add SUPABASE_ANON_KEY production');
                console.log('   vercel env add SUPABASE_SERVICE_ROLE_KEY production');
                console.log('   vercel env add JWT_SECRET production');
            }
            
            rl.close();
            resolve(true);
        });
    });
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

        // Setup environment variables
        await setupEnvironmentVariables();

        // Ask user if they want to proceed
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\n🚀 Ready to deploy to Vercel? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                rl.close();
                
                if (await deployToVercel()) {
                    console.log('\n✅ Vercel deployment completed successfully!');
                    process.exit(0);
                } else {
                    console.log('\n❌ Vercel deployment failed!');
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

module.exports = { deployToVercel, checkPrerequisites };