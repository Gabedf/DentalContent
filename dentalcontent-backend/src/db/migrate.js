require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./index');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8');
  try {
    await db.query(sql);
    console.log('✅ Migrations executadas com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro nas migrations:', err.message);
    process.exit(1);
  }
}

migrate();
