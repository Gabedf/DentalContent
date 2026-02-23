const router = require('express').Router();
const auth = require('../middleware/auth');
const { checkPlanLimit } = require('../middleware/planLimit');
const ctrl = require('../controllers/contentController');

router.use(auth);

// Geração — verifica limite do plano antes
router.post('/generate', checkPlanLimit, ctrl.generate);

// Listagem (kanban + calendário)
router.get('/', ctrl.list);

// Kanban: muda status
router.patch('/:id/status', ctrl.updateStatus);

// Calendário: agenda com data
router.patch('/:id/schedule', ctrl.schedule);

// Estatísticas de uso do plano
router.get('/usage', ctrl.usage);

module.exports = router;
