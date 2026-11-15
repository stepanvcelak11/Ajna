import { Check, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { lookupWord, type Lookup } from '../lib/ai';
import { addVocab, hasVocab, useStore } from '../lib/store';
import { toast } from '../lib/ui';
import { SpeakButton } from './Speak';
import { Btn, ErrorBox, ExampleText, Label, Sheet, Spinner } from './ui';
import { LangBadge } from './icons';

/** Sentence where every word is tappable → Czech translation / collocation / save to vocab. */
export function ClickableText({ text, className }: { text: string; className?: string }) {
  const [sel, setSel] = useState<string | null>(null);
  const tokens = text.split(/(\s+)/);
  return (
    <>
      <span className={className}>
        {tokens.map((t, i) => {
          if (/^\s+$/.test(t)) return t;
          const m = t.match(/^([^A-Za-z']*)([A-Za-z'’-]+)([^A-Za-z']*)$/);
          if (!m) return <span key={i}>{t}</span>;
          return (
            <span key={i} className="whitespace-nowrap">
              {m[1]}
              <button
                onClick={() => setSel(m[2])}
                className="rounded px-[1px] -mx-[1px] underline decoration-dotted decoration-muted/40 underline-offset-4 hover:bg-accent/15 hover:text-accent active:bg-accent/25"
              >
                {m[2]}
              </button>
              {m[3]}
            </span>
          );
        })}
      </span>
      <WordSheet word={sel} sentence={text} onClose={() => setSel(null)} />
    </>
  );
}

function WordSheet({ word, sentence, onClose }: { word: string | null; sentence: string; onClose: () => void }) {
  const [data, setData] = useState<Lookup | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useStore((s) => s.vocab.length); // re-render when saved

  const load = () => {
    if (!word) return;
    setData(null);
    setErr(null);
    lookupWord(word, sentence)
      .then(setData)
      .catch((e) => setErr(String(e.message ?? e)));
  };
  useEffect(load, [word, sentence]); // eslint-disable-line react-hooks/exhaustive-deps

  const saved = data ? hasVocab(data.lemma) : false;
  return (
    <Sheet open={!!word} onClose={onClose} title={word ?? ''}>
      {!data && !err && <Spinner label="Hledám překlad…" />}
      {err && <ErrorBox error={err} onRetry={load} />}
      {data && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold">{data.lemma}</div>
              <div className="text-xs text-muted">{data.pos}</div>
            </div>
            <SpeakButton text={data.lemma} />
          </div>
          <div className="text-lg flex items-center gap-2"><LangBadge code="CZ" /> {data.cz}</div>
          {data.collocation && (
            <div>
              <Label>Kolokace</Label>
              <div className="mt-1 text-sm">{data.collocation}</div>
            </div>
          )}
          {data.example && (
            <div className="flex items-start gap-2">
              <ExampleText text={data.example} className="text-sm flex-1" />
              <SpeakButton text={data.example} compact />
            </div>
          )}
          <Btn
            variant={saved ? 'secondary' : 'primary'}
            className="w-full"
            disabled={saved}
            onClick={() => {
              const ex = data.example.includes('{') ? data.example : `${data.example}`;
              if (addVocab({ en: data.lemma, cz: data.cz, pos: data.pos, example: ex, collocation: data.collocation, source: 'click' }))
                toast('Uloženo do slovíček');
            }}
          >
            {saved ? <Check className="size-4" /> : <Plus className="size-4" />}
            {saved ? 'Už ve slovíčkách' : 'Uložit do slovíček'}
          </Btn>
        </div>
      )}
    </Sheet>
  );
}
