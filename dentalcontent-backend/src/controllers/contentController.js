const contentService = require('../services/contentService');

const VALID_TYPES      = ['educativo','autoridade','quebra_objecao','bastidores','depoimento','procedimento'];
const VALID_OBJECTIVES = ['atrair_pacientes','educar','construir_autoridade'];
const VALID_TONES      = ['formal','acessivel','tecnico','humanizado'];
const VALID_STATUSES   = ['idea','generated','approved','scheduled','published'];
const VALID_SECTIONS   = ['headlines','caption','short_version','hashtags','carousel'];

async function generate(req, res, next) {
  try {
    const { profile_id, content_type, theme, objective, tone } = req.body;
    if (!profile_id || !content_type || !theme || !objective || !tone)
      return res.status(400).json({ error: 'Campos obrigatórios: profile_id, content_type, theme, objective, tone.' });
    if (!VALID_TYPES.includes(content_type))
      return res.status(400).json({ error: `content_type inválido.` });
    if (!VALID_OBJECTIVES.includes(objective))
      return res.status(400).json({ error: `objective inválido.` });
    if (!VALID_TONES.includes(tone))
      return res.status(400).json({ error: `tone inválido.` });

    const content = await contentService.generateContent(req.user.id, { profile_id, content_type, theme, objective, tone });
    res.status(201).json(content);
  } catch (err) { next(err); }
}

// ── Editar campos do conteúdo ────────────────────────────────────
async function update(req, res, next) {
  try {
    const allowed = ['headlines','caption','short_version','hashtags','carousel'];
    const fields = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) fields[k] = req.body[k];
    }
    if (Object.keys(fields).length === 0)
      return res.status(400).json({ error: 'Nenhum campo válido enviado.' });

    const content = await contentService.updateContent(req.params.id, req.user.id, fields);
    res.json(content);
  } catch (err) { next(err); }
}

// ── Regenerar seção específica ───────────────────────────────────
async function regenerateSection(req, res, next) {
  try {
    const { section } = req.body;
    if (!section || !VALID_SECTIONS.includes(section))
      return res.status(400).json({ error: `Seção inválida. Opções: ${VALID_SECTIONS.join(', ')}` });

    const result = await contentService.regenerateField(req.params.id, req.user.id, section);
    res.json(result);
  } catch (err) { next(err); }
}

// ── Bateria: sugerir plano do mês ────────────────────────────────
async function suggestBattery(req, res, next) {
  try {
    const { profile_id, month, year, posts_per_week = 3 } = req.body;
    if (!profile_id || !month || !year)
      return res.status(400).json({ error: 'Campos obrigatórios: profile_id, month, year.' });

    const suggestion = await contentService.suggestBatch({ userId: req.user.id, profile_id, posts_per_week, month, year });
    res.json(suggestion);
  } catch (err) { next(err); }
}

// ── Bateria: gerar todos os conteúdos aprovados ──────────────────
async function generateBattery(req, res, next) {
  try {
    const { profile_id, suggestions, month, year, posts_per_week = 3 } = req.body;
    if (!profile_id || !suggestions?.length || !month || !year)
      return res.status(400).json({ error: 'Campos obrigatórios: profile_id, suggestions, month, year.' });

    const result = await contentService.generateBatch({ userId: req.user.id, profile_id, suggestions, month, year, posts_per_week });
    res.json(result);
  } catch (err) { next(err); }
}

// ── CRUD padrão ──────────────────────────────────────────────────
async function list(req, res, next) {
  try {
    const { profile_id, status, month, year } = req.query;
    const contents = await contentService.getContents(req.user.id, { profile_id, status, month, year });
    res.json(contents);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `status inválido.` });
    const content = await contentService.updateStatus(req.params.id, req.user.id, status);
    res.json(content);
  } catch (err) { next(err); }
}

async function schedule(req, res, next) {
  try {
    const { scheduled_date } = req.body;
    if (!scheduled_date)
      return res.status(400).json({ error: 'scheduled_date é obrigatório (YYYY-MM-DD).' });
    const content = await contentService.scheduleContent(req.params.id, req.user.id, scheduled_date);
    res.json(content);
  } catch (err) { next(err); }
}

async function usage(req, res, next) {
  try {
    const stats = await contentService.getUsageStats(req.user.id, req.user.plan);
    res.json(stats);
  } catch (err) { next(err); }
}

module.exports = { generate, update, regenerateSection, suggestBattery, generateBattery, list, updateStatus, schedule, usage };