// Course map for the learner's school textbook: VYA008 Intermediate English 1 (FCE BUT, 2026),
// a selection from English File Intermediate (5th ed.). Only the syllabus (lesson topics, grammar
// points and key vocabulary) is used here; all explanations and example sentences are original.

import type { GrammarTopic } from './levels';
import type { StarterItem } from './starterPacks';

export interface LessonTopic extends GrammarTopic {
  /** short Czech rule summary shown in the lesson */
  rules: string[];
  /** original example sentences */
  examples: string[];
}

export interface Lesson {
  n: number;
  title: string; // English topic
  cz: string;
  emoji: string;
  vocabTopic: string; // used in prompts
  grammarTitle: string;
  topics: LessonTopic[];
  traps: string[]; // typical Czech mistakes for this grammar (Czech)
  vocab: StarterItem[];
  speaking: { en: string; cz: string }[];
  roleplay: { title: string; cz: string; aiRole: string; userRole: string; goal: string; goalCz: string; opener: string };
}

export const COURSE = {
  code: 'VYA008',
  title: 'Intermediate English 1',
  note: 'Osnova podle tvé učebnice (English File Intermediate). Vysvětlení a příklady jsou vlastní.',
};

export const LESSONS: Lesson[] = [
  {
    n: 1,
    title: 'Food',
    cz: 'Jídlo a vaření',
    emoji: '🍝',
    vocabTopic: 'food, cooking, restaurants and eating habits',
    grammarTitle: 'Present simple & continuous; action vs non-action verbs',
    topics: [
      {
        id: 'u1-pres',
        en: 'present simple (habits, facts) vs present continuous (now, temporary, changing situations)',
        cz: 'Present simple vs. continuous',
        rules: [
          'Present simple: zvyky, fakta, rutina – usually, often, every day.',
          'Present continuous: děje právě teď nebo dočasně – now, at the moment, these days.',
          'Otázky a zápory v present simple s do/does: Do you cook? She doesn’t eat meat.',
        ],
        examples: ['I usually cook at home, but this week I’m eating out a lot.', 'What are you making? It smells amazing!'],
      },
      {
        id: 'u1-state',
        en: 'non-action (state) verbs not used in continuous: like, love, know, want, need, believe, seem, taste, smell, own',
        cz: 'Stavová slovesa (know, like, need…)',
        rules: [
          'Stavová slovesa (know, like, want, need, believe, seem, belong) nemají průběhový tvar.',
          'Smysly (taste, smell, look, sound) jako stav: This soup tastes great. (ne „is tasting“)',
          'Have = mít (vlastnit) je stav, have lunch = činnost: I’m having lunch.',
        ],
        examples: ['I don’t know what to cook tonight.', 'This sauce tastes a bit too spicy.'],
      },
    ],
    traps: ['„I am liking it“ → I like it', '„Do you want?“ bez předmětu → Do you want some?', 'Zapomenuté -s: she cook → she cooks'],
    vocab: [
      { en: 'takeaway', cz: 'jídlo s sebou', pos: 'noun', example: 'Shall we just get a {takeaway} tonight?', collocation: 'order / get a takeaway' },
      { en: 'ready meal', cz: 'hotové jídlo', pos: 'noun', example: 'I only eat {ready meals} when I’m really busy.' },
      { en: 'spicy', cz: 'pálivý, kořeněný', pos: 'adjective', example: 'Is this curry very {spicy}?' },
      { en: 'cut down on', cz: 'omezit (něco)', pos: 'phrasal verb', example: 'I’m trying to {cut down on} sugar.', collocation: 'cut down on + noun' },
      { en: 'be allergic to', cz: 'mít alergii na', pos: 'expression', example: 'My sister {is allergic to} nuts.', collocation: 'allergic to (NOT on)' },
      { en: 'aubergine', cz: 'lilek', pos: 'noun', example: 'We grilled some {aubergine} with garlic.' },
      { en: 'squid', cz: 'kalamáry, oliheň', pos: 'noun', example: 'I ordered fried {squid} as a starter.' },
      { en: 'lobster', cz: 'humr', pos: 'noun', example: '{Lobster} is far too expensive for me.' },
      { en: 'roast', cz: 'pečený (v troubě)', pos: 'adjective', example: 'We always have {roast} chicken on Sundays.' },
      { en: 'boiled', cz: 'vařený (ve vodě)', pos: 'adjective', example: 'I had two {boiled} eggs for breakfast.' },
      { en: 'dish', cz: 'jídlo, chod', pos: 'noun', example: 'What’s your favourite {dish} on the menu?' },
      { en: 'cheer up', cz: 'rozveselit (se)', pos: 'phrasal verb', example: 'Chocolate always {cheers} me {up}.' },
      { en: 'the bill', cz: 'účet (v restauraci)', pos: 'noun', example: 'Could we have {the bill}, please?', collocation: 'ask for / pay the bill' },
      { en: 'eat out', cz: 'jíst venku (v restauraci)', pos: 'phrasal verb', example: 'We {eat out} about once a week.' },
    ],
    speaking: [
      { en: 'Describe your eating habits on a typical day and how they are changing at the moment.', cz: 'Popiš své stravovací návyky a co se teď mění.' },
      { en: 'Talk about your favourite restaurant and why you like it.', cz: 'Mluv o své oblíbené restauraci.' },
    ],
    roleplay: {
      title: 'Ordering in a restaurant',
      cz: 'Objednávka v restauraci',
      aiRole: 'Waiter in a busy restaurant',
      userRole: 'Customer',
      goal: 'Ask about a dish, mention a food allergy, order a meal and ask for the bill.',
      goalCz: 'Zeptej se na jídlo, zmiň alergii, objednej si a požádej o účet.',
      opener: 'Good evening! Are you ready to order, or do you need a few more minutes?',
    },
  },
  {
    n: 2,
    title: 'Family',
    cz: 'Rodina a povaha',
    emoji: '👨‍👩‍👧',
    vocabTopic: 'family, relatives, relationships and personality adjectives',
    grammarTitle: 'Future forms: going to, present continuous, will, shall',
    topics: [
      {
        id: 'u2-future',
        en: 'future forms: going to (plans, predictions from evidence), present continuous (fixed arrangements), will/won’t (instant decisions, promises, offers, predictions), shall I/we (offers, suggestions)',
        cz: 'Budoucí tvary (going to / will / -ing)',
        rules: [
          'Going to: plán nebo úmysl (I’m going to study law) a předpověď z toho, co vidím (It’s going to rain).',
          'Present continuous: domluvená schůzka/termín (I’m meeting Tom on Friday).',
          'Will: rozhodnutí teď (I’ll have the fish), slib (I won’t tell anyone), nabídka, názor na budoucnost (I think…).',
          'Shall I/we…? = nabídka nebo návrh (Shall I help you?).',
        ],
        examples: ['We’re visiting my grandparents on Sunday.', 'Don’t worry, I’ll lend you some money.', 'Shall we invite your parents for lunch?'],
      },
    ],
    traps: ['„I will go to cinema tonight“ (domluveno) → I’m going to the cinema tonight', '„Will I help you?“ → Shall I help you?', 'Česká přítomnost pro budoucnost: „I call you tomorrow“ → I’ll call you'],
    vocab: [
      { en: 'relative', cz: 'příbuzný', pos: 'noun', example: 'Most of my {relatives} live in Moravia.' },
      { en: 'get married', cz: 'vzít se', pos: 'expression', example: 'They’re going to {get married} next summer.', collocation: 'get married to sb (NOT with)' },
      { en: 'single parent', cz: 'samoživitel/ka', pos: 'noun', example: 'She’s been a {single parent} for five years.' },
      { en: 'household', cz: 'domácnost', pos: 'noun', example: 'Three generations live in the same {household}.' },
      { en: 'get on with', cz: 'vycházet s', pos: 'phrasal verb', example: 'I {get on} really well {with} my brother.' },
      { en: 'reliable', cz: 'spolehlivý', pos: 'adjective', example: 'You can trust her – she’s very {reliable}.' },
      { en: 'sensible', cz: 'rozumný', pos: 'adjective', example: 'That’s a very {sensible} decision.', collocation: 'false friend: sensitive = citlivý' },
      { en: 'sensitive', cz: 'citlivý', pos: 'adjective', example: 'Be careful what you say – he’s quite {sensitive}.' },
      { en: 'ambitious', cz: 'ctižádostivý', pos: 'adjective', example: 'My sister is very {ambitious} – she wants to run her own company.' },
      { en: 'generous', cz: 'štědrý', pos: 'adjective', example: 'It was very {generous} of you to pay for dinner.' },
      { en: 'talkative', cz: 'upovídaný', pos: 'adjective', example: 'My grandma is really {talkative}.' },
      { en: 'immature', cz: 'nezralý (dětinský)', pos: 'adjective', example: 'He’s 25, but he’s still quite {immature}.' },
      { en: 'competitive', cz: 'soutěživý', pos: 'adjective', example: 'Don’t play cards with him – he’s too {competitive}.' },
      { en: 'stay in touch', cz: 'zůstat v kontaktu', pos: 'expression', example: 'Let’s {stay in touch} after you move.' },
    ],
    speaking: [
      { en: 'What are your plans for this weekend and for the next few months?', cz: 'Jaké máš plány na víkend a na další měsíce?' },
      { en: 'Describe a member of your family and their personality.', cz: 'Popiš člena rodiny a jeho povahu.' },
    ],
    roleplay: {
      title: 'Planning a family celebration',
      cz: 'Plánování rodinné oslavy',
      aiRole: 'Your cousin Jamie',
      userRole: 'Cousin',
      goal: 'Plan a surprise birthday party for your grandmother: date, place, who brings what. Make offers and promises.',
      goalCz: 'Naplánuj oslavu narozenin babičky: kdy, kde, kdo co přinese. Nabízej a slibuj.',
      opener: 'Hey! So, Grandma’s 80th is coming up. Have you got any ideas for the party?',
    },
  },
  {
    n: 3,
    title: 'Money',
    cz: 'Peníze',
    emoji: '💰',
    vocabTopic: 'money, shopping, banks, saving and borrowing',
    grammarTitle: 'Present perfect & past simple; for/since; present perfect continuous',
    topics: [
      {
        id: 'u3-pp-past',
        en: 'present perfect (ever/never, just, already, yet, news without time) vs past simple (finished time: yesterday, last week, ago)',
        cz: 'Present perfect vs. past simple',
        rules: [
          'Present perfect: zkušenost bez času (Have you ever…?), novinka (I’ve just lost my wallet), already/yet.',
          'Past simple: když je řečeno nebo jasné KDY (yesterday, last month, two days ago, When…?).',
          'Nikdy „When have you…?“ → When did you…?',
        ],
        examples: ['Have you ever lent money to a friend?', 'I lent Tom €50 last month, but he hasn’t paid me back yet.'],
      },
      {
        id: 'u3-for-since',
        en: 'present perfect simple and continuous with for/since for unfinished periods (How long have you…?)',
        cz: 'For / since, předpřítomný průběhový',
        rules: [
          'Trvá do teď = present perfect (ne přítomný čas!): I’ve lived here since 2020.',
          'For + doba (for three years), since + začátek (since Monday, since I was a kid).',
          'Průběhový tvar zdůrazňuje činnost: I’ve been saving for a new car for months.',
        ],
        examples: ['How long have you been learning English?', 'I’ve known her since we were at school.'],
      },
    ],
    traps: ['„I am here since Monday“ → I’ve been here since Monday', '„I have bought it yesterday“ → I bought it yesterday', '„since three years“ → for three years'],
    vocab: [
      { en: 'afford', cz: 'dovolit si (finančně)', pos: 'verb', example: 'I can’t {afford} a new phone right now.' },
      { en: 'borrow', cz: 'půjčit si', pos: 'verb', example: 'Can I {borrow} €10 until Friday?', collocation: 'borrow sth from sb' },
      { en: 'lend', cz: 'půjčit (někomu)', pos: 'verb', example: 'My brother {lent} me his car.', collocation: 'lend sb sth' },
      { en: 'pay back', cz: 'splatit, vrátit peníze', pos: 'phrasal verb', example: 'I’ll {pay} you {back} next week.' },
      { en: 'take out', cz: 'vybrat (peníze); vzít si (půjčku)', pos: 'phrasal verb', example: 'I need to {take out} some cash.', collocation: 'take out money / a loan' },
      { en: 'live on', cz: 'vyžít z (částky)', pos: 'phrasal verb', example: 'Could you {live on} €500 a month?' },
      { en: 'live off', cz: 'žít z (někoho/něčeho)', pos: 'phrasal verb', example: 'He still {lives off} his parents.' },
      { en: 'loan', cz: 'půjčka, úvěr', pos: 'noun', example: 'They took out a {loan} to buy a car.' },
      { en: 'mortgage', cz: 'hypotéka', pos: 'noun', example: 'The bank agreed to give us a {mortgage}.' },
      { en: 'bargain', cz: 'výhodná koupě', pos: 'noun', example: 'This jacket was a real {bargain}.' },
      { en: 'inherit', cz: 'zdědit', pos: 'verb', example: 'She {inherited} a house from her aunt.' },
      { en: 'waste money on', cz: 'vyhazovat peníze za', pos: 'expression', example: 'Don’t {waste money on} things you don’t need.' },
      { en: 'cash machine', cz: 'bankomat', pos: 'noun', example: 'Is there a {cash machine} near here?' },
      { en: 'be charged', cz: 'být naúčtován', pos: 'expression', example: 'I think we’ve {been charged} too much.' },
    ],
    speaking: [
      { en: 'Talk about something you have saved for and how long it took.', cz: 'Mluv o něčem, na co jsi šetřil a jak dlouho.' },
      { en: 'Have you ever wasted money on something? Tell the story.', cz: 'Vyhodil jsi někdy peníze za něco zbytečného?' },
    ],
    roleplay: {
      title: 'At the bank',
      cz: 'V bance',
      aiRole: 'Bank clerk',
      userRole: 'Customer',
      goal: 'You have lost your debit card. Explain when and where, ask what to do and ask about a small loan.',
      goalCz: 'Ztratil jsi platební kartu. Vysvětli kdy a kde, zeptej se, co dělat, a na malou půjčku.',
      opener: 'Good morning, how can I help you today?',
    },
  },
  {
    n: 4,
    title: 'Transport',
    cz: 'Doprava',
    emoji: '🚗',
    vocabTopic: 'transport, traffic, driving and getting around a city',
    grammarTitle: 'Modal verbs: ability, obligation, advice, deduction',
    topics: [
      {
        id: 'u4-ability',
        en: 'can / could / be able to for ability and possibility (incl. will be able to, have been able to)',
        cz: 'Can / could / be able to',
        rules: [
          'Can = umím/můžu teď; could = uměl jsem (obecně v minulosti).',
          'Kde can nejde (budoucnost, předpřítomný čas, po jiném slovese), použij be able to: I’ll be able to…, I haven’t been able to…',
          'Po modálním slovese infinitiv bez „to“: You should go (ne „should to go“).',
        ],
        examples: ['I haven’t been able to fix my bike yet.', 'Will you be able to pick me up?'],
      },
      {
        id: 'u4-obligation',
        en: 'must / have to / don’t have to / mustn’t / should / ought to (obligation, prohibition, no necessity, advice)',
        cz: 'Must / have to / mustn’t / don’t have to',
        rules: [
          'Mustn’t = nesmíš (zákaz). Don’t have to = nemusíš (není nutné). Pozor, česky to zní podobně!',
          'Have to = vnější povinnost (pravidla), must = osobní nutnost; v minulosti jen had to.',
          'Should / ought to = rada.',
        ],
        examples: ['You mustn’t use your phone while driving.', 'You don’t have to come by car – there’s a bus.'],
      },
      {
        id: 'u4-deduction',
        en: 'modals of deduction: must (sure it is true), might / may / could (possible), can’t (sure it is not true)',
        cz: 'Dedukce: must / might / can’t',
        rules: [
          'must be = určitě je (jsem si jistý), can’t be = určitě není, might/may/could be = možná je.',
          'Nepoužívej „mustn’t be“ pro dedukci – správně can’t be.',
        ],
        examples: ['The lights are off – they can’t be at home.', 'He might be stuck in a traffic jam.'],
      },
    ],
    traps: ['„You don’t have to smoke here“ (zákaz) → You mustn’t smoke here', '„I will can“ → I’ll be able to', '„He mustn’t be at home“ (dedukce) → He can’t be at home'],
    vocab: [
      { en: 'traffic jam', cz: 'dopravní zácpa', pos: 'noun', example: 'We were stuck in a {traffic jam} for an hour.' },
      { en: 'rush hour', cz: 'dopravní špička', pos: 'noun', example: 'The trams are always full during the {rush hour}.' },
      { en: 'seat belt', cz: 'bezpečnostní pás', pos: 'noun', example: 'Please fasten your {seat belt}.', collocation: 'fasten / wear a seat belt' },
      { en: 'speed camera', cz: 'radar (měření rychlosti)', pos: 'noun', example: 'There’s a {speed camera} at the end of this street.' },
      { en: 'speed limit', cz: 'rychlostní limit', pos: 'noun', example: 'The {speed limit} here is 50 km/h.' },
      { en: 'zebra crossing', cz: 'přechod pro chodce', pos: 'noun', example: 'Always cross the road at the {zebra crossing}.' },
      { en: 'cycle lane', cz: 'cyklopruh', pos: 'noun', example: 'There aren’t enough {cycle lanes} in our city.' },
      { en: 'roadworks', cz: 'práce na silnici', pos: 'noun', example: 'There are {roadworks} on the motorway again.' },
      { en: 'parking fine', cz: 'pokuta za parkování', pos: 'noun', example: 'I got a {parking fine} yesterday.', collocation: 'get / pay a parking fine' },
      { en: 'taxi rank', cz: 'stanoviště taxi', pos: 'noun', example: 'The {taxi rank} is just outside the station.' },
      { en: 'traffic lights', cz: 'semafor', pos: 'noun', example: 'Turn left at the {traffic lights}.' },
      { en: 'car crash', cz: 'autonehoda', pos: 'noun', example: 'Nobody was hurt in the {car crash}.' },
      { en: 'means of transport', cz: 'dopravní prostředek', pos: 'noun', example: 'What’s the cheapest {means of transport} in your city?' },
      { en: 'give sb a lift', cz: 'svézt někoho', pos: 'expression', example: 'Can you {give} me {a lift} to the station?' },
    ],
    speaking: [
      { en: 'Describe how you get to school or work and the problems you have on the way.', cz: 'Popiš, jak se dostáváš do školy/práce a jaké máš cestou problémy.' },
      { en: 'Give advice to a foreign student about transport rules in your city.', cz: 'Poraď zahraničnímu studentovi pravidla dopravy ve tvém městě.' },
    ],
    roleplay: {
      title: 'Asking for directions',
      cz: 'Ptaní se na cestu',
      aiRole: 'Local person at a tram stop',
      userRole: 'Visitor',
      goal: 'Find out how to get to the main station, which tram to take, whether you have to buy a ticket before boarding.',
      goalCz: 'Zjisti, jak se dostat na hlavní nádraží, jakou tramvají a jestli musíš mít lístek předem.',
      opener: 'Hi there, you look a bit lost. Can I help?',
    },
  },
  {
    n: 5,
    title: 'Sport',
    cz: 'Sport',
    emoji: '⚽',
    vocabTopic: 'sport, matches, fitness and sports events',
    grammarTitle: 'Past tenses: simple, continuous, perfect; telling a story',
    topics: [
      {
        id: 'u5-past',
        en: 'narrative tenses: past simple (main events), past continuous (background, action in progress), past perfect (earlier past action)',
        cz: 'Minulé časy ve vyprávění',
        rules: [
          'Past simple: hlavní události příběhu za sebou.',
          'Past continuous: co právě probíhalo / pozadí (I was cycling when it started to rain).',
          'Past perfect (had + 3. tvar): co se stalo ještě dřív (When we arrived, the match had already started).',
        ],
        examples: ['He got injured while he was playing football.', 'When I got to the stadium, the match had already started.'],
      },
    ],
    traps: ['„When I came, she already left“ → she had already left', '„While I played“ (probíhající děj) → While I was playing', 'Nepravidelná slovesa: winned → won'],
    vocab: [
      { en: 'warm up', cz: 'rozcvičit se', pos: 'phrasal verb', example: 'Always {warm up} before you run.' },
      { en: 'work out', cz: 'cvičit (posilovat)', pos: 'phrasal verb', example: 'I {work out} at the gym three times a week.' },
      { en: 'be sent off', cz: 'být vyloučen', pos: 'expression', example: 'Their captain {was sent off} in the second half.' },
      { en: 'be knocked out', cz: 'vypadnout (z turnaje)', pos: 'expression', example: 'We {were knocked out} in the quarter-finals.' },
      { en: 'score a goal', cz: 'dát gól', pos: 'collocation', example: 'She {scored a goal} in the last minute.' },
      { en: 'referee', cz: 'rozhodčí', pos: 'noun', example: 'The {referee} blew the final whistle.' },
      { en: 'coach', cz: 'trenér', pos: 'noun', example: 'Our {coach} is very strict.' },
      { en: 'get injured', cz: 'zranit se', pos: 'expression', example: 'I {got injured} playing basketball.' },
      { en: 'crowd', cz: 'dav, diváci', pos: 'noun', example: 'The {crowd} were cheering loudly.' },
      { en: 'court', cz: 'kurt, hřiště (tenis, basket)', pos: 'noun', example: 'We booked a tennis {court} for Saturday.' },
      { en: 'pitch', cz: 'hřiště (fotbal)', pos: 'noun', example: 'The players are coming onto the {pitch}.' },
      { en: 'beat', cz: 'porazit (někoho)', pos: 'verb', example: 'We {beat} them 3–1.', collocation: 'beat a team / win a match' },
      { en: 'draw', cz: 'remizovat; remíza', pos: 'verb/noun', example: 'The match ended in a {draw}.' },
      { en: 'carry on', cz: 'pokračovat', pos: 'phrasal verb', example: 'The crowd told him to {carry on} running.' },
    ],
    speaking: [
      { en: 'Tell the story of a sports event you watched or took part in.', cz: 'Vyprávěj o sportovní akci, kterou jsi viděl nebo hrál.' },
      { en: 'Tell a story about a day when everything went wrong.', cz: 'Vyprávěj o dni, kdy se všechno pokazilo.' },
    ],
    roleplay: {
      title: 'Telling a friend what happened',
      cz: 'Vyprávění kamarádovi',
      aiRole: 'Your friend Sam who missed the match',
      userRole: 'Fan who went to the match',
      goal: 'Tell Sam what happened at yesterday’s match: what was happening, what had happened before, the final score.',
      goalCz: 'Řekni Samovi, co se stalo na včerejším zápase – co probíhalo, co se stalo předtím, výsledek.',
      opener: 'So how was the match last night? I couldn’t watch it!',
    },
  },
  {
    n: 6,
    title: 'Electronic devices',
    cz: 'Elektronika',
    emoji: '🔌',
    vocabTopic: 'electronic devices, gadgets and technology at home',
    grammarTitle: 'Quantifiers; articles',
    topics: [
      {
        id: 'u6-quant',
        en: 'quantifiers: much/many, a lot of/lots of, a few/a little, very few/very little, too/too much/too many, (not) enough, plenty of, no/none/any',
        cz: 'Kvantifikátory (much, many, a few…)',
        rules: [
          'Many/a few + počitatelná (many apps, a few emails); much/a little + nepočitatelná (much time, a little money).',
          'Too + přídavné jméno (too big), too much/many + podstatné jméno (too much noise).',
          'Enough ZA přídavným jménem (big enough), PŘED podstatným jménem (enough money).',
          'Jeden zápor: There isn’t any milk / There’s no milk (ne „isn’t no“).',
        ],
        examples: ['There aren’t enough sockets in this room.', 'I spend too much time on my phone.'],
      },
      {
        id: 'u6-articles',
        en: 'articles a/an, the and no article (first mention vs already known, unique things, general statements, superlatives, meals, home/work/school)',
        cz: 'Členy a / the / bez členu',
        rules: [
          'A/an: poprvé zmíněné, povolání (She’s a doctor), frekvence (twice a day).',
          'The: už zmíněné nebo jasné, jedinečné (the sun), superlativ (the best), the + next/last (ne: next week bez členu!).',
          'Bez členu: obecně (Technology changes our lives), jídla, dny, at home / at work / to school.',
        ],
        examples: ['I bought a new router. The router is much faster.', 'Smartphones have changed the way we live.'],
      },
    ],
    traps: ['„She is doctor“ → She’s a doctor', '„The money doesn’t make people happy“ (obecně) → Money doesn’t…', '„enough big“ → big enough'],
    vocab: [
      { en: 'charger', cz: 'nabíječka', pos: 'noun', example: 'Have you seen my phone {charger}?' },
      { en: 'socket', cz: 'zásuvka', pos: 'noun', example: 'Is there a {socket} near the desk?' },
      { en: 'plug in', cz: 'zapojit do zásuvky', pos: 'phrasal verb', example: 'Did you {plug in} the printer?' },
      { en: 'unplug', cz: 'odpojit ze zásuvky', pos: 'verb', example: 'Always {unplug} the iron when you finish.' },
      { en: 'switch off', cz: 'vypnout', pos: 'phrasal verb', example: 'Don’t forget to {switch off} the lights.' },
      { en: 'turn down', cz: 'ztlumit', pos: 'phrasal verb', example: 'Could you {turn down} the volume, please?' },
      { en: 'memory stick', cz: 'flashka', pos: 'noun', example: 'I saved the file on a {memory stick}.' },
      { en: 'router', cz: 'router', pos: 'noun', example: 'Try restarting the {router}.' },
      { en: 'remote control', cz: 'dálkový ovladač', pos: 'noun', example: 'The {remote control} was under the sofa.' },
      { en: 'voice assistant', cz: 'hlasový asistent', pos: 'noun', example: 'I ask my {voice assistant} to set alarms.' },
      { en: 'install', cz: 'nainstalovat', pos: 'verb', example: 'I need to {install} a new app.' },
      { en: 'update', cz: 'aktualizovat', pos: 'verb', example: 'You should {update} your apps regularly.' },
      { en: 'set an alarm', cz: 'nastavit budík', pos: 'collocation', example: 'I {set an alarm} for 6 a.m.' },
      { en: 'plenty of', cz: 'spousta, dost', pos: 'quantifier', example: 'Don’t hurry – we have {plenty of} time.' },
    ],
    speaking: [
      { en: 'Describe the devices you use every day and how much time you spend on them.', cz: 'Popiš zařízení, která denně používáš, a kolik času na nich trávíš.' },
      { en: 'Explain to someone how to set up a new phone or router.', cz: 'Vysvětli někomu, jak nastavit nový telefon nebo router.' },
    ],
    roleplay: {
      title: 'Tech support call',
      cz: 'Hovor na technickou podporu',
      aiRole: 'Customer support assistant at an internet provider',
      userRole: 'Customer',
      goal: 'Your internet hasn’t worked since yesterday. Describe the problem, follow the instructions and arrange a technician visit.',
      goalCz: 'Od včera ti nejde internet. Popiš problém, řiď se pokyny a domluv technika.',
      opener: 'Thank you for calling Fastnet support, my name is Chris. How can I help?',
    },
  },
  {
    n: 7,
    title: 'Cinema',
    cz: 'Film a kino',
    emoji: '🎬',
    vocabTopic: 'films, cinema and the film industry',
    grammarTitle: 'Passive voice (all tenses)',
    topics: [
      {
        id: 'u7-passive',
        en: 'passive voice in all tenses: is made, is being made, was made, has been made, had been made, will be made, can be made; by + agent only when important',
        cz: 'Trpný rod',
        rules: [
          'Tvar: be (ve správném čase) + 3. tvar slovesa: The film was shot in Prague.',
          'Průběhový: is being + 3. tvar (The scene is being filmed right now).',
          'Používáme, když je důležitější děj než kdo ho dělá; „by…“ jen když je to důležité.',
          'Be set in = odehrává se v; be based on = je podle.',
        ],
        examples: ['The film is set in Brno in the 1990s.', 'The sequel will be released next year.'],
      },
    ],
    traps: ['„The film shot in Prague“ → was shot', '„is based of“ → is based on', '„It is playing in cinemas“ je OK, ale „The film is showing by…“ → is being shown'],
    vocab: [
      { en: 'plot', cz: 'děj, zápletka', pos: 'noun', example: 'The {plot} was too complicated for me.' },
      { en: 'script', cz: 'scénář', pos: 'noun', example: 'She loved the {script} and accepted the role.' },
      { en: 'cast', cz: 'herecké obsazení', pos: 'noun', example: 'The film has an amazing {cast}.' },
      { en: 'star', cz: 'hrát hlavní roli; hvězda', pos: 'verb/noun', example: 'The film {stars} two Czech actors.' },
      { en: 'audience', cz: 'publikum', pos: 'noun', example: 'The {audience} laughed all the way through.' },
      { en: 'review', cz: 'recenze', pos: 'noun', example: 'The film got great {reviews}.' },
      { en: 'scene', cz: 'scéna', pos: 'noun', example: 'The final {scene} made me cry.' },
      { en: 'subtitles', cz: 'titulky', pos: 'noun', example: 'I prefer films with {subtitles} to dubbed ones.' },
      { en: 'dubbed', cz: 'dabovaný', pos: 'adjective', example: 'Most films on Czech TV are {dubbed}.' },
      { en: 'sequel', cz: 'pokračování', pos: 'noun', example: 'The {sequel} wasn’t as good as the original.' },
      { en: 'soundtrack', cz: 'filmová hudba', pos: 'noun', example: 'The {soundtrack} was amazing.' },
      { en: 'special effects', cz: 'speciální efekty', pos: 'noun', example: 'The {special effects} looked very realistic.' },
      { en: 'trailer', cz: 'upoutávka', pos: 'noun', example: 'Have you seen the {trailer}?' },
      { en: 'be based on', cz: 'být podle (skutečné události…)', pos: 'expression', example: 'The film {is based on} a true story.' },
    ],
    speaking: [
      { en: 'Describe a film you saw recently: where it is set, who is in it and what happens.', cz: 'Popiš film, který jsi nedávno viděl: kde se odehrává, kdo hraje, o čem je.' },
      { en: 'Explain how a film is made, from the script to the premiere.', cz: 'Vysvětli, jak vzniká film – od scénáře po premiéru.' },
    ],
    roleplay: {
      title: 'Choosing a film to watch',
      cz: 'Výběr filmu',
      aiRole: 'Your flatmate Alex',
      userRole: 'Flatmate',
      goal: 'Agree on a film for tonight: describe films (genre, plot, cast, reviews) and convince Alex.',
      goalCz: 'Domluvte se na filmu na večer – popiš filmy (žánr, děj, herci, recenze) a přesvědč Alexe.',
      opener: 'Film night! What do you fancy watching? I’m in the mood for something exciting.',
    },
  },
  {
    n: 8,
    title: 'Education',
    cz: 'Vzdělání',
    emoji: '🎓',
    vocabTopic: 'school, university, exams and studying',
    grammarTitle: 'First conditional & future time clauses',
    topics: [
      {
        id: 'u8-first-cond',
        en: 'first conditional (if + present, will) and future time clauses with when, as soon as, until, unless, before, after (present tense after the conjunction)',
        cz: '1. kondicionál a časové věty',
        rules: [
          'If + přítomný čas, will + sloveso: If I pass the exam, I’ll celebrate.',
          'Po when, as soon as, until, before, after, unless NIKDY will: I’ll call you when I get home.',
          'Unless = pokud ne (I won’t pass unless I study). Until = dokud ne / až do.',
        ],
        examples: ['As soon as I get my results, I’ll let you know.', 'You won’t pass unless you start revising.'],
      },
    ],
    traps: ['„If I will have time“ → If I have time', '„When I will finish“ → When I finish', '„unless I don’t study“ (dvojí zápor) → unless I study'],
    vocab: [
      { en: 'revise', cz: 'opakovat si (na zkoušku)', pos: 'verb', example: 'I need to {revise} for my maths exam.', collocation: 'revise for an exam' },
      { en: 'pass an exam', cz: 'udělat zkoušku', pos: 'collocation', example: 'I hope I’ll {pass the exam}.', collocation: 'pass / fail / take an exam' },
      { en: 'fail', cz: 'neudělat, propadnout', pos: 'verb', example: 'He {failed} his driving test twice.' },
      { en: 'cheat', cz: 'podvádět', pos: 'verb', example: 'He was caught {cheating} in the exam.' },
      { en: 'marks', cz: 'známky, body', pos: 'noun', example: 'She always gets good {marks}.', collocation: 'get good / bad marks' },
      { en: 'degree', cz: 'titul (vysokoškolský)', pos: 'noun', example: 'She has a {degree} in civil engineering.' },
      { en: 'graduate', cz: 'absolvovat (VŠ)', pos: 'verb', example: 'I’ll {graduate} next year.' },
      { en: 'compulsory', cz: 'povinný', pos: 'adjective', example: 'English is a {compulsory} subject.' },
      { en: 'optional', cz: 'volitelný', pos: 'adjective', example: 'This course is {optional}.' },
      { en: 'strict', cz: 'přísný', pos: 'adjective', example: 'Our maths teacher was really {strict}.' },
      { en: 'halls of residence', cz: 'koleje', pos: 'noun', example: 'I lived in {halls of residence} in my first year.' },
      { en: 'semester', cz: 'semestr', pos: 'noun', example: 'This {semester} has been really hard.' },
      { en: 'be expelled', cz: 'být vyloučen (ze školy)', pos: 'expression', example: 'He {was expelled} for bad behaviour.' },
      { en: 'unless', cz: 'pokud ne, ledaže', pos: 'conjunction', example: 'I won’t go {unless} you come with me.' },
    ],
    speaking: [
      { en: 'Talk about your studies: subjects, exams and what you will do when you graduate.', cz: 'Mluv o studiu: předměty, zkoušky a co uděláš po ukončení.' },
      { en: 'Should university education be free for everyone? Give your opinion with reasons.', cz: 'Má být vysokoškolské vzdělání zdarma? Názor a důvody.' },
    ],
    roleplay: {
      title: 'Talking to your tutor',
      cz: 'Rozhovor s vyučujícím',
      aiRole: 'University tutor',
      userRole: 'Student',
      goal: 'Ask about the exam: what happens if you fail, when you will get the results, and whether you can retake it.',
      goalCz: 'Zeptej se na zkoušku: co když neuspěješ, kdy budou výsledky, jestli jde opakovat.',
      opener: 'Come in! What can I do for you?',
    },
  },
  {
    n: 9,
    title: 'Houses',
    cz: 'Bydlení',
    emoji: '🏠',
    vocabTopic: 'houses, flats, rooms and where people live',
    grammarTitle: 'Second conditional (vs first conditional)',
    topics: [
      {
        id: 'u9-second-cond',
        en: 'second conditional for imaginary or unlikely situations (if + past simple, would/could + verb), If I were you…, and the difference from the first conditional',
        cz: '2. kondicionál',
        rules: [
          'Nereálná / nepravděpodobná situace: If + minulý čas, would + sloveso: If I had more money, I’d buy a house.',
          'Rada: If I were you, I’d… (were pro všechny osoby).',
          '1. vs 2.: reálná možnost (If I get the job, I’ll move) × představa (If I won the lottery, I’d move).',
        ],
        examples: ['If I lived in the countryside, I’d have a dog.', 'Would you share a flat with me if I paid half the rent?'],
      },
    ],
    traps: ['„If I would have money“ → If I had money', '„If I am you“ → If I were you', 'Míchání: „If I had time, I will come“ → I would come'],
    vocab: [
      { en: 'suburbs', cz: 'předměstí', pos: 'noun', example: 'We live in the {suburbs}, about 20 minutes from the centre.' },
      { en: 'outskirts', cz: 'okraj města', pos: 'noun', example: 'The new flats are on the {outskirts} of Brno.' },
      { en: 'ground floor', cz: 'přízemí', pos: 'noun', example: 'Our flat is on the {ground floor}.', collocation: 'first floor = 1. patro' },
      { en: 'ceiling', cz: 'strop', pos: 'noun', example: 'The rooms have very high {ceilings}.', collocation: 'roof = střecha' },
      { en: 'stairs', cz: 'schodiště (uvnitř)', pos: 'noun', example: 'The bathroom is at the top of the {stairs}.', collocation: 'steps = schody venku' },
      { en: 'balcony', cz: 'balkon', pos: 'noun', example: 'We have breakfast on the {balcony}.' },
      { en: 'fireplace', cz: 'krb', pos: 'noun', example: 'There’s a {fireplace} in the living room.', collocation: 'chimney = komín' },
      { en: 'cosy', cz: 'útulný', pos: 'adjective', example: 'It’s a small but {cosy} flat.' },
      { en: 'spacious', cz: 'prostorný', pos: 'adjective', example: 'The kitchen is bright and {spacious}.' },
      { en: 'light', cz: 'světlý', pos: 'adjective', example: 'All the rooms are very {light}.' },
      { en: 'share a flat', cz: 'bydlet ve sdíleném bytě', pos: 'collocation', example: 'I {share a flat} with two friends.' },
      { en: 'rent', cz: 'nájem; pronajmout si', pos: 'noun/verb', example: 'The {rent} is too high for students.' },
      { en: 'central heating', cz: 'ústřední topení', pos: 'noun', example: 'The house has {central heating}.' },
      { en: 'neighbour', cz: 'soused', pos: 'noun', example: 'We get on well with our {neighbours}.' },
    ],
    speaking: [
      { en: 'Describe the place where you live and what you would change if you could.', cz: 'Popiš, kde bydlíš, a co bys změnil, kdybys mohl.' },
      { en: 'Describe your dream house: where it would be and what it would have.', cz: 'Popiš svůj vysněný dům – kde by byl a co by měl.' },
    ],
    roleplay: {
      title: 'Viewing a flat',
      cz: 'Prohlídka bytu',
      aiRole: 'Estate agent',
      userRole: 'Student looking for a flat',
      goal: 'Ask about the flat (rooms, floor, rent, neighbours) and say what you would need to take it.',
      goalCz: 'Ptej se na byt (pokoje, patro, nájem, sousedé) a řekni, za jakých podmínek bys ho vzal.',
      opener: 'Hi, welcome! This is the flat I mentioned on the phone. Shall we start with the living room?',
    },
  },
  {
    n: 10,
    title: 'Work',
    cz: 'Práce',
    emoji: '💼',
    vocabTopic: 'jobs, work conditions, careers and applying for jobs',
    grammarTitle: 'Gerunds and infinitives',
    topics: [
      {
        id: 'u10-ger-inf',
        en: 'gerunds and infinitives: verb + -ing (enjoy, avoid, finish, don’t mind, give up, keep), verb + to (want, decide, promise, plan, agree), -ing after prepositions and as subject, to for purpose, adjective + to, make/let + bare infinitive, remember/try + -ing vs to',
        cz: 'Gerundium vs. infinitiv',
        rules: [
          'Po enjoy, avoid, finish, don’t mind, give up, keep, suggest → -ing.',
          'Po want, decide, plan, hope, agree, promise, would like → to + sloveso.',
          'Po předložce vždy -ing: good at solving, interested in learning.',
          'Účel = to: I went there to buy bread (ne „for buy“). Make/let + sloveso bez to: She made me wait.',
        ],
        examples: ['I don’t mind working overtime.', 'She decided to set up her own business.'],
      },
    ],
    traps: ['„I enjoy to work“ → I enjoy working', '„for to learn“ → to learn', '„interested to learn“ → interested in learning'],
    vocab: [
      { en: 'apply for', cz: 'ucházet se o', pos: 'phrasal verb', example: 'I’ve {applied for} three jobs this week.' },
      { en: 'CV', cz: 'životopis', pos: 'noun', example: 'Send your {CV} to the HR department.' },
      { en: 'salary', cz: 'plat', pos: 'noun', example: 'The job has a good {salary}.' },
      { en: 'overtime', cz: 'přesčasy', pos: 'noun', example: 'I had to do a lot of {overtime} last month.', collocation: 'do / work overtime' },
      { en: 'resign', cz: 'dát výpověď (sám)', pos: 'verb', example: 'She {resigned} because she hated her boss.' },
      { en: 'be sacked', cz: 'dostat vyhazov', pos: 'expression', example: 'He {was sacked} for being late every day.' },
      { en: 'be made redundant', cz: 'být propuštěn (nadbytečnost)', pos: 'expression', example: 'Fifty workers {were made redundant}.' },
      { en: 'get promoted', cz: 'být povýšen', pos: 'expression', example: 'She {got promoted} after only a year.' },
      { en: 'retire', cz: 'odejít do důchodu', pos: 'verb', example: 'My dad wants to {retire} early.' },
      { en: 'set up', cz: 'založit (firmu)', pos: 'phrasal verb', example: 'She {set up} an online business.' },
      { en: 'run a business', cz: 'vést firmu', pos: 'collocation', example: 'He’s {run a business} for twenty years.' },
      { en: 'work shifts', cz: 'pracovat na směny', pos: 'collocation', example: 'Nurses often have to {work shifts}.' },
      { en: 'self-employed', cz: 'OSVČ, na volné noze', pos: 'adjective', example: 'My mum is {self-employed}.' },
      { en: 'unemployed', cz: 'nezaměstnaný', pos: 'adjective', example: 'He was {unemployed} for six months.' },
    ],
    speaking: [
      { en: 'Describe your dream job and what you would enjoy and avoid doing.', cz: 'Popiš svou vysněnou práci – co bys rád dělal a čemu by ses vyhnul.' },
      { en: 'Tell the career story of someone you know.', cz: 'Vyprávěj pracovní příběh někoho, koho znáš.' },
    ],
    roleplay: {
      title: 'Job interview',
      cz: 'Pracovní pohovor',
      aiRole: 'Interviewer at an engineering company',
      userRole: 'Candidate',
      goal: 'Talk about what you enjoy doing, what you are good at, what you want to achieve and whether you mind working overtime.',
      goalCz: 'Mluv o tom, co tě baví, v čem jsi dobrý, čeho chceš dosáhnout a jestli ti vadí přesčasy.',
      opener: 'Thanks for coming in. So, why did you decide to apply for this position?',
    },
  },
  {
    n: 11,
    title: 'Shopping',
    cz: 'Nakupování',
    emoji: '🛍️',
    vocabTopic: 'shopping in shops and online, returns and complaints',
    grammarTitle: 'Reported speech; making a complaint',
    topics: [
      {
        id: 'u11-reported',
        en: 'reported speech: tense backshift (is → was, has done → had done, will → would, can → could), time/place changes (today → that day, tomorrow → the next day), reported questions (asked if/where + statement word order), commands (told sb to / not to)',
        cz: 'Nepřímá řeč',
        rules: [
          'Posun časů o krok do minulosti: “I’m tired” → She said (that) she was tired.',
          'Will → would, can → could, present perfect / past → past perfect.',
          'Otázky: slovosled oznamovací věty, bez do/did: He asked where I lived. Ano/ne otázky: asked if…',
          'Rozkazy: told me to wait / told me not to worry. Say něco × tell někomu.',
        ],
        examples: ['She told me she had already paid.', 'The assistant asked if I had the receipt.'],
      },
    ],
    traps: ['„He asked where do I live“ → where I lived', '„She said me“ → She told me / She said (that)', '„told me wait“ → told me to wait'],
    vocab: [
      { en: 'receipt', cz: 'účtenka', pos: 'noun', example: 'Do you still have the {receipt}?' },
      { en: 'refund', cz: 'vrácení peněz', pos: 'noun', example: 'I’d like a {refund}, please.', collocation: 'get / ask for a refund' },
      { en: 'discount', cz: 'sleva', pos: 'noun', example: 'Students get a 10% {discount}.' },
      { en: 'try on', cz: 'zkusit si (oblečení)', pos: 'phrasal verb', example: 'Can I {try on} these jeans?' },
      { en: 'fit', cz: 'padnout (velikostí)', pos: 'verb', example: 'These shoes don’t {fit} me.', collocation: 'fit = size, suit = look good' },
      { en: 'suit', cz: 'slušet', pos: 'verb', example: 'That colour really {suits} you.' },
      { en: 'delivery', cz: 'doručení', pos: 'noun', example: 'Is {delivery} free?' },
      { en: 'return', cz: 'vrácení zboží; vrátit', pos: 'noun/verb', example: 'I want to {return} this jacket.' },
      { en: 'rating', cz: 'hodnocení (hvězdičky)', pos: 'noun', example: 'The product has a five-star {rating}.' },
      { en: 'trolley', cz: 'nákupní vozík', pos: 'noun', example: 'Let’s get a {trolley} – we need a lot of things.', collocation: 'basket = košík' },
      { en: 'make a complaint', cz: 'stěžovat si', pos: 'collocation', example: 'I’d like to {make a complaint}.', collocation: 'make (NOT do) a complaint' },
      { en: 'faulty', cz: 'vadný', pos: 'adjective', example: 'The charger I bought was {faulty}.' },
      { en: 'exchange', cz: 'vyměnit (zboží)', pos: 'verb', example: 'Can I {exchange} it for a bigger size?' },
      { en: 'out of stock', cz: 'vyprodáno', pos: 'expression', example: 'Sorry, that model is {out of stock}.' },
    ],
    speaking: [
      { en: 'Tell a story about a problem with something you bought and what people said.', cz: 'Vyprávěj o problému s nákupem a co kdo řekl.' },
      { en: 'Online shopping vs shopping in shops: what do you prefer and why?', cz: 'Online vs. kamenný obchod – co preferuješ a proč?' },
    ],
    roleplay: {
      title: 'Making a complaint',
      cz: 'Reklamace v obchodě',
      aiRole: 'Shop assistant in a clothes shop',
      userRole: 'Customer',
      goal: 'A jacket you bought last week is faulty. Complain politely, explain what happened, and ask for a refund or exchange.',
      goalCz: 'Bunda koupená minulý týden je vadná. Zdvořile reklamuj, vysvětli co se stalo a chtěj vrácení peněz nebo výměnu.',
      opener: 'Hello! How can I help you today?',
    },
  },
];

export function lessonOfTopic(id: string | null | undefined): Lesson | null {
  if (!id) return null;
  const m = id.match(/^u(\d+)/);
  return m ? LESSONS.find((l) => l.n === Number(m[1])) ?? null : null;
}

/** Topic for a textbook focus id: either one topic ("u3-for-since") or a whole lesson ("u3"). */
export function textbookTopic(id: string): (GrammarTopic & { vocab: string; lesson: Lesson }) | null {
  const lesson = lessonOfTopic(id);
  if (!lesson) return null;
  const t = lesson.topics.find((x) => x.id === id);
  if (t) return { id, en: t.en, cz: t.cz, vocab: lesson.vocabTopic, lesson };
  if (id === `u${lesson.n}`)
    return { id, en: lesson.topics.map((x) => x.en).join('; OR '), cz: `Lekce ${lesson.n}: ${lesson.grammarTitle}`, vocab: lesson.vocabTopic, lesson };
  return null;
}

export const packIdOf = (n: number) => `ef-l${n}`;
