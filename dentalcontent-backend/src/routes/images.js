const router = require('express').Router();
const auth = require('../middleware/auth');
const { checkImageLimit } = require('../middleware/planLimit');
const ctrl = require('../controllers/imageController');

router.use(auth);

router.post('/generate', checkImageLimit, ctrl.generate);
router.get('/usage', ctrl.usage);

module.exports = router;