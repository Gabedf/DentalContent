const router = require('express').Router();
const auth = require('../middleware/auth');
const { checkImageLimit } = require('../middleware/planLimit');
const ctrl = require('../controllers/imageController');

router.use(auth);

router.get('/options', ctrl.getOptions);
router.get('/usage', ctrl.usage);
router.post('/generate', checkImageLimit, ctrl.generate);

module.exports = router;