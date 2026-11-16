// Pronunciation trainer: words Czech speakers often mispronounce. The recogniser must hear exactly the word.
export interface Sound {
  id: string;
  title: string;
  tip: string;
  /** words; "a|b" = minimal pair, both get practised and must not be confused */
  words: string[];
  level: number;
}

export const SOUNDS: Sound[] = [
  {
    id: 'th',
    title: 'TH (think, this)',
    tip: 'Špička jazyka mezi zuby a fouknout. Ne „s“, „f“ ani „t“: three ≠ tree, think ≠ sink.',
    words: ['three|tree', 'think|sink', 'thank you', 'mouth|mouse', 'Thursday', 'birthday', 'with', 'brother', 'weather', 'clothes', 'thought|taught', 'healthy'],
    level: 1,
  },
  {
    id: 'w',
    title: 'W (we, west)',
    tip: 'W není české v: zakulať rty jako na „u“ a hned otevři. wine ≠ vine, west ≠ vest.',
    words: ['west|vest', 'wine|vine', 'window', 'work', 'world', 'water', 'wet|vet', 'weekend', 'always', 'twelve', 'would', 'wonderful'],
    level: 1,
  },
  {
    id: 'i',
    title: 'Krátké i × dlouhé ee',
    tip: 'Krátké „i“ je uvolněné, skoro jako české „y“; dlouhé „ee“ je napjaté a delší. ship ≠ sheep.',
    words: ['ship|sheep', 'live|leave', 'sit|seat', 'fill|feel', 'chip|cheap', 'hit|heat', 'bin|bean', 'still|steal'],
    level: 2,
  },
  {
    id: 'ae',
    title: 'A jako v „cat“ × E jako v „bed“',
    tip: '„æ“ (cat, bad) = otevři pusu víc, mezi a a e. bad ≠ bed, man ≠ men.',
    words: ['bad|bed', 'man|men', 'sad|said', 'pan|pen', 'had|head', 'black', 'happy', 'family', 'apple', 'thanks'],
    level: 2,
  },
  {
    id: 'u',
    title: 'Krátké u × dlouhé oo',
    tip: 'full je krátké a uvolněné, fool dlouhé se špulenými rty.',
    words: ['full|fool', 'pull|pool', 'look|Luke', 'good', 'book', 'food', 'school', 'blue'],
    level: 2,
  },
  {
    id: 'ed',
    title: 'Koncovka -ed',
    tip: '-ed je „t“ po neznělých (worked = workt), „d“ po znělých (played), „id“ jen po t/d (wanted).',
    words: ['worked', 'played', 'wanted', 'liked', 'stopped', 'needed', 'watched', 'decided', 'asked', 'changed'],
    level: 2,
  },
  {
    id: 'silent',
    title: 'Němá písmena',
    tip: 'Některá písmena se nevyslovují: walk (wók), knife (najf), island (ajlend), Wednesday (wenzdej).',
    words: ['walk', 'talk', 'knife', 'know', 'island', 'Wednesday', 'listen', 'half', 'answer', 'write', 'castle', 'foreign'],
    level: 3,
  },
  {
    id: 'schwa',
    title: 'Zkrácené slabiky',
    tip: 'Nečti, jak se to píše: comfortable = KAMF-tə-bl, vegetable = VEDŽ-tə-bl, chocolate = ČOK-lət.',
    words: ['comfortable', 'vegetable', 'chocolate', 'interesting', 'different', 'family', 'restaurant', 'temperature', 'every', 'business'],
    level: 3,
  },
  {
    id: 'stress',
    title: 'Přízvuk není vždy na začátku',
    tip: 'Na rozdíl od češtiny může být přízvuk uprostřed: hoTEL, comPUter, deVELop, phoTOgraphy.',
    words: ['hotel', 'computer', 'develop', 'photography', 'important', 'banana', 'mistake', 'event', 'success', 'idea', 'decide', 'police'],
    level: 3,
  },
  {
    id: 'v-f',
    title: 'Znělost na konci slova',
    tip: 'Na konci slova angličtina rozlišuje: bag ≠ back, have ≠ half, his ≠ hiss. Neztrácej znělost jako v češtině.',
    words: ['bag|back', 'dog|dock', 'have|half', 'prize|price', 'leave|leaf', 'eyes|ice', 'card|cart'],
    level: 4,
  },
  {
    id: 'r',
    title: 'R a L',
    tip: 'Anglické r nevibruje, jazyk se ničeho nedotkne. Na konci slova se v britské angličtině skoro nevyslovuje (car = ká).',
    words: ['red', 'right|light', 'rice|lice', 'very', 'sorry', 'world', 'girl', 'early', 'really', 'tomorrow'],
    level: 4,
  },
];

export function soundsFor(level: number) {
  return SOUNDS.filter((s) => s.level <= Math.max(2, Math.min(level, 4)));
}
