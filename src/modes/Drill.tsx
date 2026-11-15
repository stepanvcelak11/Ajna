import { ChevronRight, Eye } from 'lucide-react';
import { useRef, useState } from 'react';
import { FeedbackCard } from '../components/FeedbackCard';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ErrorBox, Label, ModeHeader, Spinner, cx } from '../components/ui';
import { DRILL_CONTEXTS, FLUENCY_CHUNKS, type DrillContextId } from '../data/content';
import { evaluate, generateDrill, type DrillItem } from '../lib/ai';
import type { Evaluation } from '../lib/types';

function pickChunks(ctx: DrillContextId) {
  const pool = [...FLUENCY_CHUNKS[ctx], ...FLUENCY_CHUNKS.general];
  const a = pool.splice(Math.floor(Math.random() * FLUENCY_CHUNKS[ctx].length), 1)[0];
  const b = pool[Math.floor(Math.random() * pool.length)];
  return [a, b];
}

export default function Drill() {
  const [ctx, setCtx] = useState<DrillContextId | null>(null);
  const [chunks, setChunks] = useState<{ en: string; cz: string }[]>([]);
  const [item, setItem] = useState<DrillItem | null>(null);
  const [itemPromise, setItemPromise] = useState<Promise<DrillItem> | null>(null);
  const [shown, setShown] = useState(false);
  const [evalRes, setEvalRes] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const history = useRef<string[]>([]);

  const start = (c: DrillContextId) => {
    setCtx(c);
    const ch = pickChunks(c);
    setChunks(ch);
    setItem(null);
    setShown(false);
    setEvalRes(null);
    setErr(null);
    setN((x) => x + 1);
    const label = DRILL_CONTEXTS.find((d) => d.id === c)!.label;
    // generate in the background while the learner reads the chunks
    const p = generateDrill(label, ch.map((x) => x.en), history.current);
    p.then((it) => {
      setItem(it);
      history.current.push(it.prompt_cz);
    }).catch((e) => setErr(e.message));
    setItemPromise(p);
  };

  const submit = async (text: string) => {
    if (!item) return;
    setBusy(true);
    setErr(null);
    try {
      setEvalRes(
        await evaluate({
          task: `Translate the Czech prompt into natural spoken English. The learner MUST use both fluency chunks: ${chunks
            .map((c) => `"${c.en}"`)
            .join(' and ')}. Also check that the chunks are used naturally (and mention it in explanation_cz if not).`,
          prompt_cz: item.prompt_cz,
          answer: text,
          passRule: 'true only if BOTH fluency chunks are used (small variations OK) AND the translation is accurate and grammatical.',
        }),
      );
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!ctx)
    return (
      <div>
        <ModeHeader title="Aktivní překlad" subtitle="Czech → English with Fluency Chunks" />
        <div className="text-sm text-muted mb-3">Vyber kontext:</div>
        <div className="grid grid-cols-2 gap-3">
          {DRILL_CONTEXTS.map((c) => (
            <Card key={c.id} onClick={() => start(c.id)} className="hover:border-accent/50">
              <div className="text-2xl">{c.emoji}</div>
              <div className="mt-2 font-medium text-sm">{c.label}</div>
              <div className="text-xs text-muted">{c.cz}</div>
            </Card>
          ))}
        </div>
      </div>
    );

  const ctxInfo = DRILL_CONTEXTS.find((d) => d.id === ctx)!;
  return (
    <div>
      <ModeHeader
        title="Aktivní překlad"
        subtitle={`${ctxInfo.emoji} ${ctxInfo.label} · #${n}`}
        right={
          <Btn variant="ghost" className="h-9 px-2 text-xs" onClick={() => setCtx(null)}>
            Změnit
          </Btn>
        }
      />
      <div className="space-y-4">
        <Card>
          <Label>Povinné fráze – použij obě</Label>
          <div className="mt-3 space-y-2">
            {chunks.map((c) => (
              <div key={c.en} className="flex items-center justify-between gap-2 rounded-xl bg-accent/8 border border-accent/25 px-3 py-2">
                <div>
                  <div className="font-semibold text-accent">{c.en}</div>
                  <div className="text-xs text-muted">{c.cz}</div>
                </div>
                <SpeakButton text={c.en} compact />
              </div>
            ))}
          </div>
          {!shown && (
            <Btn variant="primary" className="w-full mt-4" onClick={() => setShown(true)} disabled={!itemPromise}>
              <Eye className="size-4" /> Mám je – ukaž větu
            </Btn>
          )}
        </Card>

        {shown && (
          <>
            {err && <ErrorBox error={err} onRetry={() => start(ctx)} />}
            {!item && !err && <Spinner label="Generuji větu…" />}
            {item && (
              <Card className={cx('animate-up')}>
                <Label>Přelož a řekni nahlas</Label>
                <div className="mt-2 text-xl font-medium leading-snug">{item.prompt_cz}</div>
                {item.note_cz && <div className="mt-2 text-xs text-muted">💡 {item.note_cz}</div>}
              </Card>
            )}
            {item && !evalRes && <MicRecorder resetKey={n} onSubmit={submit} busy={busy} />}
            {evalRes && item && (
              <>
                <FeedbackCard evaluation={evalRes} mode="drill" promptCz={item.prompt_cz} showVerdict="passed" />
                <Btn variant="primary" className="w-full" onClick={() => start(ctx)}>
                  Další věta <ChevronRight className="size-4" />
                </Btn>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
