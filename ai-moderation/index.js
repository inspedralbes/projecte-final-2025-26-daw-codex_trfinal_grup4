import express from 'express';
import { pipeline } from '@xenova/transformers';

const app = express();
app.use(express.json({ limit: '512kb' }));

const PORT = Number(process.env.PORT || 8088);
const API_KEY = process.env.AI_MODERATION_API_KEY || '';
const MODEL_ID = process.env.AI_MODEL_ID || 'Xenova/toxic-bert';
const MODEL_ENABLED = process.env.AI_MODEL_ENABLED !== 'false';
const ZERO_SHOT_ENABLED = process.env.AI_ZERO_SHOT_ENABLED !== 'false';
const ZERO_SHOT_MODEL_ID = process.env.AI_ZERO_SHOT_MODEL_ID || 'MoritzLaurer/mDeBERTa-v3-base-mnli-xnli';
const ZERO_SHOT_BLOCK_THRESHOLD = Number(process.env.AI_ZERO_SHOT_BLOCK_THRESHOLD || 0.52);
const LLM_ENABLED = process.env.AI_LLM_ENABLED === 'true';
const LLM_BASE_URL = (process.env.AI_LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const LLM_API_KEY = process.env.AI_LLM_API_KEY || '';
const LLM_MODEL = process.env.AI_LLM_MODEL || 'gpt-4o-mini';
const MAX_TEXT_LENGTH = Number(process.env.AI_MAX_TEXT_LENGTH || 6000);

const BLOCK_THRESHOLD = Number(process.env.AI_BLOCK_THRESHOLD || 0.72);
const MEDIUM_THRESHOLD = Number(process.env.AI_MEDIUM_THRESHOLD || 0.45);
const HIGH_THRESHOLD = Number(process.env.AI_HIGH_THRESHOLD || 0.65);
const CRITICAL_THRESHOLD = Number(process.env.AI_CRITICAL_THRESHOLD || 0.85);

let classifierPromise = null;
let zeroShotPromise = null;
let modelLoaded = false;
let modelLoadError = null;
let zeroShotLoaded = false;
let zeroShotLoadError = null;

const HARMFUL_LABELS = [
  'deseo explicito de dano o enfermedad',
  'acoso grave o humillacion',
  'amenaza o violencia contra una persona',
  'contenido respetuoso o neutro',
];

function normalizeText(content, codeSnippet) {
  const contentPart = typeof content === 'string' ? content : '';
  const codePart = typeof codeSnippet === 'string' ? codeSnippet : '';
  const joined = `${contentPart}\n${codePart}`.trim();

  if (joined.length <= MAX_TEXT_LENGTH) {
    return joined;
  }

  return joined.slice(0, MAX_TEXT_LENGTH);
}

function toSeverity(score) {
  if (score >= CRITICAL_THRESHOLD) {
    return 'critical';
  }
  if (score >= HIGH_THRESHOLD) {
    return 'high';
  }
  if (score >= MEDIUM_THRESHOLD) {
    return 'medium';
  }
  return 'low';
}

function sanitizeJsonText(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }

  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  return null;
}

async function moderateWithLlm(text) {
  if (!LLM_ENABLED || !LLM_API_KEY) {
    return null;
  }

  const policy = [
    'Eres un moderador de comunidad educativa.',
    'Evalua si el contenido es baneable segun violencia, acoso, deseos de daño, discurso de odio, amenazas o abuso grave.',
    'Responde SOLO JSON valido con formato:',
    '{"bannable": boolean, "severity": "low|medium|high|critical", "score": number, "reason": string, "categories": string[]}',
  ].join(' ');

  try {
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: policy },
          { role: 'user', content: `Contenido a moderar: ${text}` },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const jsonText = sanitizeJsonText(content);
    if (!jsonText) {
      return null;
    }

    const parsed = JSON.parse(jsonText);
    const severity = ['low', 'medium', 'high', 'critical'].includes(parsed?.severity)
      ? parsed.severity
      : 'medium';
    const score = Number(parsed?.score ?? 0.5);
    const bannable = Boolean(parsed?.bannable);

    return {
      allowed: !bannable,
      score: Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0.5,
      severity,
      reason: typeof parsed?.reason === 'string' && parsed.reason.trim()
        ? parsed.reason.trim()
        : (bannable ? 'Rejected by LLM moderation policy.' : 'Accepted by LLM moderation policy.'),
      categories: Array.isArray(parsed?.categories) ? parsed.categories : [],
      engine: 'llm',
    };
  } catch (_error) {
    return null;
  }
}

async function getClassifier() {
  if (!MODEL_ENABLED) {
    return null;
  }

  if (!classifierPromise) {
    classifierPromise = pipeline('text-classification', MODEL_ID, { quantized: true })
      .then((classifier) => {
        modelLoaded = true;
        modelLoadError = null;
        return classifier;
      })
      .catch((error) => {
        modelLoaded = false;
        modelLoadError = error?.message || 'model_load_failed';
        return null;
      });
  }

  return classifierPromise;
}

async function getZeroShotClassifier() {
  if (!ZERO_SHOT_ENABLED) {
    return null;
  }

  if (!zeroShotPromise) {
    zeroShotPromise = pipeline('zero-shot-classification', ZERO_SHOT_MODEL_ID, { quantized: true })
      .then((classifier) => {
        zeroShotLoaded = true;
        zeroShotLoadError = null;
        return classifier;
      })
      .catch((error) => {
        zeroShotLoaded = false;
        zeroShotLoadError = error?.message || 'zero_shot_model_load_failed';
        return null;
      });
  }

  return zeroShotPromise;
}

