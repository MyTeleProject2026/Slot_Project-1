// save as reset-password.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'SuperAdmin@123'; // change this
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash:', hash);
  console.log('Use this in SQL:');
  console.log(`UPDATE users SET password = '${hash}' WHERE username = 'main_admin';`);
}

generateHash();
