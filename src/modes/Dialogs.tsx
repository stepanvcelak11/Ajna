import { BookOpen, Check, ChevronRight, Eye, Languages, Mic, RotateCcw, Volume2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GameEnd, GameHeader } from '../components/game';
import { MicRecorder } from '../components/MicRecorder';
import { SoundHint } from '../components/Speak';
import { Btn, Card, Label, ModeHeader, cx } from '../components/ui';
import { dialogsDone, dialogsFor, saveDialogScore, type Dialog } from '../data/dialogs';
import { LEVELS } from '../data/levels';
import { canTranscribe } from '../lib/llm';
import { checkPhrase } from '../lib/match';
import { sfx } from '../lib/sfx';
import { speak, sttSupported } from '../lib/speech';
import { recordActivity, recordGame, useStore } from '../lib/store';
import { useOnline } from '../lib/ui';

type Style = 'read' | 'translate';
const TRIES = 3;

/** Speaking only: you play one person in an everyday dialogue, the app plays the other. */
export default function Dialogs() {
  const level = useStore((s) => s.settings.level);
  const online = useOnline();
  const canSpeak = sttSupported || (online && canTranscribe());
  const [dlg, setDlg] = useState<Dialog | null>(null);
  const [style, setStyle] = useState<Style>(() => (localStorage.getItem('ajna-dialog-style') === 'translate' ? 'translate' : 'read'));
  const [run, setRun] = useState(0);
  const done = useMemo(() => dialogsDone(), [dlg]); // eslint-disable-line react-hooks/exhaustive-deps

  if (dlg) return <Play key={`${dlg.id}-${run}`} d={dlg} style={style} onBack={() => setDlg(null)} onAgain={() => setRun((r) => r + 1)} />;

  const pickStyle = (s: Style) => {
    setStyle(s);
    try {
      localStorage.setItem('ajna-dialog-style', s);
    } catch {
      /* optional */
    }
  };

  return (
    <div className="space-y-4">
      <ModeHeader title="Dialogy" subtitle="Hraješ jednu roli v rozhovoru, jen mluvením" />
      {!canSpeak && <Card className="border-amber-500/40 text-sm">Mikrofon tu není dostupný. Dialogy potřebují rozpoznávání řeči (nebo internet a API klíč).</Card>}
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['read', BookOpen, 'Čti nahlas', 'Vidíš anglickou větu a přečteš ji'],
            ['translate', Languages, 'Z češtiny', 'Vidíš česky, řekneš anglicky'],
          ] as const
        ).map(([s, Ico, title, desc]) => (
          <button
            key={s}
            onClick={() => pickStyle(s)}
            className={cx('rounded-2xl border-2 p-3 text-left transition', style === s ? 'border-accent bg-accent/10' : 'border-line bg-surface')}
          >
            <Ico className={cx('mb-1 size-5', style === s ? 'text-accent' : 'text-muted')} />
            <div className="text-sm font-bold">{title}</div>
            <div className="text-[11px] leading-snug text-muted">{desc}</div>
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        {dialogsFor(level).map((d) => {
          const best = done[d.id];
          const mine = d.lines.filter((l) => l.who === 'me').length;
          return (
            <Card key={d.id} onClick={canSpeak ? () => setDlg(d) : undefined} className={cx('flex items-center gap-3', !canSpeak && 'opacity-50')}>
              <span className={cx('grid size-11 shrink-0 place-items-center rounded-xl text-xs font-extrabold', best !== undefined ? 'bg-emerald-500 text-white' : 'bg-accent/12 text-accent')}>
                {best !== undefined ? <Check className="size-5" /> : LEVELS[d.level - 1]?.cefr ?? 'B1'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{d.cz}</div>
                <div className="truncate text-xs text-muted">
                  {d.title} · {mine} replik{best !== undefined ? ` · nejlépe ${best} %` : ''}
                </div>
              </div>
              <ChevronRight className="size-4 text-muted" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Play({ d, style, onBack, onAgain }: { d: Dialog; style: Style; onBack: () => void; onAgain: () => void }) {
  const [n, setN] = useState(0); // index of the current line
  const [tries, setTries] = useState(0);
  const [heard, setHeard] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [peek, setPeek] = useState(false);
  const [showCz, setShowCz] = useState<Record<number, boolean>>({});
  const [firstTry, setFirstTry] = useState<Record<number, boolean>>({});
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const line = d.lines[n];
  const mine = d.lines.filter((l) => l.who === 'me').length;
  const score = Object.values(firstTry).filter(Boolean).length;

  // the other person speaks, then it's your turn
  useEffect(() => {
    if (!line) return;
    if (line.who === 'them') {
      let next = false;
      const go = () => {
        if (!next) {
          next = true;
          setN((x) => x + 1);
        }
      };
      speak(line.en, { onEnd: () => setTimeout(go, 250) });
      // fallback if the voice is muted or never reports the end
      const tm = setTimeout(go, 1200 + line.en.length * 70);
      return () => clearTimeout(tm);
    }
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [n, heard, failed]);

  useEffect(() => {
    if (!line && !result) {
      const pct = Math.round((score / mine) * 100);
      saveDialogScore(d.id, pct);
      setResult({ best: recordGame('dialogs', score, mine) });
    }
  }, [line]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = () => {
    setTries(0);
    setHeard(null);
    setFailed(false);
    setPeek(false);
    setN((x) => x + 1);
  };

  const submit = (said: string) => {
    const t = tries + 1;
    setTries(t);
    setHeard(said);
    if (checkPhrase(line, said, true).verdict === 'ok') {
      const first = t === 1 && !peek;
      const gain = first ? 5 : 2;
      setFirstTry((f) => ({ ...f, [n]: first }));
      setXp((x) => x + gain);
      recordActivity('dialogs', gain);
      sfx.correct(1);
      setTimeout(advance, 700);
    } else {
      sfx.wrong();
      recordActivity('dialogs', 0);
      if (t >= TRIES) {
        setFailed(true);
        setFirstTry((f) => ({ ...f, [n]: false }));
        speak(line.en);
      }
    }
  };

  const history = d.lines.slice(0, Math.min(n, d.lines.length));
  const bubbles = (
    <div className="space-y-2">
      {history.map((l, k) => (
        <div key={k} className={cx('flex', l.who === 'me' ? 'justify-end' : 'justify-start')}>
          <div
            className={cx(
              'max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug animate-up',
              l.who === 'me' ? (firstTry[k] ? 'rounded-br-md bg-emerald-500 text-white' : 'rounded-br-md bg-accent text-white') : 'rounded-bl-md border border-line bg-surface',
            )}
          >
            <div className="flex items-start gap-2">
              <span className="flex-1">{l.en}</span>
              {l.who === 'them' && (
                <span className="flex shrink-0 gap-1 pt-0.5">
                  <button aria-label="Přehrát" onClick={() => speak(l.en)} className="text-accent">
                    <Volume2 className="size-4" />
                  </button>
                  <button aria-label="Překlad" onClick={() => setShowCz((s) => ({ ...s, [k]: !s[k] }))} className="text-muted">
                    <Languages className="size-4" />
                  </button>
                </span>
              )}
            </div>
            {showCz[k] && <div className="mt-1 text-xs text-muted">{l.cz}</div>}
          </div>
        </div>
      ))}
    </div>
  );

  if (!line)
    return (
      <div>
        <GameHeader title={d.cz} i={mine} total={mine} combo={0} onBack={onBack} />
        <GameEnd score={score} total={mine} xp={xp} best={result?.best} icon="dialog" tone="rose" extra="replik napoprvé" onAgain={onAgain} onContinue={onBack}>
          <div className="max-h-72 overflow-y-auto text-left">{bubbles}</div>
        </GameEnd>
      </div>
    );

  const myIndex = d.lines.slice(0, n).filter((l) => l.who === 'me').length;

  return (
    <div>
      <GameHeader title={d.cz} subtitle={`${style === 'read' ? 'Čti nahlas' : 'Z češtiny'} · ${xp} XP`} i={myIndex} total={mine} combo={0} onBack={onBack} />
      <div className="mb-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">{d.setting}</div>
      {bubbles}
      {line.who === 'them' ? (
        <div className="mt-2 flex justify-start">
          <div className="rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
            <span className="inline-flex gap-1">
              {[0, 1, 2].map((k) => (
                <span key={k} className="size-2 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${k * 0.2}s` }} />
              ))}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Card className={cx('space-y-2 animate-up', failed ? 'border-red-500/40' : 'border-accent/40')}>
            <Label className="flex items-center gap-1.5">
              <Mic className="size-3.5" /> {style === 'read' ? 'Přečti nahlas' : 'Řekni anglicky'}
            </Label>
            {style === 'read' || failed || peek ? (
              <div data-line className={cx('text-xl font-bold leading-snug', failed && 'text-red-500')}>{line.en}</div>
            ) : null}
            <div className={cx(style === 'read' || failed || peek ? 'text-xs text-muted' : 'text-xl font-bold leading-snug')}>{line.cz}</div>
            {heard !== null && !failed && (
              <div className="flex items-start gap-1.5 rounded-xl bg-red-500/8 px-3 py-2 text-xs">
                <X className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                <span>
                  Mikrofon slyšel: <b>„{heard}“</b>. Zkus to znovu (pokus {tries + 1} ze {TRIES}).
                </span>
              </div>
            )}
            {failed && <div className="text-xs text-muted">Poslechni si, jak se to řekne, a pokračuj.</div>}
            <div className="flex gap-2">
              <Btn variant="secondary" className="h-9 text-xs" onClick={() => speak(line.en, { rate: 0.8 })}>
                <Volume2 className="size-4" /> Poslech
              </Btn>
              {style === 'translate' && !peek && !failed && (
                <Btn variant="ghost" className="h-9 text-xs" onClick={() => setPeek(true)}>
                  <Eye className="size-4" /> Napovědět
                </Btn>
              )}
            </div>
            <SoundHint />
          </Card>
          {failed ? (
            <div className="flex gap-2">
              <Btn
                className="flex-1 text-xs"
                onClick={() => {
                  setFailed(false);
                  setHeard(null);
                  setTries(0);
                }}
              >
                <RotateCcw className="size-4" /> Ještě jednou
              </Btn>
              <Btn variant="primary" className="h-12 flex-1" onClick={advance}>
                Pokračovat <ChevronRight className="size-4" />
              </Btn>
            </div>
          ) : (
            <MicRecorder speakOnly resetKey={`${n}-${tries}`} submitLabel="Ověřit" hint="Ťukni na mikrofon a řekni svou repliku" onSubmit={submit} />
          )}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
