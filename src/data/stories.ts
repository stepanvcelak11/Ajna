// A few original built-in stories so reading also works offline. AI generates new ones on demand.
import type { Story } from '../lib/ai';
import { MORE_STORIES } from './stories2';

const BASE: (Story & { id: string; level: number })[] = [
  {
    id: 'cat',
    level: 1,
    title: 'The Lost Cat',
    title_cz: 'Ztracená kočka',
    sentences: [
      { en: 'My name is Tom and I have a small cat.', cz: 'Jmenuju se Tom a mám malou kočku.' },
      { en: 'Her name is Mia and she is black.', cz: 'Jmenuje se Mia a je černá.' },
      { en: 'Today Mia is not in the kitchen.', cz: 'Dnes Mia není v kuchyni.' },
      { en: 'She is not in my bed and not in the garden.', cz: 'Není v mé posteli ani na zahradě.' },
      { en: 'I am sad and I call my sister.', cz: 'Jsem smutný a volám sestře.' },
      { en: 'My sister laughs: "Mia is in your bag!"', cz: 'Sestra se směje: „Mia je v tvé tašce!“' },
    ],
    questions: [
      { q: 'What colour is Mia?', options: ['white', 'black', 'grey'], a: 1 },
      { q: 'Who does Tom call?', options: ['his mother', 'his friend', 'his sister'], a: 2 },
      { q: 'Where is Mia?', options: ['in the bag', 'in the garden', 'in the bed'], a: 0 },
    ],
    retell_cz: 'Převyprávěj příběh anglicky ve 2–3 krátkých větách.',
    words: [
      { en: 'small', cz: 'malý' },
      { en: 'kitchen', cz: 'kuchyně' },
      { en: 'garden', cz: 'zahrada' },
      { en: 'sad', cz: 'smutný' },
      { en: 'call', cz: 'volat' },
      { en: 'laughs', cz: 'směje se' },
      { en: 'bag', cz: 'taška' },
    ],
  },
  {
    id: 'train',
    level: 2,
    title: 'The Wrong Train',
    title_cz: 'Špatný vlak',
    sentences: [
      { en: 'Last Saturday I wanted to visit my friend in Olomouc.', cz: 'Minulou sobotu jsem chtěl navštívit kamaráda v Olomouci.' },
      { en: 'I got up late, so I ran to the station.', cz: 'Vstal jsem pozdě, tak jsem běžel na nádraží.' },
      { en: 'I saw a train on platform two and jumped in.', cz: 'Uviděl jsem vlak na druhém nástupišti a naskočil jsem.' },
      { en: 'After an hour, the conductor checked my ticket.', cz: 'Po hodině mi průvodčí zkontroloval jízdenku.' },
      { en: 'He smiled and said, "This train is going to Pilsen!"', cz: 'Usmál se a řekl: „Tenhle vlak jede do Plzně!“' },
      { en: 'I called my friend and told him the story.', cz: 'Zavolal jsem kamarádovi a řekl mu, co se stalo.' },
      { en: 'He laughed and drove to Pilsen to meet me.', cz: 'Zasmál se a přijel za mnou autem do Plzně.' },
      { en: 'In the end, we had a great day there.', cz: 'Nakonec jsme tam měli skvělý den.' },
    ],
    questions: [
      { q: 'Why did he run to the station?', options: ['He got up late.', 'He lost his ticket.', 'It was raining.'], a: 0 },
      { q: 'Where was the train going?', options: ['Olomouc', 'Pilsen', 'Brno'], a: 1 },
      { q: 'How did the friend get there?', options: ['by train', 'by bus', 'by car'], a: 2 },
    ],
    retell_cz: 'Převyprávěj příběh anglicky ve 2–3 větách v minulém čase.',
    words: [
      { en: 'visit', cz: 'navštívit' },
      { en: 'got up', cz: 'vstal' },
      { en: 'station', cz: 'nádraží' },
      { en: 'platform', cz: 'nástupiště' },
      { en: 'conductor', cz: 'průvodčí' },
      { en: 'ticket', cz: 'jízdenka' },
      { en: 'in the end', cz: 'nakonec' },
    ],
  },
  {
    id: 'interview',
    level: 3,
    title: 'An Unusual Interview',
    title_cz: 'Neobvyklý pohovor',
    sentences: [
      { en: "I'd been looking for a new job for months when I finally got an interview.", cz: 'Několik měsíců jsem hledal novou práci, když jsem konečně dostal pozvánku na pohovor.' },
      { en: "I'd prepared answers to every question I could think of.", cz: 'Připravil jsem si odpovědi na všechny otázky, které mě napadly.' },
      { en: 'On the way there, I helped an old man who had dropped his shopping.', cz: 'Cestou jsem pomohl starému pánovi, kterému vypadl nákup.' },
      { en: 'Because of that, I arrived five minutes late and completely out of breath.', cz: 'Kvůli tomu jsem přišel o pět minut později a úplně udýchaný.' },
      { en: "I was sure I'd ruined everything.", cz: 'Byl jsem si jistý, že jsem všechno pokazil.' },
      { en: 'When the door opened, I saw the same old man sitting behind the desk.', cz: 'Když se otevřely dveře, uviděl jsem za stolem sedět toho samého starého pána.' },
      { en: 'It turned out that he was the owner of the company.', cz: 'Ukázalo se, že je majitelem firmy.' },
      { en: "He didn't ask me a single question I had prepared.", cz: 'Nepoložil mi ani jednu otázku, kterou jsem si připravil.' },
      { en: 'Instead, he asked why I had stopped to help a stranger.', cz: 'Místo toho se zeptal, proč jsem se zastavil a pomohl cizímu člověku.' },
      { en: 'I started the new job the following Monday.', cz: 'Do nové práce jsem nastoupil hned další pondělí.' },
    ],
    questions: [
      { q: 'Why was he late?', options: ['He missed the bus.', 'He helped an old man.', 'He forgot the address.'], a: 1 },
      { q: 'Who was the old man?', options: ['the owner of the company', 'a receptionist', "his friend's father"], a: 0 },
      { q: 'What happened in the end?', options: ['He failed the interview.', 'He got the job.', 'He went home early.'], a: 1 },
    ],
    retell_cz: 'Převyprávěj příběh anglicky ve 3–5 větách. Zkus použít „it turned out that“.',
    words: [
      { en: 'looking for', cz: 'hledat' },
      { en: 'prepared', cz: 'připravil' },
      { en: 'dropped', cz: 'upustil, vypadl mu' },
      { en: 'out of breath', cz: 'udýchaný' },
      { en: 'ruined', cz: 'pokazil' },
      { en: 'owner', cz: 'majitel' },
      { en: 'stranger', cz: 'cizí člověk' },
      { en: 'instead', cz: 'místo toho' },
    ],
  },
];

export const BUILTIN_STORIES = [...BASE, ...MORE_STORIES].sort((a, b) => a.level - b.level);

export const STORY_TOPICS = [
  { en: 'a funny mistake at a restaurant', cz: 'Vtipný omyl v restauraci', icon: 'plate', tone: 'orange' },
  { en: 'a first day at a new job', cz: 'První den v nové práci', icon: 'briefcase', tone: 'indigo' },
  { en: 'a holiday that went wrong', cz: 'Dovolená, která se nepovedla', icon: 'plane', tone: 'teal' },
  { en: 'a surprise birthday party', cz: 'Překvapivá oslava narozenin', icon: 'sparkle', tone: 'pink' },
  { en: 'a problem with a new neighbour', cz: 'Problém s novým sousedem', icon: 'home', tone: 'amber' },
  { en: 'a lost phone in the city', cz: 'Ztracený mobil ve městě', icon: 'chat', tone: 'sky' },
  { en: 'a strange day at the supermarket', cz: 'Zvláštní den v supermarketu', icon: 'bag', tone: 'emerald' },
  { en: 'learning to cook something new', cz: 'Učím se uvařit něco nového', icon: 'coffee', tone: 'rose' },
] as const;
