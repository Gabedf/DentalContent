const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/stripeController');

router.post('/checkout', auth, ctrl.createCheckout);

// Webhook sem auth JWT — raw body necessário
router.post('/webhook',
  (req, res, next) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { req.rawBody = data; next(); });
  },
  ctrl.webhook
);

module.exports = router;
