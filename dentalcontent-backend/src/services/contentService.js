const OpenAI = require('openai');
const db = require('../db');
const { buildSystemPrompt, buildUserPrompt } = require('./promptBuilder');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Gera conteúdo via OpenAI, salva no banco e registra a geração.
 */
async function generateContent(userId, { profile_id, content_type, theme, objective, tone }) {
  // Busca perfil e valida propriedade
  const profileResult = await db.query(
    'SELECT * FROM profiles WHERE id = $1 AND user_id = $2',
    [profile_id, userId]
  );
  if (profileResult.rows.length === 0) {
    throw { status: 404, message: 'Perfil não encontrado.' };
  }
  const profile = profileResult.rows[0];

  // Chama OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 2000,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt({ profile, content_type, theme, objective, tone }) },
    ],
  });

  const rawText = completion.choices[0].message.content.trim();
  const tokensUsed = completion.usage?.total_tokens || 0;

  // Parse do JSON retornado pela IA
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Tenta extrair JSON caso venha com markdown
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) throw { status: 500, message: 'Erro ao processar resposta da IA.' };
    parsed = JSON.parse(match[0]);
  }

  // Salva conteúdo
  const contentResult = await db.query(
    `INSERT INTO contents
       (user_id, profile_id, content_type, theme, objective, tone,
        headlines, caption, short_version, hashtags, carousel, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'generated')
     RETURNING *`,
    [
      userId, profile_id, content_type, theme, objective, tone,
      JSON.stringify(parsed.headlines),
      parsed.caption,
      parsed.short_version,
      JSON.stringify(parsed.hashtags),
      JSON.stringify(parsed.carousel),
    ]
  );

  const content = contentResult.rows[0];

  // Registra geração para controle de limite
  await db.query(
    'INSERT INTO generations (user_id, content_id, tokens_used) VALUES ($1, $2, $3)',
    [userId, content.id, tokensUsed]
  );

  return content;
}

/**
 * Lista conteúdos do usuário com filtros opcionais.
 */
async function getContents(userId, { profile_id, status, month, year } = {}) {
  const conditions = ['c.user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (profile_id) {
    conditions.push(`c.profile_id = $${idx++}`);
    values.push(profile_id);
  }

  if (status) {
    conditions.push(`c.status = $${idx++}`);
    values.push(status);
  }

  // Filtro de calendário por mês/ano
  if (month && year) {
    conditions.push(`EXTRACT(MONTH FROM c.scheduled_date) = $${idx++}`);
    conditions.push(`EXTRACT(YEAR FROM c.scheduled_date) = $${idx++}`);
    values.push(month, year);
  }

  const sql = `
    SELECT c.*, p.subniche, p.name AS profile_name
    FROM contents c
    JOIN profiles p ON p.id = c.profile_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY c.created_at DESC
  `;

  const result = await db.query(sql, values);
  return result.rows;
}

/**
 * Atualiza o status (kanban).
 */
async function updateStatus(contentId, userId, status) {
  const result = await db.query(
    `UPDATE contents SET status = $1
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [status, contentId, userId]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'Conteúdo não encontrado.' };
  return result.rows[0];
}

/**
 * Agenda conteúdo (define scheduled_date e move para 'scheduled').
 */
async function scheduleContent(contentId, userId, scheduled_date) {
  const result = await db.query(
    `UPDATE contents
     SET scheduled_date = $1, status = 'scheduled'
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [scheduled_date, contentId, userId]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'Conteúdo não encontrado.' };
  return result.rows[0];
}

/**
 * Retorna contagem de gerações do mês para o usuário.
 */
async function getUsageStats(userId, plan) {
  const { PLAN_LIMITS } = require('../middleware/planLimit');
  const result = await db.query(
    `SELECT COUNT(*) AS used
     FROM generations
     WHERE user_id = $1
       AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
    [userId]
  );
  const used = parseInt(result.rows[0].used, 10);
  const limit = PLAN_LIMITS[plan];
  return { used, limit: limit === Infinity ? 'unlimited' : limit, plan };
}

module.exports = { generateContent, getContents, updateStatus, scheduleContent, getUsageStats };