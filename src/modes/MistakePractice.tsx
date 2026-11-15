import { ChevronRight, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackCard } from '../components/FeedbackCard';
import { MicRecorder } from '../components/MicRecorder';
import { Btn, Card, ErrorBox, Label, ModeHeader, Spinner, cx } from '../components/ui';
import { evaluate, generatePatternDrill, type PatternDrill } from '../lib/ai';
import { navigate } from '../lib/router';
import { isDue } from '../lib/srs';
import { getState, setState } from '../lib/store';
import type { Evaluation, Mistake } from '../lib/types';
import { recordLevelResult } from '../lib/store';
import { LevelChip } from '../components/LevelPicker';

const DAY = 86400000;

function applyResult(id: string, passed: boolean) {
  setState((s) => ({
    ...s,
    mistakes: s.mistakes.map((m) => {
      if (m.id !== id) return m;
      if (!passed) return { ...m, dueDate: new Date(Date.now() + 10 * 60000).toISOString(), interval: 0.5 };
      const successCount = m.successCount + 1;
      const interval = successCount === 1 ? 2 : 6;
      return {
        ...m,
        successCount,
        mastered: successCount >= 2,
        interval,
        dueDate: new Date(Date.now() + interval * DAY).toISOString(),
      };
    }),
  }));
}

export default function MistakePractice() {
  const queue = useMemo<Mistake[]>(() => getState().mistakes.filter((m) => !m.mastered && isDue(m.dueDate)).slice(0, 10), []);
  const [i, setI] = useState(0);
  const [drill, setDrill] = useState<PatternDrill | null>(null);
  const [ev, setEv] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, mastered: 0 });
  const m = queue[i];

  const prefetch = useRef(new Map<string, Promise<PatternDrill>>());
  const getDrill = (x: Mistake, fresh = false) => {
    let p = fresh ? undefined : prefetch.current.get(x.id);
    if (!p) {
      p = generatePatternDrill(x.pattern, x.user_text, x.fix);
      p.catch(() => {});
    }
    prefetch.current.delete(x.id);
    return p;
  };
  const load = (fresh = false) => {
    if (!m) return;
    setDrill(null);
    setEv(null);
    setErr(null);
    getDrill(m, fresh)
      .then((d) => {
        setDrill(d);
        // prepare the next one in the background
        const n = queue[i + 1];
        if (n && !prefetch.current.has(n.id)) {
          const p = generatePatternDrill(n.pattern, n.user_text, n.fix);
          p.catch(() => {});
          prefetch.current.set(n.id, p);
        }
      })
      .catch((e) => setErr(e.message));
  };
  useEffect(() => load(), [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (text: string) => {
    if (!drill || !m) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await evaluate({
        task: `Targeted re-test of a grammar pattern the learner failed before: "${m.pattern}" (required: ${drill.target_structure}). Translate the Czech into English.`,
        prompt_cz: drill.prompt_cz,
        answer: text,
        passRule: `true only if the learner correctly used the target structure (${drill.target_structure}) and avoided the original trap; other tiny slips are OK.`,
      });
      setEv(r);
      applyResult(m.id, r.passed);
      recordLevelResult(r.passed);
      if (r.passed) setScore((s) => ({ ok: s.ok + 1, mastered: s.mastered + (m.successCount + 1 >= 2 ? 1 : 0) }));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!queue.length || !m)
    return (
      <div>
        <ModeHeader title="Procvičit chyby" />
        <Card className="text-center py-10 space-y-3">
          <div className="text-3xl">{queue.length ? '🏁' : '✨'}</div>
          <div className="font-medium">{queue.length ? 'Hotovo!' : 'Žádné chyby k procvičení'}</div>
          {queue.length > 0 && (
            <div className="text-sm text-muted">
              Úspěšně: {score.ok}/{queue.length} · nově zvládnuto: {score.mastered}
            </div>
          )}
          <Btn variant="primary" onClick={() => navigate('mistakes')}>
            Banka chyb
          </Btn>
        </Card>
      </div>
    );

  return (
    <div>
      <ModeHeader title="Procvičit chyby" subtitle={`${i + 1} / ${queue.length}`} right={<LevelChip />} />
      <div className="space-y-4">
        <Card className="py-3">
          <Label>Trénuješ vzorec</Label>
          <div className="mt-1 text-sm font-medium text-accent">{m.pattern}</div>
          <div className="mt-1 text-xs text-muted">
            Dříve: <span className="line-through">{m.user_text}</span>
          </div>
          <div className="mt-2 flex gap-1 items-center text-[11px] text-muted">
            {[0, 1].map((k) => (
              <span key={k} className={cx('size-2 rounded-full', k < m.successCount ? 'bg-emerald-500' : 'bg-surface-3')} />
            ))}
            <span className="ml-1">2 úspěšné pokusy = zvládnuto</span>
          </div>
        </Card>

        {err && <ErrorBox error={err} onRetry={drill ? undefined : () => load(true)} />}
        {!drill && !err && <Spinner label="Připravuji novou větu se stejnou pastí…" />}
        {drill && (
          <Card>
            <Label>Přelož a řekni nahlas</Label>
            <div className="mt-2 text-xl font-medium leading-snug">{drill.prompt_cz}</div>
          </Card>
        )}
        {drill && !ev && <MicRecorder resetKey={`${m.id}-${i}`} onSubmit={submit} busy={busy} />}
        {ev && (
          <>
            <FeedbackCard evaluation={ev} mode="mistake-practice" promptCz={drill?.prompt_cz} showVerdict="passed" noAutoSave />
            <div className="flex gap-2">
              {!ev.passed && (
                <Btn className="flex-1" onClick={() => load(true)}>
                  <RotateCcw className="size-4" /> Jiná věta
                </Btn>
              )}
              <Btn variant="primary" className="flex-1" onClick={() => setI((x) => x + 1)}>
                Další <ChevronRight className="size-4" />
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
