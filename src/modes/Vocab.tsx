import { Check, Package, Play, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SpeakButton } from '../components/Speak';
import { Btn, Card, ExampleText, Label, cx } from '../components/ui';
import { STARTER_PACKS } from '../data/starterPacks';
import { navigate } from '../lib/router';
import { formatInterval, isDue, newSrs } from '../lib/srs';
import { setState, uid, useStore } from '../lib/store';
import type { VocabCard } from '../lib/types';
import { toast, setUi } from '../lib/ui';

function addPack(id: string) {
  const pack = STARTER_PACKS.find((p) => p.id === id)!;
  setState((s) => {
    const have = new Set(s.vocab.map((v) => v.en.toLowerCase()));
    const now = new Date().toISOString();
    const cards: VocabCard[] = pack.items
      .filter((it) => !have.has(it.en.toLowerCase()))
      .map((it) => ({ ...it, id: uid(), source: 'starter', pack: pack.title, createdAt: now, srs: newSrs() }));
    return { ...s, vocab: [...s.vocab, ...cards], addedPacks: [...new Set([...s.addedPacks, id])] };
  });
  toast(`Přidáno: ${pack.title}`);
}

export default function Vocab() {
  const vocab = useStore((s) => s.vocab);
  const added = useStore((s) => s.addedPacks);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'due' | 'mine'>('all');
  const due = vocab.filter((v) => isDue(v.srs.dueDate)).length;

  const list = useMemo(() => {
    const t = q.toLowerCase();
    return vocab
      .filter((v) => (filter === 'due' ? isDue(v.srs.dueDate) : filter === 'mine' ? v.source !== 'starter' : true))
      .filter((v) => !t || v.en.toLowerCase().includes(t) || v.cz.toLowerCase().includes(t));
  }, [vocab, q, filter]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Slovíčka</h1>
          <div className="text-xs text-muted">
            {vocab.length} karet · {due} k opakování
          </div>
        </div>
        <Btn variant="primary" disabled={!due} onClick={() => navigate('vocab-review')}>
          <Play className="size-4" /> Opakovat {due > 0 && `(${Math.min(due, 20)})`}
        </Btn>
      </div>

      <div>
        <Label className="mb-2">Startovní balíčky B1/B2</Label>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 snap-x">
          {STARTER_PACKS.map((p) => {
            const has = added.includes(p.id);
            return (
              <div key={p.id} className="snap-start shrink-0 w-44 rounded-2xl border border-line bg-surface p-3">
                <Package className="size-4 text-accent" />
                <div className="mt-2 text-sm font-medium leading-tight">{p.title}</div>
                <div className="text-[11px] text-muted">
                  {p.cz} · {p.items.length}
                </div>
                <Btn variant={has ? 'ghost' : 'secondary'} className="mt-2 h-8 w-full text-xs" disabled={has} onClick={() => addPack(p.id)}>
                  {has ? (
                    <>
                      <Check className="size-3.5" /> Přidáno
                    </>
                  ) : (
                    'Přidat'
                  )}
                </Btn>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hledat…"
              className="w-full h-10 rounded-xl border border-line bg-surface-2 pl-9 pr-3 text-[16px] outline-none focus:border-accent/60"
            />
          </div>
          <Btn variant="secondary" className="h-10 px-3" onClick={() => setUi({ rescueOpen: true })}>
            + Přidat
          </Btn>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'due', 'mine'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cx(
                'rounded-full px-3 py-1 text-xs border',
                filter === f ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted',
              )}
            >
              {f === 'all' ? 'Vše' : f === 'due' ? 'K opakování' : 'Moje uložená'}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="text-center text-sm text-muted py-8">
          {vocab.length ? 'Nic nenalezeno.' : 'Zatím žádná slovíčka. Přidej balíček výše nebo použij „Nevím slovo“.'}
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((v) => (
            <VocabRow key={v.id} v={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function VocabRow({ v }: { v: VocabCard }) {
  const [open, setOpen] = useState(false);
  const due = isDue(v.srs.dueDate);
  return (
    <Card className="py-3" onClick={() => setOpen((o) => !o)}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{v.en}</span>
            {due && <span className="size-1.5 rounded-full bg-accent shrink-0" />}
          </div>
          <div className="text-xs text-muted truncate">{v.cz}</div>
        </div>
        <span className="text-[10px] text-muted tabular-nums">
          {v.srs.level === 0 && !v.srs.lastReviewed ? 'nové' : `${formatInterval(v.srs.interval)}`}
        </span>
        <SpeakButton text={v.en} compact />
      </div>
      {open && (
        <div className="mt-3 space-y-2 text-sm animate-up" onClick={(e) => e.stopPropagation()}>
          <div className="text-xs text-muted">{v.pos}</div>
          <ExampleText text={v.example} />
          {v.collocation && <div className="text-xs text-muted">{v.collocation}</div>}
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-muted">
              Další opakování: {new Date(v.srs.dueDate).toLocaleDateString('cs-CZ')} · ease {v.srs.easeFactor.toFixed(2)}
            </span>
            <Btn
              variant="danger"
              className="h-8 px-2.5"
              onClick={() => setState((s) => ({ ...s, vocab: s.vocab.filter((x) => x.id !== v.id) }))}
            >
              <Trash2 className="size-3.5" />
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
