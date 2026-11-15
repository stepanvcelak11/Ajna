import { AlertTriangle, BookmarkCheck, BookmarkPlus, CheckCircle2, Sparkles, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { speak } from '../lib/speech';
import { isMistakeSaved, saveMistake, useStore } from '../lib/store';
import type { CzenglishWarning, Evaluation } from '../lib/types';
import { toast, useAction } from '../lib/ui';
import { SpeakButton } from './Speak';
import { ClickableText } from './WordPopover';
import { Btn, Card, Label, cx } from './ui';

export const TRAP_LABELS: Record<string, string> = {
  articles: 'Členy a/the',
  prepositions: 'Předložky',
  tense: 'Časy',
  word_order: 'Slovosled',
  false_friend: 'Falešní přátelé',
  word_choice: 'Volba slova',
  missing_subject: 'Chybějící podmět',
  countable_plural: 'Počitatelnost / množné č.',
  question_form: 'Tvoření otázek',
  negation: 'Zápor',
  other: 'Ostatní',
};

export function Warnings({ items }: { items: CzenglishWarning[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-amber-500">
        <AlertTriangle className="size-3.5" /> Czenglish pasti
      </Label>
      {items.map((w, i) => (
        <div key={i} className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-sm">
          <div className="text-[11px] font-medium text-amber-500 mb-1">{TRAP_LABELS[w.category] ?? w.category}</div>
          <div>
            <span className="line-through decoration-red-500/70 text-muted">{w.error}</span>
            <span className="mx-2 text-muted">→</span>
            <span className="font-medium text-emerald-500">{w.correction}</span>
          </div>
          {w.tip_cz && <div className="mt-1 text-xs text-muted">{w.tip_cz}</div>}
        </div>
      ))}
    </div>
  );
}

interface Props {
  evaluation: Evaluation;
  mode: string;
  promptCz?: string;
  reference?: string; // optional pre-generated reference
  showVerdict?: 'passed' | 'correct';
  noAutoSave?: boolean;
}

export function FeedbackCard({ evaluation: e, mode, promptCz, reference, showVerdict = 'correct', noAutoSave }: Props) {
  const autoSave = useStore((s) => s.settings.autoSaveMistakes);
  const [saved, setSaved] = useState(() => isMistakeSaved(e.user_transcript));
  const ok = showVerdict === 'passed' ? e.passed : e.is_correct;

  useEffect(() => {
    if (autoSave && !noAutoSave && e.czenglish_warnings.length && !isMistakeSaved(e.user_transcript)) {
      if (saveMistake(e, mode, promptCz)) {
        setSaved(true);
        toast('Automaticky uloženo do Banky chyb');
      }
    }
  }, [e]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    if (saved) return;
    if (saveMistake(e, mode, promptCz)) toast('Uloženo do Banky chyb');
    setSaved(true);
  };
  useAction('save', save);
  useAction('replay', () => speak(e.native_version));

  const same = e.grammatical_fix.trim().toLowerCase() === e.user_transcript.trim().toLowerCase();

  return (
    <Card className="space-y-4 animate-up">
      <div className="flex items-center justify-between gap-2">
        <div className={cx('flex items-center gap-2 text-sm font-medium', ok ? 'text-emerald-500' : 'text-amber-500')}>
          {ok ? <CheckCircle2 className="size-5" /> : <Wrench className="size-5" />}
          {ok ? (showVerdict === 'passed' ? 'Splněno!' : 'Správně!') : 'Skoro – pojďme to doladit'}
        </div>
        <Btn variant="ghost" className="h-9 px-2.5" onClick={save} title="Uložit do Banky chyb (S)">
          {saved ? <BookmarkCheck className="size-4 text-accent" /> : <BookmarkPlus className="size-4" />}
          <span className="text-xs">{saved ? 'Uloženo' : 'Uložit'}</span>
        </Btn>
      </div>

      <div>
        <Label>Řekl jsi</Label>
        <div className="mt-1 text-sm text-muted">“{e.user_transcript}”</div>
      </div>

      {!same && (
        <div>
          <Label>Gramatická oprava</Label>
          <div className="mt-1 text-[15px]">{e.grammatical_fix}</div>
        </div>
      )}

      <div className="rounded-xl bg-accent/8 border border-accent/25 p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <Label className="flex items-center gap-1.5 text-accent">
            <Sparkles className="size-3.5" /> Jak to řekne rodilý mluvčí
          </Label>
          <SpeakButton text={e.native_version} />
        </div>
        <ClickableText text={e.native_version} className="text-[17px] leading-relaxed font-medium" />
        <div className="mt-2 text-[10px] text-muted">Ťukni na slovo pro překlad · R = přehrát znovu</div>
      </div>

      {reference && reference.trim().toLowerCase() !== e.native_version.trim().toLowerCase() && (
        <div className="flex items-start gap-2 text-sm">
          <div className="flex-1">
            <Label>Další možnost</Label>
            <div className="mt-1 text-muted">{reference}</div>
          </div>
          <SpeakButton text={reference} compact />
        </div>
      )}

      <Warnings items={e.czenglish_warnings} />

      {e.explanation_cz.length > 0 && (
        <div>
          <Label>Proč</Label>
          <ul className="mt-1.5 space-y-1 text-sm">
            {e.explanation_cz.map((x, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">•</span>
                <span>{x.replace(/^[-•]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
