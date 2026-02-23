const db = require('../db');

async function createProfile(userId, { name, subniche, city, preferred_tone }) {
  const result = await db.query(
    `INSERT INTO profiles (user_id, name, subniche, city, preferred_tone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, name, subniche, city, preferred_tone || 'acessivel']
  );
  return result.rows[0];
}

async function getProfiles(userId) {
  const result = await db.query(
    'SELECT * FROM profiles WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows;
}

async function updateProfile(profileId, userId, fields) {
  const allowed = ['name', 'subniche', 'city', 'preferred_tone'];
  const updates = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }

  if (updates.length === 0) throw { status: 400, message: 'Nenhum campo para atualizar.' };

  values.push(profileId, userId);
  const result = await db.query(
    `UPDATE profiles SET ${updates.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) throw { status: 404, message: 'Perfil não encontrado.' };
  return result.rows[0];
}

module.exports = { createProfile, getProfiles, updateProfile };
