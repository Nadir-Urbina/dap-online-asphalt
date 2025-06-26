// Setup script to create the first admin user
// Run this with: node setup-admin.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 DAP Plant Admin Setup');
console.log('========================');
console.log('This script will help you create the first admin user for your system.');
console.log('');

function createAdminUser() {
  rl.question('Enter admin email (@duvalasphalt.com): ', (email) => {
    if (!email.endsWith('@duvalasphalt.com')) {
      console.log('❌ Email must end with @duvalasphalt.com');
      return createAdminUser();
    }

    rl.question('Enter first name: ', (firstName) => {
      rl.question('Enter last name: ', (lastName) => {
        rl.question('Enter temporary password (min 6 characters): ', (password) => {
          if (password.length < 6) {
            console.log('❌ Password must be at least 6 characters');
            return createAdminUser();
          }

          console.log('');
          console.log('📝 Creating admin user...');
          console.log('');
          console.log('Please make the following API call to your running app:');
          console.log('');
          console.log('curl -X POST http://localhost:3000/api/admin/create-user \\');
          console.log('  -H "Content-Type: application/json" \\');
          console.log('  -d \'{"email":"' + email + '","firstName":"' + firstName + '","lastName":"' + lastName + '","role":"admin","temporaryPassword":"' + password + '"}\'');
          console.log('');
          console.log('Or use this JSON body in Postman/Insomnia:');
          console.log('');
          console.log(JSON.stringify({
            email,
            firstName,
            lastName,
            role: 'admin',
            temporaryPassword: password
          }, null, 2));
          console.log('');
          console.log('⚠️  IMPORTANT: Make sure to save the temporary password securely.');
          console.log('   The user will need to change it on first login.');
          console.log('');
          console.log('✅ After creating this user, they can log in at http://localhost:3000/admin');

          rl.close();
        });
      });
    });
  });
}

createAdminUser(); 