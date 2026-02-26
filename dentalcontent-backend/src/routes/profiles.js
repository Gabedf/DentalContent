const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/profileController');

router.use(auth);

router.post('/',       ctrl.create);
router.get('/',        ctrl.list);
router.patch('/:id',   ctrl.update);
router.delete('/:id',  ctrl.remove);

module.exports = router;
