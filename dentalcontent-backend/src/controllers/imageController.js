const imageService = require('../services/imageService');

async function generate(req, res, next) {
  try {
    const { style, visualTheme, customDescription, primaryColor, headline } = req.body;
    if (!style) return res.status(400).json({ error: 'Informe o estilo.' });

    const result = await imageService.generateImage(req.user.id, {
      style, visualTheme, customDescription, primaryColor, headline
    });
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

async function getOptions(req, res) {
  const { STYLES, VISUAL_THEMES } = require('../services/imageService');
  res.json({ styles: STYLES, visualThemes: VISUAL_THEMES });
}

module.exports = { generate, usage, getOptions };