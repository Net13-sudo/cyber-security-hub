// Script to generate bcrypt hash for super admin password
const bcrypt = require('bcrypt');

const password = 'Polaris@1024#';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        process.exit(1);
    }

    console.log('\n==============================================');
    console.log('SUPER ADMIN PASSWORD HASH GENERATED');
    console.log('==============================================');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this hash in your Supabase migration SQL:');
    console.log(`'${hash}'`);
    console.log('==============================================\n');

    process.exit(0);
});
