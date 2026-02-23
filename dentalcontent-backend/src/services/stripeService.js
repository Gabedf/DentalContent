const Stripe = require('stripe');
const db = require('../db');

const stripe = process.env.STRIPE_SECRET_KEY
  ? Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PLAN_PRICE_IDS = {
  essencial: process.env.STRIPE_PRICE_ESSENCIAL,
  pro:       process.env.STRIPE_PRICE_PRO,
  clinica:   process.env.STRIPE_PRICE_CLINICA,
};

function getPlanByPriceId(priceId) {
  return Object.entries(PLAN_PRICE_IDS).find(([, v]) => v === priceId)?.[0] || null;
}

async function createCheckoutSession(userId, email, plan) {
  if (!stripe) throw { status: 503, message: 'Stripe não configurado.' };

  // Debug — remover após confirmar funcionamento
  console.log('=== STRIPE DEBUG ===')
  console.log('FRONTEND_URL:', JSON.stringify(process.env.FRONTEND_URL))
  console.log('success_url será:', `${process.env.FRONTEND_URL}/app/dashboard?upgrade=success`)

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3001').trim();

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) throw { status: 400, message: `Plano inválido: ${plan}` };

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    metadata: { userId, plan },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${frontendUrl}/app/dashboard?upgrade=success`,
    cancel_url:  `${frontendUrl}/app/settings?upgrade=cancelled`,
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  return { url: session.url };
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const plan   = session.metadata?.plan;
  if (!userId || !plan) return;

  await db.query(
    `UPDATE users SET plan = $1, stripe_customer_id = $2 WHERE id = $3`,
    [plan, session.customer, userId]
  );
  console.log(`✅ Plano atualizado: user=${userId} plan=${plan}`);
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  await db.query(
    `UPDATE users SET plan = 'essencial' WHERE stripe_customer_id = $1`,
    [customerId]
  );
  console.log(`⚠️ Assinatura cancelada: customer=${customerId} → plano essencial`);
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const plan = getPlanByPriceId(priceId);
  if (!plan) return;

  await db.query(
    `UPDATE users SET plan = $1 WHERE stripe_customer_id = $2`,
    [plan, customerId]
  );
  console.log(`🔄 Plano alterado: customer=${customerId} → ${plan}`);
}

module.exports = {
  createCheckoutSession,
  handleCheckoutCompleted,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
};