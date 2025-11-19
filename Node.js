/* import-users-scrypt.js
   Node script to import users hashed with SCRYPT into Firebase Auth (Admin SDK).
   Usage:
     npm i firebase-admin
     node import-users-scrypt.js users.json
*/
const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const usersFile = process.argv[2];
if(!usersFile){ console.error('usage: node import-users-scrypt.js users.json'); process.exit(1); }

const raw = fs.readFileSync(usersFile, 'utf8');
const users = JSON.parse(raw);

// convert base64 keys from your hash_config
const hash = {
  algorithm: 'SCRYPT',
  signerKey: Buffer.from('n66lOBaDgnBQ9hp2hkH/iCL7R3SKerzVO0wXgFdbGY3u0Fa/GlJ/AaYMBPc/HOFwXGwAM49yiX4sHIN9TR9YIg==','base64'),
  saltSeparator: Buffer.from('Bw==','base64'),
  rounds: 8,
  memoryCost: 1 << 14
};

const firebaseUsers = users.map(u => ({
  uid: u.uid,
  email: u.email,
  displayName: u.displayName,
  passwordHash: Buffer.from(u.hash, 'base64'),
  passwordSalt: Buffer.from(u.salt, 'base64')
}));

admin.auth().importUsers(firebaseUsers, {hash}).then(res => {
  console.log('Import result:', res);
}).catch(err => console.error('Import error', err));
