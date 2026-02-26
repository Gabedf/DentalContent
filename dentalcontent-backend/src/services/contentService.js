const OpenAI = require('openai');
const db = require('../db');
const {
  buildSystemPrompt,
  buildUserPrompt,
  buildRegenerateSectionPrompt,
  buildBatchSuggestionPrompt,
} = require('./promptBuilder');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_SECTIONS = ['headlines', 'caption', 'short_version', 'hashtags', 'carousel'];

// ── Helpers internos ──────────────────────────────────────────────

async function callOpenAI(messages, max_tokens = 2000) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens,
    messages,
  });
  const raw = completion.choices[0].message.content.trim();
  const tokens = completion.usage?.total_tokens || 0;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw { status: 500, message: 'Erro ao processar resposta da IA.' };
    parsed = JSON.parse(match[0]);
  }
  return { parsed, tokens };
}

async function getProfile(profileId, userId) {
  const r = await db.query('SELECT * FROM profiles WHERE id = $1 AND user_id = $2', [profileId, userId]);
  if (r.rows.length === 0) throw { status: 404, message: 'Perfil não encontrado.' };
  return r.rows[0];
}

async function getContent(contentId, userId) {
  const r = await db.query('SELECT * FROM contents WHERE id = $1 AND user_id = $2', [contentId, userId]);
  if (r.rows.length === 0) throw { status: 404, message: 'Conteúdo não encontrado.' };
  return r.rows[0];
}

// ── Gerar conteúdo completo ───────────────────────────────────────

async function generateContent(userId, { profile_id, content_type, theme, objective, tone }) {
  const profile = await getProfile(profile_id, userId);

  const { parsed, tokens } = await callOpenAI([
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user',   content: buildUserPrompt({ profile, content_type, theme, objective, tone }) },
  ]);

  const r = await db.query(
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

  const content = r.rows[0];
  await db.query(
    'INSERT INTO generations (user_id, content_id, tokens_used) VALUES ($1,$2,$3)',
    [userId, content.id, tokens]
  );
  return content;
}

// ── Editar campos manualmente ─────────────────────────────────────

async function updateContent(contentId, userId, fields) {
  const ALLOWED = ['headlines', 'caption', 'short_version', 'hashtags', 'carousel'];
  const JSON_FIELDS = new Set(['headlines', 'hashtags', 'carousel']);
  const updates = [];
  const values = [];
  let idx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (!ALLOWED.includes(key)) continue;
    updates.push(`${key} = $${idx++}`);
    values.push(JSON_FIELDS.has(key) ? JSON.stringify(val) : val);
  }

  if (updates.length === 0) throw { status: 400, message: 'Nenhum campo válido.' };
  updates.push(`edited = true`);
  values.push(contentId, userId);

  const r = await db.query(
    `UPDATE contents SET ${updates.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING *`,
    values
  );
  if (r.rows.length === 0) throw { status: 404, message: 'Conteúdo não encontrado.' };
  return r.rows[0];
}

// ── Regenerar seção específica ────────────────────────────────────

