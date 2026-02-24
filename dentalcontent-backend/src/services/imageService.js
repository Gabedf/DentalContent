const OpenAI = require('openai');
const db = require('../db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Prompts base por estilo visual
const STYLE_PROMPTS = {
  clean: {
    label: 'Clean Clínico',
    prompt: `Professional dental clinic photography for Instagram post. 
      Minimalist aesthetic, white and cream tones, soft natural lighting, 
      clean background, premium dental equipment subtly visible, 
      elegant and trustworthy atmosphere. Square format 1:1, 
      ultra high quality, no text, no people, no teeth close-ups.`,
  },
  bold: {
    label: 'Bold Editorial',
    prompt: `Bold editorial photography for dental clinic Instagram post. 
      Dark sophisticated background, high contrast, dramatic lighting, 
      modern and luxurious dental aesthetic, strong visual impact, 
      magazine-style composition. Square format 1:1, 
      ultra high quality, no text, no people.`,
  },
  warm: {
    label: 'Warm Lifestyle',
    prompt: `Warm lifestyle photography for dental clinic Instagram post. 
      Golden hour lighting, warm tones, cozy and welcoming dental office, 
      human and approachable atmosphere, natural elements, 
      soft bokeh background, health and wellness vibe. Square format 1:1, 
      ultra high quality, no text.`,
  },
};

async function generateImage(userId, { style, content_type, theme }) {
  const styleConfig = STYLE_PROMPTS[style];
  if (!styleConfig) throw { status: 400, message: 'Estilo inválido. Use: clean, bold ou warm.' };

  // Enriquece o prompt com o tipo de conteúdo
  const contentContext = theme
    ? `Context: dental post about "${theme}". `
    : `Context: dental ${content_type || 'educational'} post. `;

  const fullPrompt = contentContext + styleConfig.prompt;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: style === 'bold' ? 'vivid' : 'natural',
  });

  const imageUrl = response.data[0].url;
  const revisedPrompt = response.data[0].revised_prompt;

  // Registra no banco para controle de limite
  await db.query(
    `INSERT INTO image_generations (user_id, style, content_type, theme, revised_prompt)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, style, content_type || null, theme || null, revisedPrompt]
  );

  return {
    url: imageUrl,
    style: styleConfig.label,
    revised_prompt: revisedPrompt,
    expires_in: '1 hora',
  };
}

async function getImageUsage(userId, plan) {
  const { IMAGE_LIMITS } = require('../middleware/planLimit');
  const limit = IMAGE_LIMITS[plan];

  let used;
  if (plan === 'gratis') {
    const result = await db.query(
      'SELECT COUNT(*) AS count FROM image_generations WHERE user_id = $1',
      [userId]
    );
    used = parseInt(result.rows[0].count, 10);
  } else {
    const result = await db.query(
      `SELECT COUNT(*) AS count FROM image_generations
       WHERE user_id = $1 AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
      [userId]
    );
    used = parseInt(result.rows[0].count, 10);
  }

  return {
    used,
    limit: limit === Infinity ? 'unlimited' : limit,
    plan,
    available: limit === 0 ? false : limit === Infinity ? true : used < limit,
  };
}

module.exports = { generateImage, getImageUsage, STYLE_PROMPTS };