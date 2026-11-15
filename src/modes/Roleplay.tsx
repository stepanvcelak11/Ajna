import { ChevronDown, GraduationCap, RotateCcw, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { ClickableText } from '../components/WordPopover';
import { Btn, Card, ErrorBox, Label, ModeHeader, Spinner, cx } from '../components/ui';
import { SCENARIOS, type Scenario } from '../data/content';
import { roleplayTurn, type RoleplayTurn } from '../lib/ai';
import { speak } from '../lib/speech';
import { getState, isMistakeSaved, saveMistake } from '../lib/store';
import type { Evaluation, TrapCategory } from '../lib/types';
import { toast, useAction } from '../lib/ui';
import { LevelChip } from '../components/LevelPicker';
import { useStore } from '../lib/store';
import { lessonOfTopic } from '../data/textbook';

interface Msg {
  who: 'ai' | 'user';
  text: string;
  tip?: RoleplayTurn['coach_tip'];
}

function tipToEval(m: Msg, scenario: Scenario): Evaluation | null {
  if (!m.tip?.has_issue) return null;
  const cat = (m.tip.category || 'other') as TrapCategory;
  return {
    user_transcript: m.text,
    grammatical_fix: m.tip.better,
    native_version: m.tip.better,
    czenglish_warnings: [{ category: cat, error: m.tip.user_said, correction: m.tip.better, tip_cz: m.tip.explanation_cz }],
    explanation_cz: [m.tip.explanation_cz],
    is_correct: false,
    passed: false,
    main_pattern: `${cat.replace('_', ' ')} (roleplay: ${scenario.title})`,
  };
}

function CoachTip({ tip }: { tip: NonNullable<Msg['tip']> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5 flex flex-col items-end">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500"
      >
        <GraduationCap className="size-3" /> Coach Tip
        <ChevronDown className={cx('size-3 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-sm animate-up">
          {tip.user_said && <div className="line-through decoration-red-500/70 text-muted">{tip.user_said}</div>}
          <div className="flex items-start gap-2 mt-1">
            <div className="flex-1 font-medium text-emerald-500">{tip.better}</div>
            <SpeakButton text={tip.better} compact />
          </div>
          <div className="mt-1 text-xs text-muted">{tip.explanation_cz}</div>
        </div>
      )}
    </div>
  );
}

export default function Roleplay() {
  const lesson = lessonOfTopic(useStore((s) => s.settings.focus));
  const lessonScenario: Scenario[] = lesson
    ? [{ id: `lesson-${lesson.n}`, emoji: '📘', turns: 5, ...lesson.roleplay, title: `L${lesson.n}: ${lesson.roleplay.title}` }]
    : [];
  const [sc, setSc] = useState<Scenario | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [k, setK] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const lastAi = [...msgs].reverse().find((m) => m.who === 'ai');

  useAction('replay', lastAi ? () => speak(lastAi.text) : null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs.length, busy]);

  const begin = (s: Scenario) => {
    setSc(s);
    setMsgs([{ who: 'ai', text: s.opener }]);
    setDone(false);
    setErr(null);
    setK((x) => x + 1);
    if (getState().settings.autoPlayRoleplay) speak(s.opener);
  };

  const userTurns = msgs.filter((m) => m.who === 'user').length;

  const send = async (text: string) => {
    if (!sc) return;
    const history: Msg[] = [...msgs, { who: 'user', text }];
    setMsgs(history);
    setK((x) => x + 1);
    setBusy(true);
    setErr(null);
    try {
      const r = await roleplayTurn({
        scenario: sc.title,
        aiRole: sc.aiRole,
        userRole: sc.userRole,
        goal: sc.goal,
        history,
        turnsLeft: sc.turns - (userTurns + 1),
      });
      const withTip = history.map((m, i) => (i === history.length - 1 ? { ...m, tip: r.coach_tip } : m));
      setMsgs([...withTip, { who: 'ai', text: r.reply }]);
      const ev = tipToEval(withTip[withTip.length - 1], sc);
      if (ev && getState().settings.autoSaveMistakes && !isMistakeSaved(ev.user_transcript)) saveMistake(ev, 'roleplay');
      if (getState().settings.autoPlayRoleplay) speak(r.reply);
      if (r.finished || userTurns + 1 >= sc.turns) setDone(true);
    } catch (e) {
      setErr((e as Error).message);
      setMsgs(msgs); // roll back
    } finally {
      setBusy(false);
    }
  };

  if (!sc)
    return (
      <div>
        <ModeHeader title="Hraní rolí" subtitle="Situational Voice Roleplay" right={<LevelChip />} />
        <div className="space-y-2.5">
          {[...lessonScenario, ...SCENARIOS].map((s) => (
            <Card key={s.id} onClick={() => begin(s)} className="flex items-center gap-3 hover:border-accent/50">
              <div className="text-2xl">{s.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{s.title}</div>
                <div className="text-xs text-muted">{s.cz}</div>
              </div>
              <div className="text-[11px] text-muted">{s.turns} tahů</div>
            </Card>
          ))}
        </div>
      </div>
    );

  const tips = msgs.filter((m) => m.tip?.has_issue);
  return (
    <div>
      <ModeHeader
        title={`${sc.emoji} ${sc.title}`}
        subtitle={`Ty: ${sc.userRole} · ${Math.min(userTurns, sc.turns)}/${sc.turns}`}
        right={
          <Btn variant="ghost" className="h-9 px-2 text-xs" onClick={() => setSc(null)}>
            Jiná
          </Btn>
        }
      />
      <Card className="mb-4 py-3">
        <div className="flex gap-2 text-sm">
          <Target className="size-4 text-accent shrink-0 mt-0.5" />
          <div>
            <div>{sc.goalCz}</div>
            <div className="text-xs text-muted mt-0.5">{sc.goal}</div>
          </div>
        </div>
      </Card>

      <div className="space-y-3 mb-4">
        {msgs.map((m, i) =>
          m.who === 'ai' ? (
            <div key={i} className="flex items-end gap-2 max-w-[90%] animate-up">
              <div className="rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2.5">
                <div className="text-[10px] text-muted mb-0.5">{sc.aiRole}</div>
                <ClickableText text={m.text} className="text-[15px] leading-relaxed" />
              </div>
              <SpeakButton text={m.text} compact />
            </div>
          ) : (
            <div key={i} className="ml-auto max-w-[85%] flex flex-col items-end animate-up">
              <div className="rounded-2xl rounded-br-md bg-accent text-white px-3.5 py-2.5 text-[15px] leading-relaxed">{m.text}</div>
              {m.tip?.has_issue && <CoachTip tip={m.tip} />}
            </div>
          ),
        )}
        {busy && <Spinner label="…" />}
        <div ref={endRef} />
      </div>

      {err && <ErrorBox error={err} />}

      {!done ? (
        <MicRecorder resetKey={k} onSubmit={send} busy={busy} submitLabel="Odeslat" placeholder="Tvoje odpověď…" />
      ) : (
        <Card className="space-y-3 animate-up">
          <Label>Konec rozhovoru 🎉</Label>
          <div className="text-sm">
            {tips.length ? `Coach měl ${tips.length} ${tips.length === 1 ? 'tip' : 'tipy'} – uložené v Bance chyb.` : 'Žádné chyby – skvělá práce!'}
          </div>
          <div className="flex gap-2">
            <Btn className="flex-1" onClick={() => begin(sc)}>
              <RotateCcw className="size-4" /> Znovu
            </Btn>
            <Btn variant="primary" className="flex-1" onClick={() => setSc(null)}>
              Další situace
            </Btn>
          </div>
          {tips.length > 0 && !getState().settings.autoSaveMistakes && (
            <Btn
              variant="secondary"
              className="w-full"
              onClick={() => {
                tips.forEach((t) => {
                  const ev = tipToEval(t, sc);
                  if (ev) saveMistake(ev, 'roleplay');
                });
                toast('Uloženo do Banky chyb');
              }}
            >
              Uložit tipy do Banky chyb
            </Btn>
          )}
        </Card>
      )}
    </div>
  );
}
