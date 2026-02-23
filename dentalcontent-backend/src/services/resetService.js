const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sendPasswordReset } = require('./emailService');

// Gera token seguro e salva no banco
async function requestReset(email) {
  const result = await db.query(
    'SELECT id, name, email FROM users WHERE email = $1 AND active = true',
    [email]
  );

  // Não revela se o e-mail existe ou não (segurança)
  if (result.rows.length === 0) return;

  const user = result.rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  // Salva token na tabela password_resets
  await db.query(
    `INSERT INTO password_resets (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, used = false`,
    [user.id, token, expiresAt]
  );

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendPasswordReset(user.email, user.name, resetUrl);
}

// Valida token e atualiza senha
async function resetPassword(token, newPassword) {
  const result = await db.query(
    `SELECT pr.user_id, pr.expires_at, pr.used
     FROM password_resets pr
     WHERE pr.token = $1`,
    [token]
  );

  if (result.rows.length === 0) {
    throw { status: 400, message: 'Token inválido ou expirado.' };
  }

  const reset = result.rows[0];

  if (reset.used) {
    throw { status: 400, message: 'Este link já foi utilizado.' };
  }

  if (new Date() > new Date(reset.expires_at)) {
    throw { status: 400, message: 'Link expirado. Solicite um novo.' };
  }

  const hash = await bcrypt.hash(newPassword, 10);

  // Atualiza senha e marca token como usado
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, reset.user_id]);
  await db.query('UPDATE password_resets SET used = true WHERE token = $1', [token]);
}

module.exports = { requestReset, resetPassword };
