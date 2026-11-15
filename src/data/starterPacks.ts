// Curated B1/B2 starter packs. In `example`, the target form is wrapped in {braces} → becomes the gap.
export interface StarterItem {
  en: string;
  cz: string;
  pos: string;
  example: string;
  collocation?: string;
}
export interface StarterPack {
  id: string;
  title: string;
  cz: string;
  items: StarterItem[];
}

export const STARTER_PACKS: StarterPack[] = [
  {
    id: 'phrasal',
    title: 'Essential phrasal verbs',
    cz: 'Základní frázová slovesa',
    items: [
      { en: 'pick up', cz: 'vyzvednout (někoho/něco)', pos: 'phrasal verb', example: 'Can you {pick up} the kids from school today?', collocation: 'pick sb/sth up from + place' },
      { en: 'turn out', cz: 'ukázat se (že)', pos: 'phrasal verb', example: 'It {turned out} that the shop was closed.', collocation: 'it turns out (that)…' },
      { en: 'figure out', cz: 'přijít na to, vyřešit', pos: 'phrasal verb', example: "I can't {figure out} how this app works.", collocation: 'figure out how/why/what…' },
      { en: 'put off', cz: 'odložit', pos: 'phrasal verb', example: "Stop {putting off} the dentist — just book it.", collocation: 'put off + -ing' },
      { en: 'run out of', cz: 'dojít (něco někomu)', pos: 'phrasal verb', example: "We've {run out of} milk again.", collocation: 'run out of + noun' },
      { en: 'look forward to', cz: 'těšit se na', pos: 'phrasal verb', example: "I'm really {looking forward to} seeing you.", collocation: 'look forward to + -ing' },
      { en: 'get along with', cz: 'vycházet s (někým)', pos: 'phrasal verb', example: 'Do you {get along with} your new boss?', collocation: 'get along (well) with sb' },
      { en: 'come up with', cz: 'vymyslet, přijít s', pos: 'phrasal verb', example: 'She {came up with} a great idea for the trip.', collocation: 'come up with an idea/solution' },
      { en: 'give up', cz: 'vzdát (se), přestat', pos: 'phrasal verb', example: 'He {gave up} smoking last year.', collocation: 'give up + -ing' },
      { en: 'set up', cz: 'založit, nastavit, zařídit', pos: 'phrasal verb', example: "Let's {set up} a meeting for Thursday.", collocation: 'set up a meeting/account' },
      { en: 'deal with', cz: 'vypořádat se s, řešit', pos: 'phrasal verb', example: "I'll {deal with} the client's complaint.", collocation: 'deal with a problem/complaint' },
      { en: 'catch up', cz: 'dohnat; probrat novinky', pos: 'phrasal verb', example: "Let's grab a coffee and {catch up}.", collocation: 'catch up with sb / on sth' },
      { en: 'end up', cz: 'skončit (nakonec)', pos: 'phrasal verb', example: 'We {ended up} staying at home.', collocation: 'end up + -ing' },
      { en: 'find out', cz: 'zjistit', pos: 'phrasal verb', example: "I'll {find out} what time the train leaves.", collocation: 'find out what/when/if…' },
      { en: 'show up', cz: 'objevit se, dorazit', pos: 'phrasal verb', example: 'Only five people {showed up} to the meeting.', collocation: 'show up late / on time' },
    ],
  },
  {
    id: 'verbs',
    title: 'Everyday verbs & patterns',
    cz: 'Každodenní slovesa a vazby',
    items: [
      { en: 'depend on', cz: 'záviset na, záležet na', pos: 'verb + prep', example: 'It {depends on} the weather.', collocation: 'depend on sth (NOT "depend from")' },
      { en: 'manage to', cz: 'podařit se, zvládnout', pos: 'verb', example: 'I finally {managed to} fix the bike.', collocation: 'manage to + infinitive' },
      { en: 'afford', cz: 'dovolit si (finančně)', pos: 'verb', example: "We can't {afford} a new car right now.", collocation: "can't afford (to do) sth" },
      { en: 'get used to', cz: 'zvyknout si na', pos: 'expression', example: "I'm slowly {getting used to} the cold.", collocation: 'get used to + noun/-ing' },
      { en: 'borrow', cz: 'půjčit si (od někoho)', pos: 'verb', example: 'Can I {borrow} your charger?', collocation: 'borrow sth from sb' },
      { en: 'lend', cz: 'půjčit (někomu)', pos: 'verb', example: 'Could you {lend} me ten euros?', collocation: 'lend sb sth' },
      { en: 'remind', cz: 'připomenout', pos: 'verb', example: 'Can you {remind} me to call Tom?', collocation: 'remind sb to do / about sth' },
      { en: 'suggest', cz: 'navrhnout', pos: 'verb', example: 'I {suggest} we leave a bit earlier.', collocation: 'suggest (that) we… / suggest + -ing' },
      { en: 'complain about', cz: 'stěžovat si na', pos: 'verb + prep', example: 'Guests {complained about} the noise.', collocation: 'complain to sb about sth' },
      { en: 'apologise for', cz: 'omluvit se za', pos: 'verb + prep', example: 'I {apologise for} the delay.', collocation: 'apologise to sb for + -ing' },
      { en: 'be supposed to', cz: 'mít (podle plánu/pravidel)', pos: 'expression', example: 'We {were supposed to} land at six.', collocation: 'be supposed to + infinitive' },
      { en: 'look like', cz: 'vypadat jako / že', pos: 'verb + prep', example: 'It {looks like} it’s going to rain.', collocation: 'look like + noun/clause; look + adjective' },
      { en: 'take care of', cz: 'postarat se o', pos: 'expression', example: "Don't worry, I'll {take care of} it.", collocation: 'take care of sb/sth' },
      { en: 'make sure', cz: 'ujistit se, zajistit', pos: 'expression', example: '{Make sure} you lock the door.', collocation: 'make sure (that) …' },
      { en: 'used to', cz: 'dříve (zvykově) dělat', pos: 'modal-like', example: 'I {used to} play football every weekend.', collocation: 'used to + infinitive' },
    ],
  },
  {
    id: 'work',
    title: 'Workplace collocations',
    cz: 'Pracovní kolokace',
    items: [
      { en: 'meet a deadline', cz: 'stihnout termín', pos: 'collocation', example: "We worked all night to {meet the deadline}.", collocation: 'meet / miss a deadline' },
      { en: 'run late', cz: 'mít zpoždění', pos: 'expression', example: "Sorry, I'm {running late} — start without me.", collocation: 'be running late (for sth)' },
      { en: 'follow up', cz: 'navázat, ozvat se znovu', pos: 'phrasal verb', example: "I'll {follow up} with an email after the call.", collocation: 'follow up on sth / with sb' },
      { en: 'take responsibility for', cz: 'převzít zodpovědnost za', pos: 'collocation', example: 'She {took responsibility for} the mistake.', collocation: 'take (full) responsibility for' },
      { en: 'reschedule', cz: 'přeplánovat, přesunout', pos: 'verb', example: 'Can we {reschedule} the call to Friday?', collocation: 'reschedule sth for/to + time' },
      { en: 'be in charge of', cz: 'mít na starost', pos: 'expression', example: "Who's {in charge of} the budget?", collocation: 'be in charge of sth/sb' },
      { en: 'make progress', cz: 'pokročit, dělat pokroky', pos: 'collocation', example: "We've {made} good {progress} this week.", collocation: 'make progress (NOT "do progress")' },
      { en: 'make a decision', cz: 'rozhodnout se', pos: 'collocation', example: 'We need to {make a decision} today.', collocation: 'make (NOT do) a decision' },
      { en: 'get back to', cz: 'ozvat se (zpět)', pos: 'phrasal verb', example: "I'll {get back to} you by Monday.", collocation: 'get back to sb (on sth)' },
      { en: 'point out', cz: 'upozornit, poukázat', pos: 'phrasal verb', example: 'He {pointed out} a mistake in the report.', collocation: 'point out (that)…' },
      { en: 'on schedule', cz: 'podle plánu, včas', pos: 'expression', example: 'The project is still {on schedule}.', collocation: 'on / behind / ahead of schedule' },
      { en: 'bring up', cz: 'nadhodit (téma)', pos: 'phrasal verb', example: "I'd like to {bring up} the issue of overtime.", collocation: 'bring up a topic/issue' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel & logistics',
    cz: 'Cestování a logistika',
    items: [
      { en: 'check in', cz: 'ubytovat se, odbavit se', pos: 'phrasal verb', example: 'What time can we {check in}?', collocation: 'check in at a hotel / for a flight' },
      { en: 'miss a connection', cz: 'ujet přípoj', pos: 'collocation', example: 'Our first train was late, so we {missed our connection}.', collocation: 'miss / make a connection' },
      { en: 'book in advance', cz: 'rezervovat předem', pos: 'collocation', example: "It's cheaper if you {book in advance}.", collocation: 'book sth in advance' },
      { en: 'get on', cz: 'nastoupit (do autobusu/vlaku)', pos: 'phrasal verb', example: 'We {got on} the wrong bus.', collocation: 'get on/off a bus, train, plane' },
      { en: 'refund', cz: 'vrácení peněz; vrátit peníze', pos: 'noun/verb', example: 'Can I get a {refund} for this ticket?', collocation: 'get / ask for a full refund' },
      { en: 'delayed', cz: 'zpožděný', pos: 'adjective', example: 'Our flight is {delayed} by two hours.', collocation: 'delayed by + time' },
      { en: 'luggage', cz: 'zavazadla', pos: 'uncountable noun', example: 'How much {luggage} can I take?', collocation: 'a piece of luggage (NOT "luggages")' },
      { en: 'on the way', cz: 'cestou, po cestě', pos: 'expression', example: "Let's stop for coffee {on the way}.", collocation: 'on the way to/home' },
      { en: 'find my way', cz: 'najít cestu, zorientovat se', pos: 'expression', example: "I couldn't {find my way} back to the hotel.", collocation: 'find your way (to/around)' },
      { en: 'take off', cz: 'vzlétnout', pos: 'phrasal verb', example: 'The plane {took off} an hour late.', collocation: 'take off / land' },
      { en: 'travel light', cz: 'cestovat nalehko', pos: 'expression', example: 'I always {travel light} — just a backpack.', collocation: 'travel light' },
    ],
  },
];
