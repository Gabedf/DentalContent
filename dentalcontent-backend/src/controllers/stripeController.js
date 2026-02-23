const stripeService = require('../services/stripeService');
const db = require('../db');

async function createCheckout(req, res, next) {
  try {
    const { plan } = req.body;
    const validPlans = ['essencial', 'pro', 'clinica'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({ error: `plan inválido. Opções: ${validPlans.join(', ')}` });
    }
    const session = await stripeService.createCheckoutSession(req.user.id, req.user.email, plan);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

// Webhook do Stripe — sem auth JWT (assinatura verificada pelo Stripe)
async function webhook(req, res, next) {
  const Stripe = require('stripe');
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).json({ error: 'Webhook signature inválida.' });
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    await stripeService.handleSubscriptionUpdated(event, db);
  }

  res.json({ received: true });
}

module.exports = { createCheckout, webhook };
