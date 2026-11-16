import { Check, ChevronRight, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Icon, IconTile, LangBadge } from '../components/icons';
import { AnswerBox, HeardAs, ModeBadge, ModePicker, type InputMode } from '../components/answer';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { PHRASES, phrasesFor, type Phrase } from '../data/phrases';
import { getLevel } from '../data/levels';
import { navigate } from '../lib/router';
import { IS_IOS, speak } from '../lib/speech';
import { addVocab, getState, hasVocab, recordPhrase, useStore } from '../lib/store';
import { isTypingTarget, toast } from '../lib/ui';
import { sfx } from '../lib/sfx';
import { checkPhrase, sameWord, words, type Verdict } from '../lib/match';

const SESSION = 10;

/** Expected sentence with the words the learner missed highlighted. */
function Diff({ expected, answer }: { expected: string; answer: string }) {
  const have = new Set(words(answer));
  return (
    <span>
      {expected.split(' ').map((w, i) => {
        const n = words(w);
        const missing = n.length > 0 && n.some((x) => ![...have].some((h) => sameWord(h, x)));
        return (
          <span key={i} className={cx(missing && 'rounded bg-amber-500/20 px-0.5 text-amber-700 dark:text-amber-300')}>
            {w}{' '}
          </span>
        );
      })}
    </span>
  );
}

// ---------- session ----------

function pickSession(level: number): Phrase[] {
  const stats = getState().phraseStats;
  const pool = phrasesFor(level);
  const rnd = () => Math.random() - 0.5;
  const weak = pool.filter((p) => stats[p.id] && stats[p.id].fail >= stats[p.id].ok).sort(rnd);
  const fresh = pool.filter((p) => !stats[p.id]).sort(rnd);
  const known = pool
    .filter((p) => stats[p.id] && stats[p.id].fail < stats[p.id].ok)
    .sort((a, b) => stats[a.id].at.localeCompare(stats[b.id].at));
  // a few weak ones first, then new material, then the longest-unseen
  return [...weak.slice(0, 4), ...fresh, ...weak.slice(4), ...known].slice(0, SESSION).sort(rnd);
}

export function phraseProgress(level: number) {
  const stats = getState().phraseStats;
  const pool = phrasesFor(level);
  return { known: pool.filter((p) => stats[p.id] && stats[p.id].ok > stats[p.id].fail).length, total: pool.length };
}

