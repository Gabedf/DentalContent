const OpenAI = require('openai');
const db = require('../db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Provider abstraction (pronto para Ideogram) ──────────────────────────────
// Quando adicionar Ideogram, basta implementar a função generateWithIdeogram
// e trocar o provider abaixo.
const PROVIDER = process.env.IMAGE_PROVIDER || 'dalle'; // 'dalle' | 'ideogram'

// ── Estilos visuais ──────────────────────────────────────────────────────────
const STYLES = {
  clean: {
    label: 'Clean Clínico',
    description: 'Minimalista, tons claros, premium',
    stylePrompt: 'minimalist, white and cream background, soft natural lighting, clean composition, premium dental clinic aesthetic, lots of negative space, elegant, high-end',
    dalleStyle: 'natural',
  },
  bold: {
    label: 'Bold Editorial',
    description: 'Escuro, contraste alto, impactante',
    stylePrompt: 'bold editorial, dark background, high contrast, dramatic studio lighting, luxury aesthetic, strong visual impact, magazine quality, sophisticated',
    dalleStyle: 'vivid',
  },
  warm: {
    label: 'Warm Lifestyle',
    description: 'Tons quentes, acolhedor, humano',
    stylePrompt: 'warm lifestyle, golden hour lighting, amber and warm tones, welcoming atmosphere, human connection, health and wellness, soft bokeh, approachable',
    dalleStyle: 'natural',
  },
  gradient: {
    label: 'Gradient Modern',
    description: 'Gradiente suave, moderno, digital',
    stylePrompt: 'modern digital marketing, smooth gradient background, contemporary design, geometric elements, professional, social media ready, clean typography space',
    dalleStyle: 'vivid',
  },
};

// ── Temas visuais focados em odontologia ─────────────────────────────────────
const VISUAL_THEMES = {
  smile_transformation: {
    label: 'Transformação do Sorriso',
    prompt: 'dental smile transformation concept, before and after aesthetic, beautiful smile, confidence, happiness',
  },
  clinical_premium: {
    label: 'Clínica Premium',
    prompt: 'premium dental clinic interior, modern equipment, professional environment, clean and sterile, high-end dental office',
  },
  aesthetic_procedure: {
    label: 'Procedimento Estético',
    prompt: 'dental aesthetic procedure concept, precision, care, professional dental work, cosmetic dentistry',
  },
  oral_health: {
    label: 'Saúde Bucal',
    prompt: 'oral health concept, prevention, hygiene, healthy teeth, wellness, dental care routine',
  },
  implant_technology: {
    label: 'Tecnologia & Implante',
    prompt: 'dental implant technology concept, advanced equipment, precision engineering, modern dentistry, titanium implant',
  },
  patient_trust: {
    label: 'Confiança & Cuidado',
    prompt: 'patient care and trust concept, gentle dental care, reassuring environment, professional empathy, comfortable experience',
  },
  whitening: {
    label: 'Clareamento',
    prompt: 'teeth whitening concept, bright white smile, luminous, radiant, cosmetic dental whitening treatment',
  },
  braces_aligners: {
    label: 'Ortodontia',
    prompt: 'orthodontic treatment concept, dental aligners, braces, teeth alignment, smile correction journey',
  },
};

// ── Construção do prompt ─────────────────────────────────────────────────────
function buildPrompt({ style, visualTheme, customDescription, primaryColor, headline }) {
  const styleConfig = STYLES[style] || STYLES.clean;
  const themeConfig = visualTheme ? VISUAL_THEMES[visualTheme] : null;

  const parts = [];

  // Base: Instagram marketing post
  parts.push('Professional Instagram marketing post image for a dental clinic');

  // Tema visual
  if (themeConfig) {
    parts.push(themeConfig.prompt);
  }

  // Headline do conteúdo (contexto adicional)
  if (headline) {
    const clean = headline.replace(/[🦷✨💎🏆❓🌟💡🔬]/g, '').trim().slice(0, 100);
    parts.push(`visual concept for: "${clean}"`);
  }

  // Descrição livre do usuário
  if (customDescription && customDescription.trim()) {
    parts.push(`additional context: ${customDescription.trim()}`);
  }

  // Cor base
  if (primaryColor) {
    parts.push(`primary color palette based on ${primaryColor}, use this color as accent and dominant tone throughout the composition`);
  }

  // Estilo visual
  parts.push(styleConfig.stylePrompt);

  // Restrições técnicas
  parts.push('square format 1:1, ultra high quality, no text overlay, no watermark, Instagram ready, professional marketing visual');

  return parts.join('. ');
}

// ── Geração via DALL-E 3 ─────────────────────────────────────────────────────
async function generateWithDalle({ prompt, style }) {
  const styleConfig = STYLES[style] || STYLES.clean;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: styleConfig.dalleStyle,
  });

  return {
    url: response.data[0].url,
    revised_prompt: response.data[0].revised_prompt,
  };
}

// ── Geração via Ideogram (pronto para ativar) ────────────────────────────────
async function generateWithIdeogram({ prompt, style, primaryColor }) {
  // TODO: ativar quando IDEOGRAM_API_KEY for configurado
  // const response = await fetch('https://api.ideogram.ai/generate', {
  //   method: 'POST',
  //   headers: {
  //     'Api-Key': process.env.IDEOGRAM_API_KEY,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     image_request: {
  //       prompt,
  //       model: 'V_2',
  //       aspect_ratio: 'ASPECT_1_1',
  //       style_type: style === 'bold' ? 'DESIGN' : 'REALISTIC',
  //       magic_prompt_option: 'ON',
  //     }
  //   })
  // });
  // const data = await response.json();
  // return { url: data.data[0].url, revised_prompt: prompt };
  throw new Error('Ideogram não configurado ainda. Configure IDEOGRAM_API_KEY.');
}

// ── Função principal ─────────────────────────────────────────────────────────
async function generateImage(userId, { style, visualTheme, customDescription, primaryColor, headline }) {
  if (!STYLES[style]) throw { status: 400, message: 'Estilo inválido.' };

  const prompt = buildPrompt({ style, visualTheme, customDescription, primaryColor, headline });

  let result;
  if (PROVIDER === 'ideogram' && process.env.IDEOGRAM_API_KEY) {
    result = await generateWithIdeogram({ prompt, style, primaryColor });
  } else {
    result = await generateWithDalle({ prompt, style });
  }

  await db.query(
    `INSERT INTO image_generations (user_id, style, visual_theme, custom_description, primary_color, revised_prompt)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, style, visualTheme || null, customDescription || null, primaryColor || null, result.revised_prompt]
  );

  return {
    url: result.url,
    style: STYLES[style].label,
    provider: PROVIDER === 'ideogram' && process.env.IDEOGRAM_API_KEY ? 'ideogram' : 'dalle',
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

module.exports = { generateImage, getImageUsage, STYLES, VISUAL_THEMES };