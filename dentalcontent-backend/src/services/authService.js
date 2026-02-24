const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

async function register({ name, email, password }) {
  const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rows.length > 0) {
    throw { status: 409, message: 'E-mail já cadastrado.' };
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, plan, created_at`,
    [name, email, hash]
  );

  const user = result.rows[0];
  const token = signToken(user);
  return { user, token };
}

async function login({ email, password }) {
  const result = await db.query(
    'SELECT id, name, email, password_hash, plan, active FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];
  if (!user) throw { status: 401, message: 'Credenciais inválidas.' };
  if (!user.active) throw { status: 403, message: 'Conta desativada.' };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw { status: 401, message: 'Credenciais inválidas.' };

  delete user.password_hash;
  const token = signToken(user);
  return { user, token };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}



async function googleAuth({ google_id, email, name, avatar }) {
  // Busca usuário pelo email ou google_id
  let result = await db.query(
    'SELECT id, name, email, plan, active FROM users WHERE email = $1 OR google_id = $2',
    [email, google_id]
  );

  let user = result.rows[0];

  if (!user) {
    // Cria novo usuário via Google — sem senha
    const inserted = await db.query(
      `INSERT INTO users (name, email, google_id, avatar, password_hash)
       VALUES ($1, $2, $3, $4, '')
       RETURNING id, name, email, plan, active`,
      [name, email, google_id, avatar || null]
    );
    user = inserted.rows[0];
  } else {
    // Atualiza google_id e avatar se ainda não tinha
    await db.query(
      'UPDATE users SET google_id = $1, avatar = $2 WHERE id = $3',
      [google_id, avatar || null, user.id]
    );
  }

  if (!user.active) throw { status: 403, message: 'Conta desativada.' };

  const token = signToken(user);
  return { user, token };
}

module.exports = { register, login, googleAuth };