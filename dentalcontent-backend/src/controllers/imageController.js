const imageService = require('../services/imageService');

async function generate(req, res, next) {
  try {
    const { style, content_type, theme } = req.body;
    if (!style) return res.status(400).json({ error: 'Informe o estilo: clean, bold ou warm.' });

    const result = await imageService.generateImage(req.user.id, { style, content_type, theme });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function usage(req, res, next) {
  try {
    const result = await imageService.getImageUsage(req.user.id, req.user.plan);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, usage };