const OpenAI = require('openai');
const db = require('../db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STYLE_PROMPTS = {
  clean: {
    label: 'Clean Clínico',
    suffix: `Visual style: minimalist dental clinic photography, white and cream tones, 
      soft natural lighting, clean background, premium aesthetic, 
      elegant and trustworthy atmosphere. Square format 1:1, ultra high quality, 
      no text overlay, no watermark.`,
    dalleStyle: 'natural',
  },
  bold: {
    label: 'Bold Editorial',
    suffix: `Visual style: bold editorial photography, dark sophisticated background, 
      high contrast, dramatic studio lighting, modern and luxurious dental aesthetic, 
      strong visual impact, magazine-quality composition. Square format 1:1, 
      ultra high quality, no text overlay, no watermark.`,
    dalleStyle: 'vivid',
  },
  warm: {
    label: 'Warm Lifestyle',
    suffix: `Visual style: warm lifestyle photography, golden hour lighting, amber and warm tones, 
      cozy welcoming dental office environment, human and approachable atmosphere, 
      health and wellness vibe, soft bokeh. Square format 1:1, 
      ultra high quality, no text overlay, no watermark.`,
    dalleStyle: 'natural',
  },
};

const CONTENT_TYPE_CONTEXT = {
  educativo:          'educational dental health content',
  autoridade:         'dental expertise and professional authority',
  quebra_objecao:     'addressing patient concerns about dental treatment',
  bastidores:         'behind the scenes of a dental clinic',
  depoimento:         'patient satisfaction and dental transformation',
  procedimento:       'dental procedure and clinical excellence',
};

function buildImagePrompt(style, { content_type, theme, headline, caption }) {
  const styleConfig = STYLE_PROMPTS[style];
  const contentContext = CONTENT_TYPE_CONTEXT[content_type] || 'dental clinic';

  let contextParts = [];

  // Usa headline como contexto principal se disponível
  if (headline) {
    // Remove caracteres especiais e limita tamanho
    const cleanHeadline = headline.replace(/[🦷✨💎🏆❓🌟]/g, '').trim().slice(0, 120);
    contextParts.push(`The image should visually represent: "${cleanHeadline}"`);
  }

  // Usa tema específico
  if (theme) {
    contextParts.push(`Topic: ${theme}`);
  }

  // Usa tipo de conteúdo como fallback
  contextParts.push(`Category: ${contentContext}`);

  // Extrai palavras-chave da legenda se disponível
  if (caption && !headline) {
    const words = caption.split(' ').slice(0, 15).join(' ');
    contextParts.push(`Context: ${words}`);
  }

  const contextString = contextParts.join('. ');

  return `Professional Instagram post image for a dental clinic. ${contextString}. ${styleConfig.suffix}`;
}

async function generateImage(userId, { style, content_type, theme, headline, caption }) {
  const styleConfig = STYLE_PROMPTS[style];
  if (!styleConfig) throw { status: 400, message: 'Estilo inválido. Use: clean, bold ou warm.' };

  const fullPrompt = buildImagePrompt(style, { content_type, theme, headline, caption });

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: styleConfig.dalleStyle,
  });

  const imageUrl = response.data[0].url;
  const revisedPrompt = response.data[0].revised_prompt;

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