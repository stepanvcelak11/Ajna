import { getState } from './store';

export class LlmError extends Error {}

export const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o'];
// Current Anthropic generation (the 3.5 models are retired).
export const ANTHROPIC_MODELS = ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'];

export function hasKey() {
  const s = getState().settings;
  return s.provider === 'openai' ? !!s.openaiKey.trim() : !!s.anthropicKey.trim();
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

async function errText(res: Response) {
  let detail = '';
  try {
    const j = await res.json();
    detail = j?.error?.message ?? JSON.stringify(j);
  } catch {
    detail = res.statusText;
  }
  if (res.status === 401) return 'Neplatný API klíč (401). Zkontroluj Nastavení.';
  if (res.status === 429) return 'Překročen limit / kredit (429). Počkej chvíli nebo zkontroluj účet.';
  return `API chyba ${res.status}: ${detail}`;
}

export async function callJson<T>(opts: CallOpts): Promise<T> {
  if (!hasKey()) throw new LlmError('Chybí API klíč. Přidej ho v Nastavení.');
  const s = getState().settings;
  const out = s.provider === 'openai' ? await callOpenAI(opts) : await callAnthropic(opts);
  return out as T;
}
