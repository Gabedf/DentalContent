const contentService = require('../services/contentService');

const VALID_TYPES      = ['educativo','autoridade','quebra_objecao','bastidores','depoimento','procedimento'];
const VALID_OBJECTIVES = ['atrair_pacientes','educar','construir_autoridade'];
const VALID_TONES      = ['formal','acessivel','tecnico','humanizado'];
const VALID_STATUSES   = ['idea','generated','approved','scheduled','published'];

async function generate(req, res, next) {
  try {
    const { profile_id, content_type, theme, objective, tone } = req.body;

    if (!profile_id || !content_type || !theme || !objective || !tone) {
      return res.status(400).json({ error: 'Campos obrigatórios: profile_id, content_type, theme, objective, tone.' });
    }
    if (!VALID_TYPES.includes(content_type)) {
      return res.status(400).json({ error: `content_type inválido. Opções: ${VALID_TYPES.join(', ')}` });
    }
    if (!VALID_OBJECTIVES.includes(objective)) {
      return res.status(400).json({ error: `objective inválido. Opções: ${VALID_OBJECTIVES.join(', ')}` });
    }
    if (!VALID_TONES.includes(tone)) {
      return res.status(400).json({ error: `tone inválido. Opções: ${VALID_TONES.join(', ')}` });
    }

    const content = await contentService.generateContent(req.user.id, {
      profile_id, content_type, theme, objective, tone,
    });

    res.status(201).json(content);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { profile_id, status, month, year } = req.query;
    const contents = await contentService.getContents(req.user.id, { profile_id, status, month, year });
    res.json(contents);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status inválido. Opções: ${VALID_STATUSES.join(', ')}` });
    }
    const content = await contentService.updateStatus(req.params.id, req.user.id, status);
    res.json(content);
  } catch (err) {
    next(err);
  }
}

async function schedule(req, res, next) {
  try {
    const { scheduled_date } = req.body;
    if (!scheduled_date) {
      return res.status(400).json({ error: 'scheduled_date é obrigatório (formato: YYYY-MM-DD).' });
    }
    const content = await contentService.scheduleContent(req.params.id, req.user.id, scheduled_date);
    res.json(content);
  } catch (err) {
    next(err);
  }
}

async function usage(req, res, next) {
  try {
    const stats = await contentService.getUsageStats(req.user.id, req.user.plan);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, list, updateStatus, schedule, usage };
