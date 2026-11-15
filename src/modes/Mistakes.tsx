import { Play, Trash2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { TRAP_LABELS, Warnings } from '../components/FeedbackCard';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, Label, cx } from '../components/ui';
import { navigate } from '../lib/router';
import { isDue } from '../lib/srs';
import { setState, topTraps, useStore } from '../lib/store';
import type { Mistake } from '../lib/types';

export default function Mistakes() {
  const mistakes = useStore((s) => s.mistakes);
  const [tab, setTab] = useState<'active' | 'mastered'>('active');
  const active = mistakes.filter((m) => !m.mastered);
  const mastered = mistakes.filter((m) => m.mastered);
  const due = active.filter((m) => isDue(m.dueDate)).length;
  const traps = topTraps(mistakes, 5);
  const list = tab === 'active' ? active : mastered;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Banka chyb</h1>
          <div className="text-xs text-muted">
            {active.length} aktivních · {mastered.length} zvládnutých
          </div>
        </div>
        <Btn variant="primary" disabled={!due} onClick={() => navigate('mistake-practice')}>
          <Play className="size-4" /> Procvičit {due > 0 && `(${due})`}
        </Btn>
      </div>

      {traps.length > 0 && (
        <Card>
          <Label>Tvoje nejčastější pasti</Label>
          <div className="mt-3 space-y-2">
            {traps.map((t) => (
              <div key={t.category} className="flex items-center gap-3">
                <div className="text-sm flex-1">{TRAP_LABELS[t.category] ?? t.category}</div>
                <div className="h-1.5 w-24 rounded-full bg-surface-3 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(t.count / traps[0].count) * 100}%` }} />
                </div>
                <div className="text-xs tabular-nums text-muted w-5 text-right">{t.count}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-1.5">
        {(['active', 'mastered'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx('rounded-full px-3 py-1 text-xs border', tab === t ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted')}
          >
            {t === 'active' ? 'Aktivní' : 'Zvládnuté'}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card className="text-center text-sm text-muted py-8">
          {tab === 'active'
            ? 'Zatím žádné chyby. Věty s Czenglish chybami se sem ukládají automaticky (nebo klávesou S).'
            : 'Zatím nic zvládnutého – každá chyba potřebuje 2 úspěšné pokusy.'}
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((m) => (
            <MistakeRow key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MistakeRow({ m }: { m: Mistake }) {
  const [open, setOpen] = useState(false);
  const due = !m.mastered && isDue(m.dueDate);
  return (
    <Card className="py-3" onClick={() => setOpen((o) => !o)}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-accent font-medium flex items-center gap-1.5">
            {m.mastered && <Trophy className="size-3" />}
            {m.pattern}
          </div>
          <div className="text-sm text-muted line-through decoration-red-500/50 truncate mt-0.5">{m.user_text}</div>
          <div className="text-sm truncate">{m.native}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-0.5">
            {[0, 1].map((i) => (
              <span key={i} className={cx('size-2 rounded-full', i < m.successCount ? 'bg-emerald-500' : 'bg-surface-3')} />
            ))}
          </div>
          {due && <span className="text-[10px] text-accent">dnes</span>}
        </div>
      </div>
      {open && (
        <div className="mt-3 space-y-3 animate-up" onClick={(e) => e.stopPropagation()}>
          {m.prompt_cz && <div className="text-xs text-muted">🇨🇿 {m.prompt_cz}</div>}
          <div className="flex items-start gap-2">
            <div className="flex-1 text-sm">
              <Label>Rodilá verze</Label>
              <div className="mt-1">{m.native}</div>
            </div>
            <SpeakButton text={m.native} compact />
          </div>
          <Warnings items={m.warnings} />
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted">{new Date(m.createdAt).toLocaleDateString('cs-CZ')} · {m.mode}</span>
            <Btn variant="danger" className="h-8 px-2.5" onClick={() => setState((s) => ({ ...s, mistakes: s.mistakes.filter((x) => x.id !== m.id) }))}>
              <Trash2 className="size-3.5" />
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
