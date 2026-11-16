import { Download, ExternalLink, Eye, EyeOff, Moon, Sun, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { ANTHROPIC_MODELS, GEMINI_MODELS, OPENAI_MODELS, listGeminiModels } from '../lib/llm';
import { sttSupported } from '../lib/speech';
import { exportJson, importJson, resetAll, updateSettings, useStore } from '../lib/store';
import type { Provider, Settings as S } from '../lib/types';

const KEY_FIELD = { openai: 'openaiKey', anthropic: 'anthropicKey', gemini: 'geminiKey' } as const satisfies Record<Provider, keyof S>;
const MODEL_FIELD = { openai: 'openaiModel', anthropic: 'anthropicModel', gemini: 'geminiModel' } as const satisfies Record<Provider, keyof S>;

const KEY_HELP: Record<Provider, { name: string; steps: string[]; url: string; urlLabel: string; host: string; placeholder: string; modelNote: string }> = {
  gemini: {
    name: 'Google Gemini – zdarma',
    steps: [
      'Otevři Google AI Studio a přihlas se svým Google účtem.',
      'Klikni na „Create API key“ (Vytvořit klíč).',
      'Klíč (začíná „AIza…“) zkopíruj a vlož sem.',
      'Předplatné Gemini v aplikaci není potřeba – klíč z AI Studia má bezplatný limit, který na trénink stačí.',
    ],
    url: 'https://aistudio.google.com/apikey',
    urlLabel: 'Google AI Studio',
    host: 'generativelanguage.googleapis.com',
    placeholder: 'AIza…',
    modelNote: 'Doporučeno: gemini-flash-latest (vždy nejnovější Flash, rychlý a v bezplatném limitu). Pro = chytřejší, ale pomalejší a s menším bezplatným limitem.',
  },
  anthropic: {
    name: 'Anthropic Claude – placené',
    steps: [
      'Otevři Claude Console a přihlas se (nebo si vytvoř účet).',
      'V Settings → Billing dobij kredit (např. 5 $). Předplatné Claude Pro/Max se na API nevztahuje.',
      'V Settings → API Keys klikni „Create Key“.',
      'Klíč (začíná „sk-ant-…“) zkopíruj a vlož sem – ukáže se jen jednou.',
    ],
    url: 'https://console.anthropic.com/settings/keys',
    urlLabel: 'Claude Console',
    host: 'api.anthropic.com',
    placeholder: 'sk-ant-…',
    modelNote: 'Haiku = nejrychlejší a nejlevnější, Sonnet = vyvážený, Opus = nejchytřejší.',
  },
  openai: {
    name: 'OpenAI – placené',
    steps: ['Otevři OpenAI Platform a přihlas se.', 'V Billing dobij kredit.', 'V API keys klikni „Create new secret key“ a vlož ho sem.'],
    url: 'https://platform.openai.com/api-keys',
    urlLabel: 'OpenAI Platform',
    host: 'api.openai.com',
    placeholder: 'sk-…',
    modelNote: 'gpt-4o-mini = rychlý a levný, gpt-4o = přesnější.',
  },
};
import { toast } from '../lib/ui';
import { lessonOfTopic } from '../data/textbook';
import { findTopic } from '../data/levels';
import { LevelList } from '../components/LevelPicker';

function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onChange(o.v)}
          className={cx('px-3 h-8 rounded-lg text-xs font-medium transition', value === o.v ? 'bg-surface text-fg shadow-sm' : 'text-muted')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {sub && <div className="text-[11px] text-muted">{sub}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cx('relative h-7 w-12 rounded-full transition', on ? 'bg-accent' : 'bg-surface-3')}
    >
      <span className={cx('absolute top-0.5 size-6 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

export default function Settings() {
  const s = useStore((st) => st.settings);
  const counts = { v: useStore((st) => st.vocab.length), m: useStore((st) => st.mistakes.length) };
  const [show, setShow] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const set = (p: Partial<S>) => updateSettings(p);
  const keyField = KEY_FIELD[s.provider];
  const modelField = MODEL_FIELD[s.provider];
  const [geminiModels, setGeminiModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const models = s.provider === 'openai' ? OPENAI_MODELS : s.provider === 'gemini' ? (geminiModels.length ? geminiModels.slice(0, 6) : GEMINI_MODELS) : ANTHROPIC_MODELS;
  const custom = !models.includes(s[modelField]);
  const help = KEY_HELP[s.provider];

  const loadGeminiModels = async () => {
    if (!s.geminiKey.trim()) return;
    setLoadingModels(true);
    try {
      const list = await listGeminiModels(s.geminiKey);
      setGeminiModels(list);
      if (list.length && !list.includes(s.geminiModel)) set({ geminiModel: list[0] });
      toast(`Načteno ${list.length} modelů`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setLoadingModels(false);
    }
  };

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ajna-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const doImport = async (f: File) => {
    try {
      importJson(await f.text());
      toast('Záloha obnovena');
    } catch {
      toast('Neplatný soubor zálohy');
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Nastavení</h1>

      <Card className="space-y-3">
        <Label>AI poskytovatel</Label>
        <Seg
          value={s.provider}
          options={[
            { v: 'gemini', label: 'Gemini' },
            { v: 'anthropic', label: 'Claude' },
            { v: 'openai', label: 'OpenAI' },
          ]}
          onChange={(v) => set({ provider: v })}
        />
        <div className="rounded-xl border border-line bg-surface-2 p-3 text-xs space-y-1.5">
          <div className="font-medium text-fg">Jak získat klíč ({help.name})</div>
          <ol className="list-decimal pl-4 space-y-0.5 text-muted">
            {help.steps.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          <a href={help.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent font-medium">
            Otevřít {help.urlLabel} <ExternalLink className="size-3" />
          </a>
        </div>
        <div>
          <div className="text-xs text-muted mb-1">API klíč</div>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={s[keyField]}
              onChange={(e) => set({ [keyField]: e.target.value } as Partial<S>)}
              onBlur={() => s.provider === 'gemini' && !geminiModels.length && loadGeminiModels()}
              placeholder={help.placeholder}
              autoComplete="off"
              spellCheck={false}
              className="w-full h-11 rounded-xl border border-line bg-surface-2 px-3 pr-11 text-[16px] font-mono outline-none focus:border-accent/60"
            />
            <button onClick={() => setShow((x) => !x)} className="absolute right-1 top-1 size-9 grid place-items-center text-muted" aria-label="Zobrazit">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="text-[11px] text-muted mt-1">
            Klíč zůstává jen v tomto zařízení a posílá se přímo na {help.host}. Do zálohy se neexportuje.
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-muted">Model</div>
            {s.provider === 'gemini' && (
              <button onClick={loadGeminiModels} disabled={!s.geminiKey.trim() || loadingModels} className="text-[11px] text-accent disabled:opacity-40">
                {loadingModels ? 'Načítám…' : 'Načíst dostupné modely'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {models.map((m) => (
              <button
                key={m}
                onClick={() => set({ [modelField]: m } as Partial<S>)}
                className={cx('rounded-lg border px-2.5 py-1.5 text-xs font-mono', s[modelField] === m ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted')}
              >
                {m}
              </button>
            ))}
          </div>
          <input
            value={custom ? s[modelField] : ''}
            onChange={(e) => set({ [modelField]: e.target.value || models[0] } as Partial<S>)}
            placeholder="…nebo vlastní ID modelu"
            className="mt-2 w-full h-10 rounded-xl border border-line bg-surface-2 px-3 text-sm font-mono outline-none focus:border-accent/60"
          />
          <div className="text-[11px] text-muted mt-1">{help.modelNote}</div>
        </div>
      </Card>

      <Card className="space-y-3">
        <Label>Obtížnost</Label>
        <LevelList />
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
          <span className="flex-1 min-w-0 truncate">
            Procvičuješ: <b>{lessonOfTopic(s.focus) ? `Lekce ${lessonOfTopic(s.focus)!.n}` : findTopic(s.focus)?.cz ?? 'obecně (mix)'}</b>
          </span>
          {s.focus && (
            <Btn variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => set({ focus: null })}>
              Obecně
            </Btn>
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <Label>Denní cíl</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: 50, t: 'Lehký', d: '~5 min' },
            { v: 100, t: 'Běžný', d: '~10 min' },
            { v: 200, t: 'Vážný', d: '~20 min' },
            { v: 300, t: 'Drsný', d: '~30 min' },
          ].map((g) => (
            <button
              key={g.v}
              onClick={() => set({ dailyGoal: g.v })}
              className={cx(
                'rounded-xl border px-1 py-2.5 text-center',
                s.dailyGoal === g.v ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-surface-2',
              )}
            >
              <div className="text-sm font-semibold">{g.t}</div>
              <div className="text-[10px] text-muted">
                {g.v} XP · {g.d}
              </div>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted">XP dostáváš za každou odpověď (víc za delší), za splněná cvičení a správné fráze.</div>
      </Card>

      <Card className="space-y-3">
        <Label>Rozpoznávání řeči</Label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { v: 'auto', t: 'Automaticky', d: 'iPhone: AI přepis' },
              { v: 'ai', t: 'AI přepis', d: 'nahrávka → Gemini' },
              { v: 'browser', t: 'Telefon', d: 'živě, zdarma' },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              onClick={() => set({ sttEngine: o.v })}
              className={cx('rounded-xl border px-1 py-2.5 text-center', s.sttEngine === o.v ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-surface-2')}
            >
              <div className="text-sm font-semibold">{o.t}</div>
              <div className="text-[10px] text-muted">{o.d}</div>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted leading-relaxed">
          <b>AI přepis</b> nahraje, co řekneš, a přepíše to tvým klíčem Gemini (nebo OpenAI). Je spolehlivý i na iPhonu a zachová tvoje chyby, jen text naskočí
          až po dokončení (1–3 s). Potřebuje internet. <b>Telefon</b> používá rozpoznávání prohlížeče: text vidíš živě a funguje i offline, ale na iPhonu často
          vypadává.
        </div>
      </Card>

      <Card className="divide-y divide-line py-1.5">
        <Row label="Zvuky a vibrace" sub="ve hrách">
          <Seg
            value={s.sound ? 'on' : 'off'}
            options={[
              { v: 'on', label: 'Zap' },
              { v: 'off', label: 'Vyp' },
            ]}
            onChange={(v) => set({ sound: v === 'on' })}
          />
        </Row>
        <Row label="Vzhled">
          <Seg
            value={s.theme}
            options={[
              { v: 'dark', label: 'Tmavý' },
              { v: 'light', label: 'Světlý' },
            ]}
            onChange={(v) => set({ theme: v })}
          />
        </Row>
        <Row label="Přízvuk (řeč i hlas)" sub={sttSupported ? undefined : 'Rozpoznávání řeči není v tomto prohlížeči dostupné'}>
          <Seg
            value={s.accent}
            options={[
              { v: 'en-US', label: 'US' },
              { v: 'en-GB', label: 'UK' },
            ]}
            onChange={(v) => set({ accent: v })}
          />
        </Row>
        <Row label="Mikrofon" sub={s.micMode === 'ptt' ? 'Drž tlačítko / mezerník a mluv' : 'Ťukni pro start, ťukni pro stop'}>
          <Seg
            value={s.micMode}
            options={[
              { v: 'toggle', label: 'Toggle' },
              { v: 'ptt', label: 'Push-to-talk' },
            ]}
            onChange={(v) => set({ micMode: v })}
          />
        </Row>
        <Row label="Rychlost hlasu">
          <div className="flex items-center gap-2">
            <Seg
              value={s.ttsRate}
              options={[
                { v: 0.8, label: '0.8×' },
                { v: 1, label: '1.0×' },
              ]}
              onChange={(v) => set({ ttsRate: v })}
            />
            <SpeakButton text="Hi! This is how I sound. It turns out that practice really helps." compact />
          </div>
        </Row>
        <Row label="Auto-ukládání chyb" sub="Věty s Czenglish chybami → Banka chyb">
          <Toggle on={s.autoSaveMistakes} onChange={(v) => set({ autoSaveMistakes: v })} />
        </Row>
        <Row label="Automaticky číst repliky" sub="V hraní rolí">
          <Toggle on={s.autoPlayRoleplay} onChange={(v) => set({ autoPlayRoleplay: v })} />
        </Row>
      </Card>

      <Card className="space-y-3">
        <Label>Záloha dat</Label>
        <div className="text-xs text-muted">
          {counts.v} slovíček · {counts.m} chyb. Data jsou jen v tomto zařízení – pravidelně si je zálohuj.
        </div>
        <div className="flex gap-2">
          <Btn className="flex-1" onClick={doExport}>
            <Download className="size-4" /> Export JSON
          </Btn>
          <Btn className="flex-1" onClick={() => file.current?.click()}>
            <Upload className="size-4" /> Import
          </Btn>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = '';
            }}
          />
        </div>
        <button
          className="text-xs text-red-500 underline"
          onClick={() => {
            if (confirm('Opravdu smazat všechna slovíčka, chyby a statistiky? (Nastavení zůstane.)')) resetAll();
          }}
        >
          Smazat všechna data
        </button>
      </Card>

      <div className="text-center text-[11px] text-muted pb-2 flex items-center justify-center gap-1">
        {s.theme === 'dark' ? <Moon className="size-3" /> : <Sun className="size-3" />} Ajna · offline-first · žádný server
      </div>
    </div>
  );
}
