const db = require('../db');

const PLAN_LIMITS = {
  essencial: 20,
  pro: 60,
  clinica: Infinity,
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
    const { id: userId } = req.user;

    console.log('=== PLAN LIMIT CHECK ===')
    console.log('userId:', userId)

    const userResult = await db.query(
      'SELECT plan FROM users WHERE id = $1',
      [userId]
    );

    console.log('userResult:', userResult.rows)

    if (!userResult.rows.length) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const plan = userResult.rows[0].plan;
    const limit = PLAN_LIMITS[plan] ?? 0;

    console.log('plan:', plan, '| limit:', limit)

    if (limit === Infinity) return next();

    const count = await getMonthlyCount(userId);
    console.log('count:', count, '| limit:', limit)

    if (count >= limit) {
      return res.status(429).json({
        error: 'Limite mensal de gerações atingido.',
        limit,
        used: count,
        plan,
      });
    }

    req.generationCount = count;
    next();
  } catch (err) {
    console.log('ERRO no planLimit:', err)
    next(err);
  }
}

module.exports = { checkPlanLimit, getMonthlyCount, PLAN_LIMITS };