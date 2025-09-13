// backend/scripts/clearRegistrations.js

/* eslint-env node */
require('dotenv').config();
const readline = require('readline');
const db = require('../db');

(async () => {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('⚠️ Are you sure you want to DELETE ALL registrations? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Aborted.');
        rl.close();
        process.exit(0);
      }

      const [result] = await db.query('DELETE FROM registrations');
      console.log(`✅ Deleted ${result.affectedRows} registrations`);

      rl.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error clearing registrations:', err);
    process.exit(1);
  }
})();
