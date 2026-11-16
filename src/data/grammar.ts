// Grammar question bank (original sentences). Used by the Grammar game and the placement test.
// `a` = index of the correct option; `cz` = short Czech explanation shown after answering.

export interface GrammarQ {
  id: string;
  level: 1 | 2 | 3 | 4;
  q: string; // sentence with ___
  options: string[];
  a: number;
  cz: string;
}

type Row = [q: string, options: string[], a: number, cz: string];
const g = (level: GrammarQ['level'], rows: Row[]): GrammarQ[] => rows.map(([q, options, a, cz], i) => ({ id: `g${level}-${i}`, level, q, options, a, cz }));

export const GRAMMAR: GrammarQ[] = [
  ...g(1, [
    ['She ___ in a bank.', ['work', 'works', 'working'], 1, 'He/she/it v přítomném čase: sloveso + -s.'],
    ['I ___ 30 years old.', ['have', 'am', 'is'], 1, 'Věk se říká se slovesem „be“: I am 30.'],
    ['___ you like coffee?', ['Are', 'Do', 'Does'], 1, 'Otázka v přítomném čase: Do you…? (u he/she: Does…?)'],
    ['There ___ two shops in my street.', ['is', 'are', 'be'], 1, 'Množné číslo: there are.'],
    ['My brother ___ a car.', ['has', 'have', 'is'], 0, 'He/she/it: has (ne have).'],
    ['I am ___ teacher.', ['—', 'a', 'the'], 1, 'Povolání má neurčitý člen: a teacher.'],
    ['He ___ like fish.', ["don't", "doesn't", 'not'], 1, 'Zápor u he/she/it: doesn\'t + sloveso.'],
    ['Where ___ the station?', ['is', 'are', 'do'], 0, 'Kde je…? = Where is…?'],
    ['I can ___ English.', ['speak', 'speaks', 'to speak'], 0, 'Po „can“ je holé sloveso bez „to“.'],
    ['This is ___ phone. (můj)', ['me', 'my', 'mine'], 1, 'Přivlastňovací před podstatným jménem: my phone.'],
    ['We ___ hungry.', ['have', 'are', 'is'], 1, 'Mít hlad = be hungry.'],
    ['How much ___ this jacket?', ['is', 'are', 'cost'], 0, 'How much is…? = Kolik stojí…?'],
  ]),
  ...g(2, [
    ['Yesterday I ___ to the cinema.', ['go', 'went', 'have gone'], 1, 'Včera = minulý čas prostý: went.'],
    ['Look! It ___.', ['rains', 'is raining', 'rained'], 1, 'Děje se to teď → průběhový čas.'],
    ['I ___ visit my grandma next weekend.', ['am going to', 'go to', 'will to'], 0, 'Plán = going to.'],
    ['My sister is ___ than me.', ['tall', 'taller', 'more tall'], 1, 'Krátká přídavná jména: -er + than.'],
    ['Did you ___ the film?', ['saw', 'see', 'seen'], 1, 'Po „did“ je základní tvar slovesa.'],
    ['I don\'t have ___ money.', ['some', 'any', 'many'], 1, 'V záporu a otázce: any.'],
    ['How ___ water do you drink?', ['many', 'much', 'lot'], 1, 'Nepočitatelné (water): much.'],
    ['The meeting is ___ Monday.', ['in', 'on', 'at'], 1, 'Dny: on Monday.'],
    ['I ___ get up at six. (vždycky)', ['always', 'am always', 'always am'], 0, 'Příslovce četnosti před slovesem: I always get up.'],
    ['It\'s the ___ day of my life!', ['best', 'better', 'most good'], 0, 'Nejlepší = the best.'],
    ['I\'m tired. I think I ___ go to bed now.', ['will', 'am going', 'going'], 0, 'Rozhodnutí v okamžiku mluvení: will.'],
    ['She ___ TV when I called.', ['watched', 'was watching', 'is watching'], 1, 'Děj probíhal, když přišel jiný: past continuous.'],
  ]),
  ...g(3, [
    ['I ___ in Prague since 2019.', ['live', 'have lived', 'lived'], 1, 'Trvá do teď + since → předpřítomný čas.'],
    ['Have you ever ___ sushi?', ['eat', 'ate', 'eaten'], 2, 'Have + 3. tvar: eaten.'],
    ['If it rains, we ___ at home.', ['stay', 'will stay', 'would stay'], 1, '1. kondicionál: if + přítomný, will.'],
    ['If I ___ rich, I would travel.', ['am', 'were', 'will be'], 1, '2. kondicionál: if + minulý tvar (were).'],
    ['I ___ smoke, but I stopped.', ['used to', 'use to', 'was used to'], 0, 'Dříve (zvykově) = used to.'],
    ['That\'s the man ___ helped me.', ['which', 'who', 'what'], 1, 'Lidé: who.'],
    ['I\'m looking forward to ___ you.', ['see', 'seeing', 'to see'], 1, 'Look forward to + -ing.'],
    ['You ___ wear a seatbelt. It\'s the law.', ['must', 'should', 'might'], 0, 'Povinnost (zákon): must / have to.'],
    ['We\'ve run ___ of milk.', ['out', 'off', 'up'], 0, 'Run out of = dojít (něčeho).'],
    ['I ___ him yesterday.', ['have seen', 'saw', 'see'], 1, 'Konkrétní čas v minulosti (yesterday) → minulý čas.'],
    ['She decided ___ a new job.', ['finding', 'to find', 'find'], 1, 'Decide + to + sloveso.'],
    ['I\'m not used to ___ up so early.', ['get', 'getting', 'got'], 1, 'Be used to + -ing.'],
  ]),
  ...g(4, [
    ['If I had known, I ___ you.', ['would tell', 'would have told', 'told'], 1, '3. kondicionál: would have + 3. tvar.'],
    ['By the time we arrived, the film ___.', ['started', 'had started', 'has started'], 1, 'Dřív než jiný minulý děj: předminulý čas.'],
    ['The bridge ___ in 1890.', ['built', 'was built', 'has built'], 1, 'Trpný rod: was + 3. tvar.'],
    ['He said he ___ tired.', ['is', 'was', 'be'], 1, 'Nepřímá řeč: posun času (is → was).'],
    ['I wish I ___ more time.', ['have', 'had', 'will have'], 1, 'Wish + minulý tvar pro přítomnost.'],
    ['She must ___ forgotten.', ['have', 'had', 'be'], 0, 'Dedukce o minulosti: must have + 3. tvar.'],
    ['___ the rain, we went out.', ['Despite', 'Although', 'Despite of'], 0, 'Despite + podstatné jméno (bez „of“).'],
    ['I\'ve been ___ for two hours.', ['wait', 'waiting', 'waited'], 1, 'Předpřítomný průběhový: have been + -ing.'],
    ['This time tomorrow I ___ on the beach.', ['will lie', 'will be lying', 'lie'], 1, 'Probíhající děj v budoucnu: will be + -ing.'],
    ['I had my car ___ yesterday.', ['repair', 'repaired', 'repairing'], 1, 'Have something done = nechat si něco udělat.'],
    ['You ___ have come. It wasn\'t necessary.', ["didn't need to", "needn't", 'mustn\'t'], 1, 'Zbytečně jsi to udělal: needn\'t have + 3. tvar.'],
    ['It\'s time we ___.', ['go', 'went', 'will go'], 1, 'It\'s time + minulý tvar = už bychom měli.'],
  ]),
];

export function grammarFor(level: number) {
  const lv = Math.min(4, Math.max(1, level));
  return GRAMMAR.filter((x) => x.level === lv || x.level === lv - 1);
}
