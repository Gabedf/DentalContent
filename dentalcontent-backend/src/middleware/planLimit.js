const db = require('../db');

// Limites mensais por plano
const PLAN_LIMITS = {
  gratis:    10,
  essencial: 20,
  pro:       60,
  clinica:   Infinity,
};

const IMAGE_LIMITS = {
  gratis:    1,   // total vitalício
  essencial: 0,
  pro:       20,
  clinica:   60,
};

// Duração do trial gratuito: 3 meses = 90 dias
const FREE_TRIAL_DAYS = 90;

// ── Helpers de contagem ───────────────────────────────────────────

async function getMonthlyCount(userId) {
  const result = await db.query(
    `SELECT COUNT(*) AS count FROM generations
     WHERE user_id = $1
       AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

async function getMonthlyImageCount(userId) {
  const result = await db.query(
    `SELECT COUNT(*) AS count FROM image_generations
     WHERE user_id = $1
       AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

async function getTotalImageCount(userId) {
  const result = await db.query(
    'SELECT COUNT(*) AS count FROM image_generations WHERE user_id = $1',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

// ── CORREÇÃO SEGURANÇA: busca plano sempre do banco ───────────────
// Nunca confiar no plan do JWT — ele pode estar stale por até 7 dias
async function getCurrentPlan(userId) {
  const result = await db.query(
    'SELECT plan FROM users WHERE id = $1 AND active = true',
    [userId]
  );
  if (result.rows.length === 0) throw { status: 401, message: 'Usuário não encontrado.' };
  return result.rows[0].plan;
}

// ── NOVO: Verifica se trial gratuito expirou ──────────────────────
async function checkFreeTrialExpired(req, res, next) {
  try {
    const userId = req.user.id;

    // Busca plano e data de criação do banco
    const result = await db.query(
      'SELECT plan, created_at FROM users WHERE id = $1 AND active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const { plan, created_at } = result.rows[0];

    // Só aplica verificação para plano gratuito
    if (plan !== 'gratis') {
      req.user.plan = plan; // injeta plan atualizado
      return next();
    }

    // Calcula dias desde criação da conta
    const createdAt = new Date(created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    // Verifica se passou do período de trial
    if (daysSinceCreation > FREE_TRIAL_DAYS) {
      return res.status(403).json({
        error: 'Período de teste expirado.',
        message: 'Seu período de teste de 3 meses expirou. Faça upgrade para continuar gerando conteúdo.',
        expired: true,
        days_since_creation: daysSinceCreation,
        trial_limit_days: FREE_TRIAL_DAYS,
        upgrade_required: true,
      });
    }

    // Trial ainda válido
    req.user.plan = plan; // injeta plan atualizado
    req.trialDaysRemaining = FREE_TRIAL_DAYS - daysSinceCreation;
    next();
  } catch (err) {
    console.error('Erro ao verificar trial:', err);
    next(err);
  }
}

// ── Middlewares ───────────────────────────────────────────────────

async function checkPlanLimit(req, res, next) {
  try {
    const userId = req.user.id;

    // Busca plano atual do banco — ignora o plan do JWT
    const plan = await getCurrentPlan(userId);

    const limit = PLAN_LIMITS[plan] ?? 0;
    if (limit === Infinity) return next();

    const count = await getMonthlyCount(userId);
    if (count >= limit) {
      return res.status(429).json({
        error: 'Limite mensal de gerações atingido. Faça upgrade para continuar.',
        limit,
        used: count,
        plan,
      });
    }

    // Injeta plan atualizado para uso nos controllers
    req.user.plan = plan;
    req.generationCount = count;
    next();
  } catch (err) {
    next(err);
  }
}

async function checkImageLimit(req, res, next) {
  try {
    const userId = req.user.id;

    // Busca plano atual do banco — ignora o plan do JWT
    const plan = await getCurrentPlan(userId);

    const limit = IMAGE_LIMITS[plan] ?? 0;

    if (limit === 0) {
      return res.status(403).json({
        error: 'Geração de imagens não está disponível no plano Essencial. Faça upgrade para o Pro.',
        plan,
      });
    }

    // Plano grátis: limite total (não mensal)
    if (plan === 'gratis') {
      const total = await getTotalImageCount(userId);
      if (total >= limit) {
        return res.status(429).json({
          error: 'Você atingiu o limite de 1 imagem do plano Grátis. Faça upgrade para gerar mais.',
          limit,
          used: total,
          plan,
        });
      }
    } else {
      const count = await getMonthlyImageCount(userId);
      if (count >= limit) {
        return res.status(429).json({
          error: 'Limite mensal de imagens atingido. Faça upgrade para continuar.',
          limit,
          used: count,
          plan,
        });
      }
    }

    // Injeta plan atualizado
    req.user.plan = plan;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkPlanLimit,
  checkImageLimit,
  checkFreeTrialExpired,
  getMonthlyCount,
  PLAN_LIMITS,
  IMAGE_LIMITS,
  FREE_TRIAL_DAYS,
};