function parseModelOutput(rawOutput) {
  const output = Array.isArray(rawOutput) ? rawOutput : [];
  const normalized = output
    .filter((item) => item && typeof item.label === 'string' && typeof item.score === 'number')
    .map((item) => ({
      label: item.label.toLowerCase(),
      score: Number(item.score),
    }));

  const maxScore = normalized.length
    ? Math.max(...normalized.map((item) => item.score))
    : 0;

  const categories = normalized
    .filter((item) => item.score >= MEDIUM_THRESHOLD)
    .map((item) => item.label);

  return {
    maxScore,
    categories,
  };
}

async function analyzeWithZeroShot(text) {
  const zeroShot = await getZeroShotClassifier();
  if (!zeroShot) {
    return null;
  }

  const result = await zeroShot(text, HARMFUL_LABELS, {
    multi_label: true,
  });

  const labels = Array.isArray(result?.labels) ? result.labels : [];
  const scores = Array.isArray(result?.scores) ? result.scores : [];
  if (labels.length === 0 || scores.length === 0) {
    return null;
  }

  let harmScore = 0;
  for (let i = 0; i < labels.length; i += 1) {
    const label = String(labels[i] || '').toLowerCase();
    const score = Number(scores[i] || 0);
    if (label !== 'contenido respetuoso o neutro') {
      harmScore = Math.max(harmScore, score);
    }
  }

  const severity = toSeverity(harmScore);
  const allowed = harmScore < ZERO_SHOT_BLOCK_THRESHOLD;

  return {
    allowed,
    score: Number(harmScore.toFixed(4)),
    severity,
    reason: allowed
      ? 'Content accepted by semantic zero-shot moderation.'
      : 'Content rejected by semantic zero-shot moderation.',
    categories: ['semantic_harm_assessment'],
    engine: 'zero-shot',
  };
}

function checkApiKey(req, res, next) {
  if (!API_KEY) {
    return next();
  }

  const key = req.header('X-Api-Key');
  if (key !== API_KEY) {
    return res.status(401).json({
      allowed: false,
      score: 1,
      severity: 'high',
      reason: 'Unauthorized moderation request.',
      categories: ['unauthorized'],
    });
  }

  return next();
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-moderation',
    model: MODEL_ID,
    model_enabled: MODEL_ENABLED,
    model_loaded: modelLoaded,
    model_error: modelLoadError,
    zero_shot_enabled: ZERO_SHOT_ENABLED,
    zero_shot_model: ZERO_SHOT_MODEL_ID,
    zero_shot_loaded: zeroShotLoaded,
    zero_shot_error: zeroShotLoadError,
    llm_enabled: LLM_ENABLED,
    llm_model: LLM_MODEL,
    llm_configured: Boolean(LLM_API_KEY),
  });
});

app.post('/moderate', checkApiKey, async (req, res) => {
  try {
    const text = normalizeText(req.body?.content, req.body?.code_snippet);

    if (!text) {
      return res.json({
        allowed: true,
        score: 0,
        severity: 'low',
        reason: 'No text content to evaluate.',
        categories: [],
      });
    }

    const llmDecision = await moderateWithLlm(text);
    if (llmDecision) {
      return res.json(llmDecision);
    }

    let modelDecision = null;
    const classifier = await getClassifier();
    if (classifier) {
      const rawOutput = await classifier(text, { topk: null });
      const { maxScore, categories } = parseModelOutput(rawOutput);
      const severity = toSeverity(maxScore);
      const allowed = maxScore < BLOCK_THRESHOLD;

      modelDecision = {
        allowed,
        score: Number(maxScore.toFixed(4)),
        severity,
        reason: allowed
          ? 'Content accepted by AI model.'
          : 'Content rejected by AI model.',
        categories,
        engine: 'model',
      };
    }

    const zeroShotDecision = await analyzeWithZeroShot(text);
    if (modelDecision && zeroShotDecision) {
      const maxDecision = modelDecision.score >= zeroShotDecision.score
        ? modelDecision
        : zeroShotDecision;

      if (!modelDecision.allowed || !zeroShotDecision.allowed) {
        return res.json({
          allowed: false,
          score: Number(Math.max(modelDecision.score, zeroShotDecision.score).toFixed(4)),
          severity: maxDecision.severity,
          reason: `Rejected by ${maxDecision.engine} moderation.`,
          categories: Array.from(new Set([
            ...(Array.isArray(modelDecision.categories) ? modelDecision.categories : []),
            ...(Array.isArray(zeroShotDecision.categories) ? zeroShotDecision.categories : []),
          ])),
          engine: 'model+zero-shot',
        });
      }

      return res.json({
        allowed: true,
        score: Number(Math.max(modelDecision.score, zeroShotDecision.score).toFixed(4)),
        severity: maxDecision.severity,
        reason: 'Content accepted by combined AI moderation.',
        categories: Array.from(new Set([
          ...(Array.isArray(modelDecision.categories) ? modelDecision.categories : []),
          ...(Array.isArray(zeroShotDecision.categories) ? zeroShotDecision.categories : []),
        ])),
        engine: 'model+zero-shot',
      });
    }

    if (modelDecision) {
      return res.json(modelDecision);
    }

    if (zeroShotDecision) {
      return res.json(zeroShotDecision);
    }

    return res.json({
      allowed: false,
      score: 1,
      severity: 'high',
      reason: 'No AI engine available for moderation decision.',
      categories: ['service_unavailable'],
      engine: 'fallback',
    });
  } catch (error) {
    return res.status(500).json({
      allowed: false,
      score: 1,
      severity: 'high',
      reason: 'AI moderation service failed to process the request.',
      categories: ['service_error'],
      detail: error?.message || 'unknown_error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`ai-moderation listening on port ${PORT}`);
});
