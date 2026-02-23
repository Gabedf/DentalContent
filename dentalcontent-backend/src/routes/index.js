const router = require('express').Router();

router.use('/auth',     require('./auth'));
router.use('/profiles', require('./profiles'));
router.use('/contents', require('./contents'));
router.use('/stripe',   require('./stripe'));

module.exports = router;
