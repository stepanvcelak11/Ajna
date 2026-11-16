import {
  BookOpen,
  Check,
  ChevronRight,
  Languages,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FeedbackCard } from "../components/FeedbackCard";
import { Choice, type ChoiceState } from "../components/game";
import { IconTile, type Tone } from "../components/icons";
import { PracticeBar } from "../components/LevelPicker";
import { MicRecorder } from "../components/MicRecorder";
import { ClickableText } from "../components/WordPopover";
import {
  Btn,
  Card,
  ErrorBox,
  Label,
  ModeHeader,
  Spinner,
  cx,
} from "../components/ui";
import { StoryPractice } from "../components/StoryPractice";
import { BUILTIN_STORIES, STORY_TOPICS } from "../data/stories";
import { evaluate, generateStory, type Story } from "../lib/ai";
import { hasKey } from "../lib/llm";
import { sfx } from "../lib/sfx";
import { speak, stopSpeaking } from "../lib/speech";
import { recordActivity, useStore } from "../lib/store";
import type { Evaluation } from "../lib/types";
import { celebrate, useOnline } from "../lib/ui";

type Step = "read" | "quiz" | "practice" | "retell";
const STEP_LABEL: Record<Step, string> = {
  read: "Čtení",
  quiz: "Otázky",
  practice: "Procvičení",
  retell: "Vyprávění",
};

// stories read so far (built-in ids) and the last AI story, kept on this device
const DONE_KEY = "ajna-stories-done";
const LAST_KEY = "ajna-last-story";
function readDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function markDone(id: string) {
  try {
    const d = readDone();
    if (!d.includes(id))
      localStorage.setItem(DONE_KEY, JSON.stringify([...d, id]));
  } catch {
    /* optional */
  }
}
function loadLast(): Story | null {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) ?? "null");
  } catch {
    return null;
  }
}

