/**
 * Monta o prompt especializado para geração de conteúdo odontológico.
 * Todo o contexto do nicho, restrições do CRO e estrutura de output
 * ficam aqui — esse é o "coração" do produto.
 */

const CONTENT_TYPE_LABELS = {
  educativo: 'Educativo (explica conceito ou procedimento para o paciente)',
  autoridade: 'Autoridade (demonstra expertise e posicionamento do dentista)',
  quebra_objecao: 'Quebra de Objeção (responde dúvidas ou medos comuns dos pacientes)',
  bastidores: 'Bastidores (mostra o dia a dia da clínica de forma humanizada)',
  depoimento: 'Depoimento / Prova Social (destaca resultado real de paciente)',
  procedimento: 'Explicação de Procedimento (como funciona, etapas, o que esperar)',
};

const SUBNICHE_LABELS = {
  estetico: 'Dentista Estético (foco em clareamento, facetas, lentes de contato dental, sorriso)',
  implante: 'Implantodontista (foco em implantes dentários, reabilitação oral, próteses)',
};

const OBJECTIVE_LABELS = {
  atrair_pacientes: 'Atrair novos pacientes para a clínica',
  educar: 'Educar e informar o público sobre saúde bucal',
  construir_autoridade: 'Construir autoridade e reputação do dentista na cidade',
};

function buildSystemPrompt() {
  return `Você é um especialista em marketing de conteúdo para dentistas no Brasil.
Você cria conteúdo para Instagram com foco em conversão, autoridade e educação.

REGRAS OBRIGATÓRIAS DO CRO (Conselho Regional de Odontologia) — NUNCA VIOLE:
- Nunca prometa resultados específicos (ex: "dentes 10 tons mais brancos em 1 hora")
- Nunca use linguagem sensacionalista (ex: "o melhor dentista do Brasil", "milagroso")
- Nunca faça comparações diretas com outros profissionais ou clínicas
- Nunca use imagens de antes/depois com afirmação de resultado garantido
- Evite qualquer linguagem que possa ser considerada publicidade enganosa
- O conteúdo deve ser informativo, ético e baseado em evidências

PÚBLICO-ALVO: Brasileiros adultos que buscam cuidados estéticos ou funcionais odontológicos.
IDIOMA: Português brasileiro. Natural, sem regionalismos exagerados.
TOM: Conforme especificado pelo usuário.`;
}

function buildUserPrompt({ profile, content_type, theme, objective, tone }) {
  return `Crie um conteúdo completo para Instagram com os seguintes parâmetros:

SUBNICHO: ${SUBNICHE_LABELS[profile.subniche]}
CIDADE DO PROFISSIONAL: ${profile.city}
TIPO DE CONTEÚDO: ${CONTENT_TYPE_LABELS[content_type]}
TEMA ESPECÍFICO: ${theme}
TOM: ${tone}
OBJETIVO: ${OBJECTIVE_LABELS[objective]}

Retorne EXATAMENTE o seguinte JSON (sem markdown, sem texto fora do JSON):

{
  "headlines": [
    "Headline 1 — impactante e direta",
    "Headline 2 — curiosidade ou pergunta",
    "Headline 3 — benefício claro"
  ],
  "caption": "Legenda completa aqui. Deve começar com um hook forte nas primeiras 2 linhas que pare o scroll. Depois desenvolva em parágrafos curtos (máx 3 linhas cada). Termine com CTA adequado ao objetivo: ${OBJECTIVE_LABELS[objective]}. Linguagem: ${tone}.",
  "short_version": "Versão resumida da legenda (máx 3 parágrafos curtos) para Reels ou Stories.",
  "hashtags": [
    "#hashtag1", "#hashtag2", "#hashtag3",
    "... (total de 15 a 20 hashtags: mix de volume alto, médio e baixo, todas relevantes ao nicho)"
  ],
  "carousel": [
    { "slide": 1, "title": "Título do slide 1 (capa)", "content": "Texto ou descrição visual do slide 1", "visual_suggestion": "Sugestão do que mostrar visualmente" },
    { "slide": 2, "title": "Título do slide 2", "content": "Conteúdo do slide 2", "visual_suggestion": "Sugestão visual" },
    { "slide": 3, "title": "Título do slide 3", "content": "Conteúdo do slide 3", "visual_suggestion": "Sugestão visual" },
    { "slide": 4, "title": "Título do slide 4", "content": "Conteúdo do slide 4", "visual_suggestion": "Sugestão visual" },
    { "slide": 5, "title": "CTA final", "content": "Call to action do último slide", "visual_suggestion": "Sugestão visual para o CTA" }
  ]
}`;
}

module.exports = { buildSystemPrompt, buildUserPrompt };
