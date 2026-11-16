import { AlertTriangle, ChevronRight, Lightbulb, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IconTile } from '../components/icons';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ErrorBox, Label, ModeHeader, Spinner, cx } from '../components/ui';
import { LEVELS, type GrammarTopic } from '../data/levels';
import { LESSONS } from '../data/textbook';
import { cachedSheet, explainGrammar, type GrammarSheet } from '../lib/ai';
import { hasKey } from '../lib/llm';
import { navigate } from '../lib/router';
import { updateSettings, useStore } from '../lib/store';
import { toast, useOnline } from '../lib/ui';

type Pick = { topic: GrammarTopic; level: number; lesson?: (typeof LESSONS)[number] };

export default function Cheatsheet() {
  const level = useStore((s) => s.settings.level);
  const [open, setOpen] = useState<number>(level);
  const [pick, setPick] = useState<Pick | null>(null);

  if (pick) return <SheetView pick={pick} onBack={() => setPick(null)} />;

  return (
    <div className="space-y-4">
      <ModeHeader title="Gramatický tahák" subtitle="Pravidla česky, příklady a typické chyby" />
      {LEVELS.map((l) => (
        <Card key={l.id} className="p-0">
          <button onClick={() => setOpen(open === l.id ? 0 : l.id)} className="flex w-full items-center gap-3 p-4 text-left">
            <span className={cx('grid size-9 place-items-center rounded-xl font-bold', l.id === level ? 'bg-accent text-white' : 'bg-surface-3 text-muted')}>{l.id}</span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">
                {l.name} <span className="text-xs font-normal text-muted">{l.cefr}</span>
              </span>
              <span className="text-xs text-muted">{l.grammar.length} témat</span>
            </span>
            <ChevronRight className={cx('size-4 text-muted transition', open === l.id && 'rotate-90')} />
          </button>
          {open === l.id && (
            <div className="divide-y divide-line border-t border-line">
              {l.grammar.map((t) => (
                <button key={t.id} onClick={() => setPick({ topic: t, level: l.id })} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-surface-2">
                  <span className="flex-1">{t.cz}</span>
                  {cachedSheet(t.id) && <span className="text-[10px] text-emerald-500">offline</span>}
                  <ChevronRight className="size-4 text-muted" />
                </button>
              ))}
            </div>
          )}
        </Card>
      ))}
      <Label>Z učebnice</Label>
      <Card className="divide-y divide-line p-0">
        {LESSONS.flatMap((ls) =>
          ls.topics.map((t) => (
            <button key={t.id} onClick={() => setPick({ topic: t, level: 3, lesson: ls })} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-surface-2">
              <IconTile name={ls.icon} tone={ls.tone} size="sm" />
              <span className="flex-1">
                <span className="block">{t.cz}</span>
                <span className="text-[11px] text-muted">Lekce {ls.n}</span>
              </span>
              <ChevronRight className="size-4 text-muted" />
            </button>
          )),
        )}
      </Card>
    </div>
  );
}

function SheetView({ pick, onBack }: { pick: Pick; onBack: () => void }) {
  const { topic, lesson } = pick;
  const online = useOnline();
  const [sheet, setSheet] = useState<GrammarSheet | null>(() => cachedSheet(topic.id));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const tb = lesson?.topics.find((x) => x.id === topic.id);

  const load = async () => {
    setBusy(true);
    setErr(null);
    try {
      setSheet(await explainGrammar(topic.id, topic.en));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (!sheet && online && hasKey()) void load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const practise = () => {
    updateSettings({ focus: topic.id });
    toast(`Zaměření: ${topic.cz}`);
    navigate('drill');
  };

  return (
    <div className="space-y-4">
      <ModeHeader
        title={topic.cz}
        subtitle={lesson ? `Lekce ${lesson.n} · ${lesson.grammarTitle}` : `Úroveň ${pick.level}`}
        right={
          <Btn variant="ghost" className="h-9 px-2 text-xs" onClick={onBack}>
            Seznam
          </Btn>
        }
      />

      {tb && (
        <Card className="space-y-2">
          <Label>Pravidla z lekce</Label>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {tb.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {tb.examples.map((e) => (
            <div key={e} className="flex items-center gap-2 text-sm italic text-muted">
              <span className="flex-1">{e}</span>
              <SpeakButton text={e} compact />
            </div>
          ))}
        </Card>
      )}

      {busy && <Spinner label="Připravuju tahák…" />}
      {err && <ErrorBox error={err} onRetry={load} />}
      {!sheet && !busy && (!online || !hasKey()) && !tb && <Card className="text-sm text-muted">Tahák připraví AI, potřebuje internet a API klíč. Jednou načtený tahák pak funguje i offline.</Card>}

      {sheet && (
        <>
          <Card className="text-[15px] leading-relaxed animate-up">{sheet.summary_cz}</Card>
          {sheet.forms.length > 0 && (
            <Card className="space-y-2">
              <Label>Jak se tvoří</Label>
              {sheet.forms.map((f) => (
                <div key={f.label_cz} className="flex flex-col rounded-xl bg-surface-2 px-3 py-2">
                  <span className="text-[11px] font-semibold text-muted">{f.label_cz}</span>
                  <span className="font-mono text-sm">{f.pattern}</span>
                </div>
              ))}
            </Card>
          )}
          <Card className="space-y-2.5">
            <Label>Příklady</Label>
            {sheet.examples.map((e) => (
              <div key={e.en} className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.en}</div>
                  <div className="text-xs text-muted">{e.cz}</div>
                </div>
                <SpeakButton text={e.en} compact />
              </div>
            ))}
          </Card>
          <Card className="space-y-2.5 border-amber-500/30">
            <Label className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5" /> Typické chyby Čechů
            </Label>
            {sheet.mistakes.map((m) => (
              <div key={m.wrong} className="text-sm">
                <span className="text-red-500 line-through">{m.wrong}</span> → <span className="font-medium text-emerald-600 dark:text-emerald-400">{m.right}</span>
                <div className="text-xs text-muted">{m.cz}</div>
              </div>
            ))}
          </Card>
          <Card className="flex gap-2 border-accent/30 bg-accent/5 text-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
            {sheet.tip_cz}
          </Card>
        </>
      )}

      <Btn variant="primary" className="h-12 w-full" onClick={practise}>
        <Target className="size-4" /> Procvičit v překladu vět
      </Btn>
    </div>
  );
}
