import { Download, Eye, EyeOff, Moon, Sun, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { ANTHROPIC_MODELS, OPENAI_MODELS } from '../lib/llm';
import { sttSupported } from '../lib/speech';
import { exportJson, importJson, resetAll, updateSettings, useStore } from '../lib/store';
import type { Settings as S } from '../lib/types';
import { toast } from '../lib/ui';

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
  const keyField = s.provider === 'openai' ? 'openaiKey' : 'anthropicKey';
  const models = s.provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;
  const modelField = s.provider === 'openai' ? 'openaiModel' : 'anthropicModel';
  const custom = !models.includes(s[modelField]);

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
            { v: 'anthropic', label: 'Anthropic (Claude)' },
            { v: 'openai', label: 'OpenAI' },
          ]}
          onChange={(v) => set({ provider: v })}
        />
        <div>
          <div className="text-xs text-muted mb-1">API klíč</div>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={s[keyField]}
              onChange={(e) => set({ [keyField]: e.target.value } as Partial<S>)}
              placeholder={s.provider === 'openai' ? 'sk-…' : 'sk-ant-…'}
              autoComplete="off"
              spellCheck={false}
              className="w-full h-11 rounded-xl border border-line bg-surface-2 px-3 pr-11 text-[16px] font-mono outline-none focus:border-accent/60"
            />
            <button onClick={() => setShow((x) => !x)} className="absolute right-1 top-1 size-9 grid place-items-center text-muted" aria-label="Zobrazit">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="text-[11px] text-muted mt-1">
            Klíč zůstává jen v tomto prohlížeči (localStorage) a posílá se přímo na {s.provider === 'openai' ? 'api.openai.com' : 'api.anthropic.com'}. Neexportuje se
            do zálohy.
          </div>
        </div>
        <div>
          <div className="text-xs text-muted mb-1">Model</div>
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
          <div className="text-[11px] text-muted mt-1">
            {s.provider === 'anthropic'
              ? 'Haiku = nejrychlejší a nejlevnější, Sonnet = vyvážený, Opus = nejchytřejší. (Modely Claude 3.5 už nejsou dostupné.)'
              : 'gpt-4o-mini = rychlý a levný, gpt-4o = přesnější.'}
          </div>
        </div>
      </Card>

      <Card className="divide-y divide-line py-1.5">
        <Row label="Vzhled">
          <Seg
            value={s.theme}
            options={[
              { v: 'dark', label: '🌙' },
              { v: 'light', label: '☀️' },
            ]}
            onChange={(v) => set({ theme: v })}
          />
        </Row>
        <Row label="Přízvuk (řeč i hlas)" sub={sttSupported ? undefined : 'Rozpoznávání řeči není v tomto prohlížeči dostupné'}>
          <Seg
            value={s.accent}
            options={[
              { v: 'en-US', label: '🇺🇸 US' },
              { v: 'en-GB', label: '🇬🇧 UK' },
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
