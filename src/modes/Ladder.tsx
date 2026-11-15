import { ChevronRight, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FeedbackCard } from '../components/FeedbackCard';
import { MicRecorder } from '../components/MicRecorder';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ErrorBox, Label, ModeHeader, Spinner, cx } from '../components/ui';
import { evaluate, generateLadder, type Ladder as LadderT } from '../lib/ai';
import type { Evaluation } from '../lib/types';
import { LADDER_THEMES } from '../data/content';
import { recordLevelResult } from '../lib/store';
import { PracticeBar } from '../components/LevelPicker';
import { getState } from '../lib/store';
import { lessonOfTopic } from '../data/textbook';

export default function Ladder() {
  const [ladder, setLadder] = useState<LadderT | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [stepEval, setStepEval] = useState<Evaluation | null>(null);
  const [final, setFinal] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  const nextRef = useRef<Promise<LadderT> | null>(null);
  // level changed in the picker → start a new ladder at the new level once the sheet closes
  const [pendingReload, setPendingReload] = useState(false);
  useEffect(() => {
    if (!pendingReload) return;
    setPendingReload(false);
    load();
  }, [pendingReload]); // eslint-disable-line react-hooks/exhaustive-deps
  const newLadder = () => {
    const lesson = lessonOfTopic(getState().settings.focus);
    return generateLadder(lesson ? lesson.vocabTopic : LADDER_THEMES[Math.floor(Math.random() * LADDER_THEMES.length)]);
  };

  const load = async () => {
    setLadder(null);
    setErr(null);
    setStep(0);
    setAnswers([]);
    setRevealed(false);
    setStepEval(null);
    setFinal(null);
    const pending = nextRef.current ?? newLadder();
    nextRef.current = null;
    try {
      setLadder(await pending);
      setRound((r) => r + 1);
      // prepare the next ladder while the learner works on this one
      const next = newLadder();
      next.catch(() => {});
      nextRef.current = next;
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const instruction = ladder ? [ladder.step1_cz, ladder.step2_instruction_cz, ladder.step3_instruction_cz][step] : '';

  const onSubmit = async (text: string) => {
    if (!ladder) return;
    const next = [...answers];
    next[step] = text;
    setAnswers(next);
    if (step < 2) {
      setRevealed(true);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const e = await evaluate({
        task: `Sentence expansion ladder. The learner built a sentence in 3 steps:
1) core: "${ladder.step1_cz}" 2) ${ladder.step2_instruction_cz} 3) ${ladder.step3_instruction_cz}.
Now evaluate their FINAL full sentence, which must combine all three parts into ONE smooth multi-clause sentence.
In native_version, show how a native speaker connects the clauses smoothly. Reference: "${ladder.reference_en[2] ?? ''}".`,
        prompt_cz: `${ladder.step1_cz} + ${ladder.step2_instruction_cz} + ${ladder.step3_instruction_cz}`,
        answer: text,
        passRule: 'true if all three parts (core, extension, contrast/consequence) are present and grammatical.',
      });
      setFinal(e);
      recordLevelResult(e.passed);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const checkStep = async () => {
    if (!ladder) return;
    setBusy(true);
    try {
      setStepEval(
        await evaluate({
          task: `Translate the Czech into natural English${step > 0 ? ' as ONE combined sentence including the previous part' : ''}.`,
          prompt_cz: step === 0 ? ladder.step1_cz : `${ladder.step1_cz} ${ladder.step2_instruction_cz}`,
          answer: answers[step],
        }),
      );
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const nextStep = () => {
    setStep((s) => s + 1);
    setRevealed(false);
    setStepEval(null);
  };

  return (
    <div>
      <ModeHeader
        title="Nabalování vět"
        subtitle="Sentence Expansion Ladder"
        right={
          <Btn variant="ghost" className="h-10 px-3" onClick={load} aria-label="Nová věta">
            <RefreshCw className="size-4" />
          </Btn>
        }
        below={
          <PracticeBar
            onChange={() => {
              nextRef.current = null;
              setPendingReload(true);
            }}
          />
        }
      />
      {err && <ErrorBox error={err} onRetry={ladder ? undefined : load} />}
      {!ladder && !err && <Spinner label="Připravuji větu…" />}
      {ladder && (
        <div className="space-y-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-accent' : 'bg-surface-3')} />
            ))}
          </div>

          {answers.slice(0, step).map((a, i) => (
            <div key={i} className="text-sm text-muted">
              <span className="text-[10px] font-semibold uppercase mr-2">Krok {i + 1}</span>“{a}”
            </div>
          ))}

          <Card>
            <Label>Krok {step + 1} / 3 · {ladder.topic}</Label>
            <div className="mt-2 text-xl font-medium leading-snug">{instruction}</div>
            {step > 0 && <div className="mt-2 text-xs text-muted">Řekni celou spojenou větu znovu od začátku.</div>}
          </Card>

          {!final && !revealed && (
            <MicRecorder
              resetKey={`${round}-${step}`}
              onSubmit={onSubmit}
              busy={busy}
              submitLabel={step < 2 ? 'Hotovo' : 'Vyhodnotit'}
              initialText={step > 0 ? answers[step - 1] ?? '' : ''}
              hint={step > 0 ? 'Navaž na předchozí větu' : undefined}
            />
          )}

          {revealed && !final && (
            <Card className="space-y-3 animate-up">
              <Label>Tvoje verze</Label>
              <div className="text-sm">“{answers[step]}”</div>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Label>Jedna z možností</Label>
                  <div className="mt-1 font-medium">{ladder.reference_en[step]}</div>
                </div>
                <SpeakButton text={ladder.reference_en[step] ?? ''} />
              </div>
              {stepEval && <FeedbackCard evaluation={stepEval} mode="ladder" promptCz={instruction} />}
              <div className="flex gap-2">
                {!stepEval && (
                  <Btn onClick={checkStep} loading={busy} className="flex-1">
                    Zkontrolovat AI
                  </Btn>
                )}
                <Btn variant="primary" onClick={nextStep} className="flex-1">
                  Další krok <ChevronRight className="size-4" />
                </Btn>
              </div>
            </Card>
          )}

          {busy && !revealed && <Spinner label="Vyhodnocuji…" />}

          {final && (
            <>
              <FeedbackCard
                evaluation={final}
                mode="ladder"
                promptCz={`${ladder.step1_cz} ${ladder.step2_instruction_cz} ${ladder.step3_instruction_cz}`}
                reference={ladder.reference_en[2]}
                showVerdict="passed"
              />
              <Btn variant="primary" className="w-full" onClick={load}>
                Další žebřík <ChevronRight className="size-4" />
              </Btn>
            </>
          )}
        </div>
      )}
    </div>
  );
}