async function regenerateField(contentId, userId, section) {
  if (!VALID_SECTIONS.includes(section)) {
    throw { status: 400, message: `Seção inválida. Opções: ${VALID_SECTIONS.join(', ')}` };
  }

  const content = await getContent(contentId, userId);
  const profile = await getProfile(content.profile_id, userId);

  const prompt = buildRegenerateSectionPrompt({
    section, profile,
    content_type: content.content_type,
    theme: content.theme,
    objective: content.objective,
    tone: content.tone,
    currentContent: {
      headlines:    content.headlines,
      caption:      content.caption,
      short_version: content.short_version,
      hashtags:     content.hashtags,
      carousel:     content.carousel,
    },
  });

  const { parsed, tokens } = await callOpenAI([{ role: 'user', content: prompt }], 1000);

  const newValue = parsed[section];
  if (newValue === undefined) throw { status: 500, message: 'IA não retornou a seção esperada.' };

  const isJson = ['headlines', 'hashtags', 'carousel'].includes(section);

  const r = await db.query(
    `UPDATE contents SET ${section} = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [isJson ? JSON.stringify(newValue) : newValue, contentId, userId]
  );

  await db.query(
    'INSERT INTO generations (user_id, content_id, tokens_used) VALUES ($1,$2,$3)',
    [userId, contentId, tokens]
  );

  return { content: r.rows[0], section, newValue };
}

// ── Sugerir plano editorial do mês ───────────────────────────────

async function suggestBatch({ userId, profile_id, posts_per_week, month, year }) {
  const profile = await getProfile(profile_id, userId);
  const prompt = buildBatchSuggestionPrompt({ profile, postsPerWeek: posts_per_week, targetMonth: month, targetYear: year });
  const { parsed } = await callOpenAI([{ role: 'user', content: prompt }], 2000);
  return parsed;
}

// ── Gerar bateria completa e auto-agendar ─────────────────────────

async function generateBatch({ userId, profile_id, suggestions, month, year, posts_per_week }) {
  const profile = await getProfile(profile_id, userId);

  // Calcula datas reais para cada post no mês
  const weekDays = posts_per_week >= 3 ? [1, 3, 5] : posts_per_week === 2 ? [1, 4] : [3];
  const dates = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    if (weekDays.includes(d.getDay())) dates.push(new Date(d).toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }

  const results = [];
  for (let i = 0; i < suggestions.length; i++) {
    const suggestion = suggestions[i];
    try {
      const { parsed, tokens } = await callOpenAI([
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user',   content: buildUserPrompt({
            profile,
            content_type: suggestion.content_type,
            theme:        suggestion.theme,
            objective:    suggestion.objective,
            tone:         suggestion.tone || profile.preferred_tone,
          })
        },
      ]);

      const scheduledDate = dates[i] || null;

      const r = await db.query(
        `INSERT INTO contents
           (user_id, profile_id, content_type, theme, objective, tone,
            headlines, caption, short_version, hashtags, carousel, status, scheduled_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          userId, profile_id,
          suggestion.content_type, suggestion.theme,
          suggestion.objective, suggestion.tone || profile.preferred_tone,
          JSON.stringify(parsed.headlines),
          parsed.caption, parsed.short_version,
          JSON.stringify(parsed.hashtags),
          JSON.stringify(parsed.carousel),
          scheduledDate ? 'scheduled' : 'generated',
          scheduledDate,
        ]
      );

      await db.query(
        'INSERT INTO generations (user_id, content_id, tokens_used) VALUES ($1,$2,$3)',
        [userId, r.rows[0].id, tokens]
      );

      results.push({ ok: true, content: r.rows[0], scheduled_date: scheduledDate });
    } catch (err) {
      results.push({ ok: false, error: err.message || 'Erro', suggestion });
    }
  }

  return {
    generated: results.filter(r => r.ok).length,
    failed:    results.filter(r => !r.ok).length,
    results,
  };
}

// ── CRUD padrão ───────────────────────────────────────────────────

async function getContents(userId, { profile_id, status, month, year } = {}) {
  const conds = ['c.user_id = $1'];
  const vals = [userId];
  let idx = 2;

  if (profile_id)  { conds.push(`c.profile_id = $${idx++}`); vals.push(profile_id); }
  if (status)      { conds.push(`c.status = $${idx++}`);      vals.push(status); }
  if (month && year) {
    conds.push(`EXTRACT(MONTH FROM c.scheduled_date) = $${idx++}`);
    conds.push(`EXTRACT(YEAR FROM c.scheduled_date) = $${idx++}`);
    vals.push(month, year);
  }

  const r = await db.query(
    `SELECT c.*, p.subniche, p.name AS profile_name
     FROM contents c JOIN profiles p ON p.id = c.profile_id
     WHERE ${conds.join(' AND ')}
     ORDER BY c.created_at DESC`,
    vals
  );
  return r.rows;
}

async function updateStatus(contentId, userId, status) {
  const r = await db.query(
    `UPDATE contents SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *`,
    [status, contentId, userId]
  );
  if (r.rows.length === 0) throw { status: 404, message: 'Conteúdo não encontrado.' };
  return r.rows[0];
}

async function scheduleContent(contentId, userId, scheduled_date) {
  const r = await db.query(
    `UPDATE contents SET scheduled_date=$1, status='scheduled' WHERE id=$2 AND user_id=$3 RETURNING *`,
    [scheduled_date, contentId, userId]
  );
  if (r.rows.length === 0) throw { status: 404, message: 'Conteúdo não encontrado.' };
  return r.rows[0];
}

async function getUsageStats(userId, plan) {
  const { PLAN_LIMITS } = require('../middleware/planLimit');
  const r = await db.query(
    `SELECT COUNT(*) AS used FROM generations
     WHERE user_id=$1 AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
    [userId]
  );
  const used = parseInt(r.rows[0].used, 10);
  const limit = PLAN_LIMITS[plan];
  return { used, limit: limit === Infinity ? 'unlimited' : limit, plan };
}

module.exports = {
  generateContent, updateContent, regenerateField,
  suggestBatch, generateBatch,
  getContents, updateStatus, scheduleContent, getUsageStats,
};