import type { Tone } from '../components/icons';

export const DRILL_CONTEXTS = [
  { id: 'everyday', label: 'Everyday Life', cz: 'Běžný život', icon: 'home', tone: 'sky' },
  { id: 'work', label: 'Workplace & Meetings', cz: 'Práce a porady', icon: 'briefcase', tone: 'indigo' },
  { id: 'travel', label: 'Travel & Logistics', cz: 'Cestování', icon: 'plane', tone: 'teal' },
  { id: 'opinions', label: 'Expressing Opinions', cz: 'Názory', icon: 'chat', tone: 'amber' },
] as const;

export type DrillContextId = (typeof DRILL_CONTEXTS)[number]['id'];

export const FLUENCY_CHUNKS: Record<DrillContextId | 'general', { en: string; cz: string }[]> = {
  general: [
    { en: 'To be honest,', cz: 'Upřímně řečeno,' },
    { en: 'The thing is,', cz: 'Jde o to, že' },
    { en: 'It turns out that', cz: 'Ukázalo se, že' },
    { en: 'As far as I know,', cz: 'Pokud vím,' },
    { en: 'I was wondering if', cz: 'Zajímalo by mě, jestli' },
    { en: 'The main reason is that', cz: 'Hlavní důvod je, že' },
    { en: 'On top of that,', cz: 'Navíc' },
    { en: 'Anyway,', cz: 'Každopádně' },
    { en: "That's why", cz: 'Proto' },
    { en: 'In the end,', cz: 'Nakonec' },
  ],
  everyday: [
    { en: 'I ended up', cz: 'Nakonec jsem (udělal)' },
    { en: "I'm thinking of", cz: 'Přemýšlím, že' },
    { en: "I've been meaning to", cz: 'Už dlouho se chystám' },
    { en: 'It took me ages to', cz: 'Trvalo mi věčnost' },
    { en: "I couldn't help", cz: 'Nemohl jsem si pomoct' },
  ],
  work: [
    { en: 'Just to clarify,', cz: 'Jen pro upřesnění,' },
    { en: "I'd suggest that we", cz: 'Navrhoval bych, abychom' },
    { en: 'The problem is that', cz: 'Problém je v tom, že' },
    { en: "We're running behind on", cz: 'Máme zpoždění s' },
    { en: 'Could we go back to', cz: 'Můžeme se vrátit k' },
    { en: 'As I mentioned earlier,', cz: 'Jak jsem zmínil dříve,' },
  ],
  travel: [
    { en: 'Is there any chance', cz: 'Je nějaká šance' },
    { en: "I'm afraid", cz: 'Obávám se, že' },
    { en: 'Would it be possible to', cz: 'Bylo by možné' },
    { en: 'We were supposed to', cz: 'Měli jsme (podle plánu)' },
    { en: 'It looks like', cz: 'Vypadá to, že' },
  ],
  opinions: [
    { en: 'If you ask me,', cz: 'Jestli chceš můj názor,' },
    { en: 'I see your point, but', cz: 'Chápu, kam míříš, ale' },
    { en: "It depends on", cz: 'Záleží na' },
    { en: "I'm not sure that", cz: 'Nejsem si jistý, že' },
    { en: 'The way I see it,', cz: 'Jak to vidím já,' },
    { en: 'Having said that,', cz: 'Na druhou stranu,' },
  ],
};

/** Simpler chunks for levels 1–2. */
export const BASIC_CHUNKS: { en: string; cz: string }[] = [
  { en: 'I think (that)', cz: 'Myslím, že' },
  { en: 'To be honest,', cz: 'Upřímně řečeno,' },
  { en: 'Actually,', cz: 'Vlastně' },
  { en: 'Usually,', cz: 'Obvykle' },
  { en: "I'm not sure (if)", cz: 'Nejsem si jistý, jestli' },
  { en: 'Maybe', cz: 'Možná' },
  { en: "That's why", cz: 'Proto' },
  { en: 'In the end,', cz: 'Nakonec' },
  { en: 'The problem is (that)', cz: 'Problém je, že' },
  { en: 'By the way,', cz: 'Mimochodem' },
  { en: "I'd like to", cz: 'Chtěl bych' },
  { en: "I don't mind", cz: 'Nevadí mi' },
];

export const LADDER_THEMES = [
  'daily routine and transport',
  'work and colleagues',
  'family and friends',
  'shopping and money',
  'health and sport',
  'travel and holidays',
  'home, repairs and neighbours',
  'technology problems',
];