export default function Sprint() {
  const level = useStore((s) => s.settings.level);
  const stats = useStore((s) => s.phraseStats);
  const [round, setRound] = useState(0);
  const initial = useMemo(() => pickSession(level), [level, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Phrase[]>(initial);
  const [i, setI] = useState(0);
  const [result, setResult] = useState<{ answer: string; verdict: Verdict; target: string } | null>(null);
  const [score, setScore] = useState({ ok: 0, wrong: [] as Phrase[] });
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [mode, setMode] = useState<InputMode | null>(null);
  const [again, setAgain] = useState(false);

  useEffect(() => {
    setQueue(initial);
    setI(0);
    setResult(null);
    setScore({ ok: 0, wrong: [] });
    setCombo(0);
    setBest(0);
  }, [initial]);

  const p = queue[i];
  const retry = p && queue.slice(0, i).some((q) => q.id === p.id);

  const submit = (answer: string) => {
    const r = checkPhrase(p, answer, true);
    const ok = r.verdict === 'ok';
    setResult({ answer, ...r });
    if (again) {
      // another go at the same phrase: feedback only, the score was already decided
      if (ok) sfx.correct(1);
      else sfx.wrong();
      return;
    }
    if (!retry) recordPhrase(p.id, ok);
    if (ok) sfx.correct(combo + 1);
    else sfx.wrong();
    if (ok) {
      setCombo((c) => {
        setBest((b) => Math.max(b, c + 1));
        return c + 1;
      });
      if (!retry) setScore((s) => ({ ...s, ok: s.ok + 1 }));
    } else {
      setCombo(0);
      if (!retry) setScore((s) => ({ ...s, wrong: [...s.wrong, p] }));
      // one more go at the end of the round
      setQueue((q) => (q.slice(i + 1).some((x) => x.id === p.id) ? q : [...q, p]));
    }
    // iPhone: playing audio right before recording often leaves the microphone deaf, so play on tap only
    if (!IS_IOS) speak(r.verdict === 'ok' ? r.target : p.en);
  };

  const next = () => {
    setResult(null);
    setAgain(false);
    setI((x) => x + 1);
  };
  const tryAgain = () => {
    setResult(null);
    setAgain(true);
  };

  useEffect(() => {
    if (!result) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isTypingTarget(e.target)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [result]);

  const lv = getLevel(level);

  if (!mode) return <ModePicker game="sprint" title="Rychlé fráze" subtitle="Česká fráze → řekni nebo napiš ji anglicky" onPick={setMode} />;

  if (!p) {
    const total = new Set(queue.map((q) => q.id)).size;
    const prog = phraseProgress(level);
    return (
      <div>
        <ModeHeader title="Rychlé fráze" />
        <Card className="text-center py-8 space-y-4 animate-up">
          <div className="flex justify-center">
            <IconTile name={score.ok >= total * 0.8 ? 'trophy' : 'bolt'} tone={score.ok >= total * 0.8 ? 'emerald' : 'amber'} size="lg" />
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums">
              {score.ok}/{total}
            </div>
            <div className="text-sm text-muted">správně napoprvé · nejdelší série {best}×</div>
          </div>
          <div className="mx-auto max-w-xs">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Zvládnuté fráze úrovně {lv.id}</span>
              <span className="tabular-nums">
                {prog.known}/{prog.total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(prog.known / prog.total) * 100}%` }} />
            </div>
          </div>
          {score.wrong.length > 0 && (
            <div className="text-left space-y-2 pt-2">
              <Label>Na tyhle se zaměř</Label>
              {score.wrong.map((w) => (
                <div key={w.id} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="text-muted text-xs">{w.cz}</div>
                    <div className="font-medium">{w.en}</div>
                  </div>
                  <SpeakButton text={w.en} compact />
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Btn className="flex-1" onClick={() => navigate('home')}>
              Domů
            </Btn>
            <Btn variant="primary" className="flex-1" onClick={() => setRound((r) => r + 1)}>
              <RotateCcw className="size-4" /> Další kolo
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  const st = stats[p.id];
  const ok = result && result.verdict === 'ok';

  return (
    <div>
      <ModeHeader
        title="Rychlé fráze"
        subtitle={`Úroveň ${lv.id} · ${lv.name}`}
        onBack={() => setMode(null)}
        right={
          combo >= 2 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/12 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-300 animate-up">
              <Icon name="flame" className="size-3.5" /> {combo}×
            </span>
          ) : undefined
        }
      />
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${(i / queue.length) * 100}%` }} />
        </div>
        <span className="text-[11px] text-muted tabular-nums">
          {i + 1}/{queue.length}
        </span>
      </div>

      <div className="space-y-4">
        <Card className={cx('transition-colors', result && (ok ? 'border-emerald-500/50' : 'border-red-500/40'))}>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <LangBadge code="CZ" /> Řekni anglicky
            </Label>
            <ModeBadge mode={mode} />
            {again ? (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">další pokus (bez bodů)</span>
            ) : retry ? (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">druhý pokus</span>
            ) : result ? null : st ? (
              <span className="text-[10px] text-muted tabular-nums">
                {st.ok}× správně · {st.fail}× chyba
              </span>
            ) : (
              <span className="text-[10px] font-medium text-accent">nová</span>
            )}
          </div>
          <div className="mt-2 text-2xl font-semibold leading-snug">{p.cz}</div>

          {result && (
            <div className="mt-4 space-y-3 animate-up">
              <div className={cx('flex items-center gap-1.5 text-sm font-semibold', ok ? 'text-emerald-500' : 'text-red-500')}>
                {ok ? <Check className="size-4" /> : <X className="size-4" />}
                {result.verdict === 'ok' ? 'Správně!' : result.verdict === 'close' ? 'Skoro, ale jedno slovo nesedí:' : 'Takhle se to řekne:'}
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-1 text-lg font-medium leading-snug">
                  {result.verdict === 'ok' ? result.target : <Diff expected={result.target} answer={result.answer} />}
                </div>
                <SpeakButton text={result.target} />
              </div>
              {result.verdict !== 'ok' && <HeardAs mode={mode} said={result.answer} />}
              {p.tip && (
                <div className="flex gap-2 rounded-xl bg-amber-500/8 border border-amber-500/25 px-3 py-2 text-xs">
                  <Icon name="bulb" className="size-4 text-amber-500" />
                  <span>{p.tip}</span>
                </div>
              )}
              {p.alt && p.alt.length > 0 && (
                <div className="text-xs text-muted">
                  Taky správně: {[p.en, ...p.alt].filter((x) => x !== result.target).join(' · ')}
                </div>
              )}
            </div>
          )}
        </Card>

        {!result ? (
          <AnswerBox mode={mode} resetKey={`${p.id}-${i}-${again}`} placeholder="Napiš větu anglicky…" hint="Řekni to nahlas, pak Ověřit" onSubmit={submit} />
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              {result.verdict !== 'ok' && (
                <Btn className="flex-1 text-xs" onClick={tryAgain}>
                  <RotateCcw className="size-4" /> {mode === 'speak' ? 'Zkusit vyslovit znovu' : 'Zkusit napsat znovu'}
                </Btn>
              )}
              {!hasVocab(p.en) && (
                <Btn
                  className="flex-1 text-xs"
                  onClick={() => {
                    if (addVocab({ en: p.en, cz: p.cz, pos: 'phrase', example: `{${p.en}}`, source: 'click' })) toast('Uloženo do slovíček');
                  }}
                >
                  <Plus className="size-4" /> Do slovíček
                </Btn>
              )}
            </div>
            <Btn variant="primary" className="w-full h-12" onClick={next}>
              {i + 1 < queue.length ? 'Další' : 'Výsledky'} <ChevronRight className="size-4" />
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

export const PHRASE_COUNT = PHRASES.length;
