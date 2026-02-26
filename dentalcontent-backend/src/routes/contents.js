const router  = require('express').Router();
const auth    = require('../middleware/auth');
const { checkPlanLimit } = require('../middleware/planLimit');
const ctrl    = require('../controllers/contentController');

router.use(auth);

// Estatísticas (antes de /:id para não conflitar)
router.get('/usage', ctrl.usage);

// Bateria editorial
router.post('/battery/suggest',  ctrl.suggestBattery);
router.post('/battery/generate', checkPlanLimit, ctrl.generateBattery);

// Geração individual
router.post('/generate', checkPlanLimit, ctrl.generate);

// Listagem
router.get('/', ctrl.list);

// Por ID — editar, regenerar seção, status, agendamento
router.patch('/:id',           ctrl.update);
router.post('/:id/regenerate', checkPlanLimit, ctrl.regenerateSection);
router.patch('/:id/status',    ctrl.updateStatus);
router.patch('/:id/schedule',  ctrl.schedule);

module.exports = router;