export const MONOLOGUE_PROMPTS = [
  { en: 'Explain to a colleague why a project is delayed.', cz: 'Vysvětli kolegovi, proč má projekt zpoždění.' },
  { en: 'Describe what you did last weekend.', cz: 'Popiš, co jsi dělal minulý víkend.' },
  { en: 'Talk about a trip that went wrong.', cz: 'Vyprávěj o výletě, který se nepovedl.' },
  { en: 'Describe your typical working day.', cz: 'Popiš svůj typický pracovní den.' },
  { en: 'Recommend a film or series and say why.', cz: 'Doporuč film nebo seriál a řekni proč.' },
  { en: 'Explain how to get from your home to the city centre.', cz: 'Vysvětli, jak se dostat od tebe domů do centra.' },
  { en: "Talk about a habit you'd like to change.", cz: 'Mluv o zlozvyku, který bys chtěl změnit.' },
  { en: 'Describe a person who influenced you.', cz: 'Popiš člověka, který tě ovlivnil.' },
  { en: 'Complain politely about a product you bought online.', cz: 'Zdvořile si stěžuj na produkt koupený online.' },
  { en: 'What are your plans for the next few months?', cz: 'Jaké máš plány na příštích pár měsíců?' },
  { en: 'Pros and cons of working from home.', cz: 'Výhody a nevýhody práce z domova.' },
  { en: 'Describe the place where you grew up.', cz: 'Popiš místo, kde jsi vyrůstal.' },
];

export interface Scenario {
  id: string;
  title: string;
  cz: string;
  icon: string;
  tone: Tone;
  aiRole: string;
  userRole: string;
  goal: string;
  goalCz: string;
  opener: string;
  turns: number;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'hotel',
    title: 'Hotel room problem',
    cz: 'Problém s hotelovým pokojem',
    icon: 'bed',
    tone: 'sky',
    aiRole: 'Hotel receptionist',
    userRole: 'Guest',
    goal: 'The air conditioning in your room is broken and it is very noisy outside. Get a different room or a discount.',
    goalCz: 'Klimatizace nefunguje a venku je hluk. Získej jiný pokoj nebo slevu.',
    opener: 'Good evening! Front desk, this is Anna speaking. How can I help you?',
    turns: 5,
  },
  {
    id: 'smalltalk',
    title: 'Small talk before a meeting',
    cz: 'Small talk před poradou',
    icon: 'coffee',
    tone: 'amber',
    aiRole: 'Friendly colleague from the London office (Mark)',
    userRole: 'Colleague from the Prague office',
    goal: 'Chat naturally for a few minutes before a video call starts: weekend, weather, work.',
    goalCz: 'Nezávazně pokecej před začátkem hovoru: víkend, počasí, práce.',
    opener: "Hi! Looks like we're the first ones here. How's everything in Prague?",
    turns: 5,
  },
  {
    id: 'pharmacy',
    title: 'At the pharmacy',
    cz: 'V lékárně',
    icon: 'pill',
    tone: 'rose',
    aiRole: 'Pharmacist',
    userRole: 'Customer on holiday',
    goal: 'Explain that you have had a sore throat and a headache for two days and ask for something that will help.',
    goalCz: 'Vysvětli, že tě dva dny bolí v krku a hlava, a požádej o něco, co pomůže.',
    opener: 'Hello there, what can I do for you today?',
    turns: 5,
  },
  {
    id: 'restaurant',
    title: 'Wrong order at a restaurant',
    cz: 'Špatná objednávka v restauraci',
    icon: 'plate',
    tone: 'orange',
    aiRole: 'Waiter',
    userRole: 'Customer',
    goal: 'You got the wrong dish and you have a nut allergy. Politely sort it out.',
    goalCz: 'Dostal jsi špatné jídlo a máš alergii na ořechy. Zdvořile to vyřeš.',
    opener: "Here you go — enjoy your meal! Is everything alright?",
    turns: 4,
  },
  {
    id: 'interview',
    title: 'Job interview',
    cz: 'Pracovní pohovor',
    icon: 'tie',
    tone: 'indigo',
    aiRole: 'HR manager at an international company',
    userRole: 'Job candidate',
    goal: 'Introduce yourself, talk about your experience and why you want the job.',
    goalCz: 'Představ se, mluv o zkušenostech a proč chceš tu práci.',
    opener: 'Thanks for coming in today. So, to start with, could you tell me a little bit about yourself?',
    turns: 6,
  },
  {
    id: 'train',
    title: 'Missed connection',
    cz: 'Zmeškaný přípoj',
    icon: 'train',
    tone: 'teal',
    aiRole: 'Train station information desk clerk',
    userRole: 'Traveller',
    goal: 'Your train was late and you missed your connection to the airport. Find the fastest alternative and ask about your ticket.',
    goalCz: 'Vlak měl zpoždění a ujel ti přípoj na letiště. Najdi nejrychlejší alternativu a zeptej se na jízdenku.',
    opener: 'Hi, next please! How can I help?',
    turns: 5,
  },
  {
    id: 'landlord',
    title: 'Calling your landlord',
    cz: 'Telefonát pronajímateli',
    icon: 'wrench',
    tone: 'slate',
    aiRole: 'Landlord (Mr. Peters)',
    userRole: 'Tenant',
    goal: 'The washing machine has been leaking since yesterday. Arrange a repair this week.',
    goalCz: 'Pračka od včera teče. Domluv opravu ještě tento týden.',
    opener: 'Hello, Peters speaking.',
    turns: 5,
  },
];