export default function Stories() {
  const level = useStore((s) => s.settings.level);
  const online = useOnline();
  const [story, setStory] = useState<Story | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const lastTopic = useRef("");

  const make = async (topic: string) => {
    lastTopic.current = topic;
    setBusy(true);
    setErr(null);
    try {
      const st = await generateStory(topic);
      try {
        localStorage.setItem(LAST_KEY, JSON.stringify(st));
      } catch {
        /* optional */
      }
      setStory(st);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (story) return <StoryView story={story} onBack={() => setStory(null)} />;

  return (
    <StoryList
      level={level}
      online={online}
      busy={busy}
      err={err}
      custom={custom}
      setCustom={setCustom}
      make={make}
      retry={() => make(lastTopic.current)}
      open={setStory}
    />
  );
}

const CEFR = ["A1", "A2", "B1", "B2"];

function StoryList({
  level,
  online,
  busy,
  err,
  custom,
  setCustom,
  make,
  retry,
  open,
}: {
  level: number;
  online: boolean;
  busy: boolean;
  err: string | null;
  custom: string;
  setCustom: (s: string) => void;
  make: (t: string) => void;
  retry: () => void;
  open: (s: Story) => void;
}) {
  const [lv, setLv] = useState(Math.min(level, 4));
  const done = readDone();
  const last = loadLast();
  const ai = online && hasKey();
  const list = BUILTIN_STORIES.filter((s) => s.level === lv);
  const minutes = (st: Story) =>
    Math.max(
      1,
      Math.round(
        st.sentences.reduce((n, x) => n + x.en.split(" ").length, 0) / 60 +
          st.questions.length * 0.3 +
          1,
      ),
    );

  return (
    <div className="space-y-5">
      <ModeHeader
        title="Příběhy"
        subtitle="Čti, poslouchej, procvič angličtinu z textu"
        below={<PracticeBar />}
      />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <Label>Připravené příběhy (i offline)</Label>
          <span className="text-[11px] text-muted tabular-nums">
            {done.length}/{BUILTIN_STORIES.length} přečteno
          </span>
        </div>
        <div className="mb-3 grid grid-cols-4 gap-1 rounded-xl border border-line bg-surface-2 p-1 text-xs font-bold">
          {CEFR.map((c, k) => (
            <button
              key={c}
              onClick={() => setLv(k + 1)}
              className={cx(
                "rounded-lg py-1.5",
                lv === k + 1 ? "bg-surface text-fg shadow-sm" : "text-muted",
              )}
            >
              {c}{" "}
              <span className="font-normal text-muted">
                ({BUILTIN_STORIES.filter((x) => x.level === k + 1).length})
              </span>
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {list.map((s) => {
            const isDone = done.includes(s.id);
            return (
              <Card
                key={s.id}
                onClick={() => open(s)}
                className={cx(
                  "flex items-center gap-3",
                  isDone && "border-emerald-500/30",
                )}
              >
                {isDone ? (
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
                    <Check className="size-5" />
                  </span>
                ) : (
                  <IconTile
                    name="book"
                    tone={
                      (["emerald", "sky", "violet", "rose"] as Tone[])[
                        s.level - 1
                      ]
                    }
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-muted">
                    {s.title_cz} · {s.sentences.length} vět · ~{minutes(s)} min
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted" />
              </Card>
            );
          })}
        </div>
      </section>

      {busy && <Spinner label="Píšu příběh pro tvou úroveň…" />}
      {err && <ErrorBox error={err} onRetry={retry} />}

      <section>
        <Label className="mb-2">
          Nový příběh od AI {!ai && "(potřebuje internet a klíč)"}
        </Label>
        {last && (
          <Card
            onClick={() => open(last)}
            className="mb-2.5 flex items-center gap-3 border-accent/40"
          >
            <IconTile name="sparkle" tone="violet" size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-accent">
                Poslední AI příběh
              </div>
              <div className="truncate text-sm font-semibold">{last.title}</div>
            </div>
            <ChevronRight className="size-4 text-muted" />
          </Card>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          {STORY_TOPICS.map((t) => (
            <Card
              key={t.en}
              onClick={ai && !busy ? () => make(t.en) : undefined}
              className={cx(
                "flex items-center gap-2.5 p-3",
                (!ai || busy) && "opacity-50",
              )}
            >
              <IconTile name={t.icon} tone={t.tone as Tone} size="sm" />
              <span className="text-xs font-semibold leading-tight">
                {t.cz}
              </span>
            </Card>
          ))}
        </div>
        <div className="mt-2.5 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Vlastní téma (česky i anglicky)…"
            className="h-11 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-[16px] outline-none focus:border-accent/60"
          />
          <Btn
            variant="primary"
            disabled={!ai || busy || !custom.trim()}
            onClick={() => make(custom.trim())}
          >
            <Sparkles className="size-4" />
          </Btn>
        </div>
      </section>
    </div>
  );
}

function StoryView({ story, onBack }: { story: Story; onBack: () => void }) {
  const [step, setStep] = useState<Step>("read");
  const [showCz, setShowCz] = useState(false);
  const [open, setOpen] = useState<number[]>([]);
  const [inPractice, setInPractice] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    story.questions.map(() => null),
  );
  const [ev, setEv] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const online = useOnline();
  const stopRef = useRef(false);

  useEffect(() => () => stopSpeaking(), []);

  const playFrom = (n: number) => {
    stopRef.current = false;
    if (n >= story.sentences.length) {
      setPlaying(null);
      return;
    }
    setPlaying(n);
    speak(story.sentences[n].en, {
      onEnd: () => !stopRef.current && playFrom(n + 1),
    });
  };
  const stop = () => {
    stopRef.current = true;
    stopSpeaking();
    setPlaying(null);
  };

  const answer = (qi: number, n: number) => {
    if (answers[qi] !== null) return;
    const ok = n === story.questions[qi].a;
    setAnswers((a) => a.map((x, k) => (k === qi ? n : x)));
    recordActivity("stories", ok ? 4 : 0);
    if (ok) sfx.correct();
    else sfx.wrong();
  };
  const allAnswered = answers.every((a) => a !== null);
  useEffect(() => {
    const id = (story as Story & { id?: string }).id;
    if (allAnswered && id) markDone(id);
  }, [allAnswered]); // eslint-disable-line react-hooks/exhaustive-deps
  const correct = answers.filter((a, k) => a === story.questions[k].a).length;

  const retell = async (text: string) => {
    setBusy(true);
    setErr(null);
    try {
      const r = await evaluate({
        task: `The learner read this short story and must RETELL it in their own words in English: """${story.sentences.map((s) => s.en).join(" ")}""". Judge grammar and naturalness of what they said; it does not need to be complete or long.`,
        answer: text,
        passRule:
          "true if the retelling matches the story and has no serious grammar errors.",
      });
      setEv(r);
      if (r.passed) {
        celebrate();
        sfx.win();
        recordActivity("stories", 10);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!(step === "practice" && inPractice) && (
        <>
          <ModeHeader
            title={story.title}
            subtitle={story.title_cz}
            onBack={onBack}
            right={
              <Btn
                variant="ghost"
                className="h-9 px-2 text-xs"
                onClick={onBack}
              >
                Jiný
              </Btn>
            }
          />
          <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl border border-line bg-surface-2 p-1 text-[11px] font-semibold">
            {(["read", "quiz", "practice", "retell"] as Step[]).map((s, n) => (
              <button
                key={s}
                onClick={() => (stop(), setStep(s), window.scrollTo(0, 0))}
                className={cx(
                  "rounded-lg py-2",
                  step === s ? "bg-surface text-fg shadow-sm" : "text-muted",
                )}
              >
                {n + 1}. {STEP_LABEL[s]}
              </button>
            ))}
          </div>
        </>
      )}

      {step === "read" && (
        <>
          <div className="mb-3 flex gap-2">
            <Btn
              variant="primary"
              className="flex-1"
              onClick={() => (playing === null ? playFrom(0) : stop())}
            >
              {playing === null ? (
                <Play className="size-4" />
              ) : (
                <Pause className="size-4" />
              )}
              {playing === null ? "Přečíst nahlas" : "Zastavit"}
            </Btn>
            <Btn
              variant={showCz ? "primary" : "secondary"}
              onClick={() => setShowCz((x) => !x)}
              aria-label="Překlad"
            >
              <Languages className="size-4" /> CZ
            </Btn>
          </div>
          <Card className="space-y-3 text-[17px] leading-relaxed">
            {story.sentences.map((s, n) => (
              <div
                key={n}
                className={cx(
                  "-mx-2 rounded-xl px-2 py-1 transition-colors",
                  playing === n && "bg-accent/12",
                )}
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => (stop(), speak(s.en))}
                    className="mt-1.5 size-5 shrink-0 rounded-full bg-surface-3 text-[10px] font-bold text-muted"
                    aria-label={`Přehrát větu ${n + 1}`}
                  >
                    {n + 1}
                  </button>
                  <div className="min-w-0 flex-1">
                    <ClickableText text={s.en} />
                    {(showCz || open.includes(n)) && (
                      <div className="mt-0.5 text-sm text-muted animate-fade">
                        {s.cz}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setOpen((o) =>
                        o.includes(n) ? o.filter((x) => x !== n) : [...o, n],
                      )
                    }
                    aria-label={`Překlad věty ${n + 1}`}
                    className={cx(
                      "mt-1 grid size-7 shrink-0 place-items-center rounded-lg",
                      showCz || open.includes(n)
                        ? "bg-accent/15 text-accent"
                        : "text-muted/70 hover:bg-surface-2",
                    )}
                  >
                    <Languages className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </Card>
          <div className="mt-2 text-center text-[11px] text-muted">
            Ikona vpravo = překlad věty · číslo = přehrát větu · slovo = význam
            slova (s internetem)
          </div>
          <Btn
            variant="primary"
            className="mt-4 h-12 w-full"
            onClick={() => (stop(), setStep("quiz"))}
          >
            Na otázky <ChevronRight className="size-4" />
          </Btn>
        </>
      )}

      {step === "quiz" && (
        <div className="space-y-5">
          {story.questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <div className="text-sm font-semibold">
                {qi + 1}. {q.q}
              </div>
              {q.options.map((o, n) => {
                const st: ChoiceState =
                  answers[qi] === null
                    ? "idle"
                    : n === q.a
                      ? "correct"
                      : n === answers[qi]
                        ? "wrong"
                        : "dim";
                return (
                  <Choice key={n} state={st} onClick={() => answer(qi, n)}>
                    {o}
                  </Choice>
                );
              })}
            </div>
          ))}
          {allAnswered && (
            <Card className="flex items-center gap-3 animate-up">
              <IconTile
                name={correct === story.questions.length ? "trophy" : "book"}
                tone={correct === story.questions.length ? "emerald" : "sky"}
              />
              <div className="flex-1 text-sm">
                <b>
                  {correct}/{story.questions.length}
                </b>{" "}
                správně.{" "}
                {correct < story.questions.length && "Mrkni zpátky do textu."}
              </div>
              <Btn
                variant="primary"
                onClick={() => (setStep("practice"), window.scrollTo(0, 0))}
              >
                Dál <ChevronRight className="size-4" />
              </Btn>
            </Card>
          )}
        </div>
      )}

      {step === "practice" && (
        <div className="space-y-4">
          <StoryPractice story={story} onActive={setInPractice} />
          {!inPractice && (
            <Btn
              variant="primary"
              className="h-12 w-full"
              onClick={() => (setStep("retell"), window.scrollTo(0, 0))}
            >
              Na převyprávění <ChevronRight className="size-4" />
            </Btn>
          )}
        </div>
      )}

      {step === "retell" && (
        <div className="space-y-4">
          <Card className="flex items-start gap-3 py-3">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-accent" />
            <div className="text-sm">{story.retell_cz}</div>
          </Card>
          {!online || !hasKey() ? (
            <Card className="text-sm text-muted">
              Hodnocení převyprávění potřebuje internet a API klíč. Zkus to
              nahlas aspoň pro sebe!
            </Card>
          ) : (
            <>
              {!ev && (
                <MicRecorder
                  resetKey={story.title}
                  onSubmit={retell}
                  busy={busy}
                  submitLabel="Vyhodnotit"
                  placeholder="Převyprávěj příběh anglicky…"
                />
              )}
              {busy && <Spinner label="Hodnotím…" />}
              {err && <ErrorBox error={err} />}
              {ev && (
                <>
                  <FeedbackCard
                    evaluation={ev}
                    mode="stories"
                    showVerdict="passed"
                  />
                  <Btn className="w-full" onClick={() => setEv(null)}>
                    Zkusit znovu
                  </Btn>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
