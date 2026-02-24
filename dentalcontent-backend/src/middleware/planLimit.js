const db = require('../db');

// Limites mensais por plano
const PLAN_LIMITS = {
  gratis:   10,
  essencial: 20,
  pro:       60,
  clinica:   Infinity,
};

async function getMonthlyCount(userId) {
  const result = await db.query(
    `SELECT COUNT(*) AS count
     FROM generations
     WHERE user_id = $1
       AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

async function checkPlanLimit(req, res, next) {
  try {
    const { id: userId, plan } = req.user;
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

    req.generationCount = count;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { checkPlanLimit, getMonthlyCount, PLAN_LIMITS };

// Limites mensais de geração de imagem por plano
const IMAGE_LIMITS = {
  gratis:    1,  // 1 imagem total (não mensal — verificado separado)
  essencial: 0,  // sem imagens
  pro:       20,
  clinica:   60,
};

async function getMonthlyImageCount(userId) {
  const result = await db.query(
    `SELECT COUNT(*) AS count
     FROM image_generations
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

async function checkImageLimit(req, res, next) {
  try {
    const { id: userId, plan } = req.user;
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

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { checkPlanLimit, getMonthlyCount, PLAN_LIMITS, checkImageLimit, IMAGE_LIMITS };