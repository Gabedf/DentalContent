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