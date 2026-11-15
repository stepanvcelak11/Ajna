import { getState } from './store';

export class LlmError extends Error {}

export const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o'];
// Current Anthropic generation (the 3.5 models are retired).
export const ANTHROPIC_MODELS = ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'];
// Shown until the real list is fetched for the user's key.
export const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];

export function hasKey() {
  const s = getState().settings;
  const key = s.provider === 'openai' ? s.openaiKey : s.provider === 'gemini' ? s.geminiKey : s.anthropicKey;
  return !!key?.trim();
}

/** Minimal JSON-schema description we pass to both providers. */
export type JsonSchema = Record<string, unknown>;

function extractJson(text: string): unknown {
  const t = text.trim();
  try {
    return JSON.parse(t);
  } catch {
    // tolerate ```json fences or leading prose
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(t.slice(start, end + 1));
    throw new LlmError('Model nevrátil platný JSON.');
  }
}

interface CallOpts {
  system: string;
  user: string;
  schema: JsonSchema;
  maxTokens?: number;
  signal?: AbortSignal;
}

async function callOpenAI({ system, user, schema, maxTokens = 1500, signal }: CallOpts) {
  const s = getState().settings;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.openaiKey.trim()}` },
    body: JSON.stringify({
      model: s.openaiModel || 'gpt-4o-mini',
      max_tokens: maxTokens,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `${system}\n\nRespond ONLY with a JSON object matching this JSON Schema:\n${JSON.stringify(schema)}`,
        },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new LlmError(await errText(res));
  const data = await res.json();
  return extractJson(data.choices?.[0]?.message?.content ?? '');
}

async function callAnthropic({ system, user, schema, maxTokens = 2500, signal }: CallOpts, structured = true): Promise<unknown> {
  const s = getState().settings;
  const body: Record<string, unknown> = {
    model: s.anthropicModel || 'claude-sonnet-5-5',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
    // Short coaching replies: low effort keeps latency down on mobile.
    output_config: structured
      ? { effort: 'low', format: { type: 'json_schema', schema } }
      : { effort: 'low' },
  };
  if (!structured) {
    body.system = `${system}\n\nRespond ONLY with a JSON object matching this JSON Schema:\n${JSON.stringify(schema)}`;
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': s.anthropicKey.trim(),
      'anthropic-version': '2026-10-21',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await errText(res);
    // If the chosen model rejects structured outputs/schema, retry with prompt-only JSON.
    if (structured && res.status === 400 && /format|schema|output_config/i.test(msg)) {
      return callAnthropic({ system, user, schema, maxTokens, signal }, false);
    }
    throw new LlmError(msg);
  }
  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new LlmError('Model odmítl odpovědět. Zkus to přeformulovat.');
  const text = (data.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('');
  if (data.stop_reason === 'max_tokens' && !text.trim().endsWith('}')) {
    throw new LlmError('Odpověď byla useknutá (max_tokens). Zkus to znovu.');
  }
  return extractJson(text);
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function callGemini({ system, user, schema, maxTokens = 2500, signal }: CallOpts) {
  const s = getState().settings;
  const model = (s.geminiModel || 'gemini-2.5-flash').replace(/^models\//, '');
  const res = await fetch(`${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': s.geminiKey.trim() },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `${system}\n\nRespond ONLY with a JSON object matching this JSON Schema:\n${JSON.stringify(schema)}` }],
      },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: Math.max(maxTokens, 4000) },
    }),
  });
  if (!res.ok) throw new LlmError(await errText(res));
  const data = await res.json();
  const cand = data.candidates?.[0];
  if (!cand) throw new LlmError('Gemini nevrátil odpověď (možná zablokováno filtrem). Zkus to znovu.');
  const text = (cand.content?.parts ?? [])
    .filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? '')
    .join('');
  return extractJson(text);
}

/** Lists Gemini models usable with generateContent for this key (newest first). */
export async function listGeminiModels(key: string): Promise<string[]> {
  const res = await fetch(`${GEMINI_BASE}/models?pageSize=200`, { headers: { 'x-goog-api-key': key.trim() } });
  if (!res.ok) throw new LlmError(await errText(res));
  const data = await res.json();
  return (data.models ?? [])
    .filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: { name: string }) => m.name.replace(/^models\//, ''))
    .filter((n: string) => /^gemini-/.test(n) && !/(image|tts|audio|embedding|live|vision|computer)/.test(n))
    .sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true }));
}

async function errText(res: Response) {
  let detail = '';
  try {
    const j = await res.json();
    detail = j?.error?.message ?? JSON.stringify(j);
  } catch {
    detail = res.statusText;
  }
  if (res.status === 401 || res.status === 403 || /API key not valid/i.test(detail)) return 'Neplatný API klíč. Zkontroluj Nastavení.';
  if (res.status === 404) return `Model nenalezen (404). Vyber v Nastavení jiný model. ${detail}`;
  if (res.status === 429) return 'Překročen limit / kredit (429). Počkej chvíli nebo zkontroluj účet.';
  return `API chyba ${res.status}: ${detail}`;
}

export const OFFLINE_MSG = 'Jsi offline. AI hodnocení potřebuje internet – slovíčka a Banku chyb můžeš procházet i bez něj.';

export async function callJson<T>(opts: CallOpts): Promise<T> {
  if (!hasKey()) throw new LlmError('Chybí API klíč. Přidej ho v Nastavení.');
  if (!navigator.onLine) throw new LlmError(OFFLINE_MSG);
  const s = getState().settings;
  try {
    const out =
      s.provider === 'openai' ? await callOpenAI(opts) : s.provider === 'gemini' ? await callGemini(opts) : await callAnthropic(opts);
    return out as T;
  } catch (e) {
    if (e instanceof TypeError) throw new LlmError(navigator.onLine ? 'Nepodařilo se spojit s AI. Zkontroluj připojení.' : OFFLINE_MSG);
    throw e;
  }
}
