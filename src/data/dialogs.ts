// Everyday dialogues for speaking practice. The app plays the other person, you say your lines.
// 'me' lines are kept short and natural so the microphone can catch them.
export interface DLine {
  who: 'them' | 'me';
  en: string;
  cz: string;
  alt?: string[];
}
export interface Dialog {
  id: string;
  level: number;
  title: string;
  cz: string;
  setting: string;
  lines: DLine[];
}

const t = (en: string, cz: string): DLine => ({ who: 'them', en, cz });
const m = (en: string, cz: string, ...alt: string[]): DLine => ({ who: 'me', en, cz, alt });

export const DIALOGS: Dialog[] = [
  {
    id: 'cafe',
    level: 1,
    title: 'At the café',
    cz: 'V kavárně',
    setting: 'Objednáváš si v kavárně.',
    lines: [
      t('Hi! What can I get you?', 'Ahoj! Co si dáte?'),
      m('Can I have a coffee, please?', 'Můžu dostat kávu, prosím?', 'Could I have a coffee, please?'),
      t('Sure. Small or large?', 'Jasně. Malou, nebo velkou?'),
      m('Large, please.', 'Velkou, prosím.', 'A large one, please.'),
      t('Anything else?', 'Ještě něco?'),
      m('No, thank you.', 'Ne, děkuju.', 'No, thanks.'),
      t("That's three pounds fifty.", 'To bude tři libry padesát.'),
      m('Can I pay by card?', 'Můžu platit kartou?'),
      t('Of course. Here you are.', 'Samozřejmě. Tady to je.'),
      m('Thank you. Have a nice day!', 'Děkuju. Hezký den!', 'Thanks. Have a nice day!'),
    ],
  },
  {
    id: 'meet',
    level: 1,
    title: 'Meeting someone new',
    cz: 'Seznámení',
    setting: 'Na večírku potkáš nového člověka.',
    lines: [
      t("Hi, I'm Sarah. What's your name?", 'Ahoj, já jsem Sarah. Jak se jmenuješ?'),
      m("Hi Sarah, I'm Tom. Nice to meet you.", 'Ahoj Sarah, já jsem Tom. Rád tě poznávám.', "Hi Sarah, my name is Tom. Nice to meet you."),
      t('Nice to meet you too. Where are you from?', 'Taky tě ráda poznávám. Odkud jsi?'),
      m("I'm from the Czech Republic.", 'Jsem z České republiky.', "I'm from Czechia."),
      t('Cool! What do you do?', 'Super! Co děláš?'),
      m('I work in an office.', 'Pracuju v kanceláři.'),
      t('Do you like it?', 'Baví tě to?'),
      m('Yes, it is quite interesting.', 'Ano, je to docela zajímavé.', "Yes, it's quite interesting."),
      t('How long have you been here?', 'Jak dlouho tady jsi?'),
      m('Only two days.', 'Jen dva dny.', 'Just two days.'),
    ],
  },
  {
    id: 'shop',
    level: 1,
    title: 'In a clothes shop',
    cz: 'V obchodě s oblečením',
    setting: 'Kupuješ si tričko.',
    lines: [
      t('Hello, can I help you?', 'Dobrý den, můžu vám pomoct?'),
      m("I'm looking for a T-shirt.", 'Hledám tričko.', "I'm looking for a t shirt."),
      t('What size are you?', 'Jakou máte velikost?'),
      m('Medium, I think.', 'Myslím, že M.', 'Medium I think.'),
      t('Here you are. What colour would you like?', 'Tady. Jakou barvu byste chtěl?'),
      m('Do you have it in blue?', 'Máte ho v modré?'),
      t('Yes, we do. Would you like to try it on?', 'Ano, máme. Chcete si ho vyzkoušet?'),
      m('Yes, please. Where is the changing room?', 'Ano, prosím. Kde je kabinka?'),
      t("It's over there, on the left.", 'Je tamhle vlevo.'),
      m("It fits. I'll take it.", 'Sedí mi. Vezmu si ho.'),
    ],
  },
  {
    id: 'directions',
    level: 2,
    title: 'Asking the way',
    cz: 'Ptáš se na cestu',
    setting: 'Hledáš ve městě nádraží.',
    lines: [
      m('Excuse me, how do I get to the station?', 'Promiňte, jak se dostanu na nádraží?', 'Excuse me, how can I get to the station?'),
      t('Go straight on and turn left at the traffic lights.', 'Jděte rovně a na semaforech zahněte doleva.'),
      m('Is it far from here?', 'Je to odsud daleko?'),
      t("No, it's about ten minutes on foot.", 'Ne, je to asi deset minut pěšky.'),
      m('Is there a bus?', 'Jede tam autobus?', 'Is there a bus too?'),
      t('Yes, the number twelve stops right there.', 'Ano, dvanáctka staví přímo tamhle.'),
      m('How often does it go?', 'Jak často jezdí?'),
      t('Every ten minutes, I think.', 'Myslím, že každých deset minut.'),
      m('Thank you very much for your help.', 'Moc děkuju za pomoc.', 'Thanks a lot for your help.'),
      t("You're welcome. Have a good trip!", 'Není zač. Šťastnou cestu!'),
    ],
  },
  {
    id: 'restaurant',
    level: 2,
    title: 'At a restaurant',
    cz: 'V restauraci',
    setting: 'Večeře s kamarádem v restauraci.',
    lines: [
      t('Good evening. Do you have a reservation?', 'Dobrý večer. Máte rezervaci?'),
      m("Yes, we have a table for two at seven.", 'Ano, máme stůl pro dva na sedmou.', "Yes, a table for two at seven."),
      t('What name is it under?', 'Na jaké jméno?'),
      m("It's under Novak.", 'Na jméno Novák.', 'Under Novak.'),
      t('This way, please. Are you ready to order?', 'Tudy, prosím. Můžete si objednat?'),
      m("Not yet. Could we have a few more minutes?", 'Ještě ne. Můžeme mít ještě pár minut?', 'Not yet, could we have a few more minutes?'),
      t('Of course. Can I get you something to drink?', 'Samozřejmě. Můžu vám přinést něco k pití?'),
      m('A glass of water and a beer, please.', 'Sklenici vody a pivo, prosím.'),
      t('And what would you like to eat?', 'A co si dáte k jídlu?'),
      m("I'd like the chicken with rice.", 'Dal bych si kuře s rýží.', 'I would like the chicken with rice.'),
      t('Was everything all right?', 'Bylo všechno v pořádku?'),
      m('It was delicious. Could we have the bill, please?', 'Bylo to výborné. Můžeme zaplatit, prosím?', 'It was delicious. Can we have the bill, please?'),
    ],
  },
  {
    id: 'hotel',
    level: 2,
    title: 'Checking in at a hotel',
    cz: 'Ubytování v hotelu',
    setting: 'Přijel jsi do hotelu.',
    lines: [
      t('Hello, welcome to the Park Hotel.', 'Dobrý den, vítejte v hotelu Park.'),
      m('Hi, I have a booking for three nights.', 'Dobrý den, mám rezervaci na tři noci.', 'Hello, I have a booking for three nights.'),
      t('Can I see your passport, please?', 'Můžu vidět váš pas, prosím?'),
      m('Sure, here you are.', 'Jasně, tady je.', 'Sure, here it is.'),
      t("Thank you. You're in room two hundred and five.", 'Děkuju. Máte pokoj dvě stě pět.'),
      m('What time is breakfast?', 'V kolik je snídaně?'),
      t('From seven to ten in the restaurant.', 'Od sedmi do deseti v restauraci.'),
      m('Is there free wifi?', 'Je tu wifi zdarma?', 'Is there free wi fi?'),
      t('Yes, the password is on your key card.', 'Ano, heslo je na vaší kartě od pokoje.'),
      m('Great. What time do I have to check out?', 'Super. V kolik se musím odhlásit?'),
      t('By eleven, please. Enjoy your stay!', 'Do jedenácti, prosím. Užijte si pobyt!'),
    ],
  },
  {
    id: 'doctor',
    level: 2,
    title: 'At the doctor',
    cz: 'U doktora',
    setting: 'Necítíš se dobře a jdeš k lékaři.',
    lines: [
      t('Hello. What seems to be the problem?', 'Dobrý den. Co vás trápí?'),
      m("I don't feel very well.", 'Necítím se moc dobře.'),
      t('What are your symptoms?', 'Jaké máte příznaky?'),
      m('I have a headache and a sore throat.', 'Bolí mě hlava a v krku.'),
      t('How long have you had them?', 'Jak dlouho to máte?'),
      m('Since Monday.', 'Od pondělí.', 'Since last Monday.'),
      t('Do you have a temperature?', 'Máte teplotu?'),
      m('Yes, a little.', 'Ano, trochu.', 'Yes, a bit.'),
      t("It's probably a cold. Drink a lot and rest.", 'Je to asi nachlazení. Hodně pijte a odpočívejte.'),
      m('Do I need to take any medicine?', 'Musím brát nějaké léky?'),
      t('You can take something for the pain if you need to.', 'Když bude potřeba, vezměte si něco proti bolesti.'),
      m('Thank you, doctor.', 'Děkuju, pane doktore.'),
    ],
  },
  {
    id: 'phone',
    level: 3,
    title: 'Making an appointment',
    cz: 'Domluva termínu po telefonu',
    setting: 'Voláš do kadeřnictví.',
    lines: [
      t('Good morning, Hair Studio. How can I help?', 'Dobré ráno, Hair Studio. Jak vám můžu pomoct?'),
      m("Hi, I'd like to make an appointment.", 'Dobrý den, chtěl bych se objednat.', 'Hello, I would like to make an appointment.'),
      t('Sure. When would suit you?', 'Jistě. Kdy by se vám to hodilo?'),
      m('Do you have anything on Thursday afternoon?', 'Máte něco ve čtvrtek odpoledne?'),
      t("I'm afraid Thursday is fully booked. How about Friday at four?", 'Bohužel čtvrtek je plný. Co pátek ve čtyři?'),
      m('Friday at four is fine.', 'Pátek ve čtyři je v pořádku.', 'Friday at four is perfect.'),
      t('Great. Can I take your name and phone number?', 'Skvěle. Můžu poprosit jméno a telefon?'),
      m("Sure. It's Petr, and my number is in your system.", 'Jasně. Petr, a číslo máte v systému.'),
      t("Perfect, I've found you. See you on Friday!", 'Výborně, našla jsem vás. Uvidíme se v pátek!'),
      m('Thanks. If I need to cancel, I will call you.', 'Díky. Kdybych to musel zrušit, zavolám vám.', "Thanks. If I need to cancel, I'll call you."),
    ],
  },
  {
    id: 'complaint',
    level: 3,
    title: 'Returning a product',
    cz: 'Reklamace',
    setting: 'Vracíš rozbitá sluchátka.',
    lines: [
      t('Hi there. What can I do for you?', 'Dobrý den. Co pro vás můžu udělat?'),
      m('I bought these headphones last week, but they stopped working.', 'Minulý týden jsem koupil tahle sluchátka, ale přestala fungovat.'),
      t("I'm sorry to hear that. Do you have the receipt?", 'To mě mrzí. Máte účtenku?'),
      m("Yes, here it is.", 'Ano, tady je.', 'Yes, here you are.'),
      t('Would you like a replacement or a refund?', 'Chcete vyměnit, nebo vrátit peníze?'),
      m("I'd prefer a refund, please.", 'Raději bych vrácení peněz, prosím.', 'I would prefer a refund, please.'),
      t('No problem. It will be back on your card in a few days.', 'Žádný problém. Peníze budou na kartě za pár dní.'),
      m('How many days will it take?', 'Kolik dní to bude trvat?'),
      t('Usually three to five working days.', 'Obvykle tři až pět pracovních dní.'),
      m('Okay, thanks for your help.', 'Dobře, díky za pomoc.', 'OK, thanks for your help.'),
    ],
  },
  {
    id: 'weekend',
    level: 3,
    title: 'Talking about the weekend',
    cz: 'Povídání o víkendu',
    setting: 'V pondělí ráno s kolegyní v práci.',
    lines: [
      t('Morning! How was your weekend?', 'Dobré ráno! Jaký byl víkend?'),
      m('It was great, thanks. How was yours?', 'Byl super, díky. A jaký byl tvůj?', 'It was great, thanks. And yours?'),
      t('Pretty quiet. What did you do?', 'Docela klidný. Co jsi dělal?'),
      m('I went hiking in the mountains with some friends.', 'Byl jsem s kamarády na túře v horách.'),
      t('Lucky you! Was the weather good?', 'Ty máš štěstí! Bylo hezky?'),
      m('It rained on Saturday, but Sunday was sunny.', 'V sobotu pršelo, ale neděle byla slunečná.'),
      t('Where did you stay?', 'Kde jste spali?'),
      m('We stayed in a small cottage near the lake.', 'Bydleli jsme v malé chatě u jezera.'),
      t('That sounds lovely. I should do that too.', 'To zní krásně. To bych měla udělat taky.'),
      m('You should come with us next time.', 'Příště bys měla jet s námi.'),
    ],
  },
  {
    id: 'flat',
    level: 3,
    title: 'Viewing a flat',
    cz: 'Prohlídka bytu',
    setting: 'Prohlížíš si byt k pronájmu.',
    lines: [
      t('So this is the living room. What do you think?', 'Tak tohle je obývák. Co myslíte?'),
      m("It's bigger than I expected.", 'Je větší, než jsem čekal.', 'It is bigger than I expected.'),
      t('And the kitchen is fully equipped.', 'A kuchyň je plně vybavená.'),
      m('How much is the rent per month?', 'Kolik je nájem za měsíc?'),
      t("It's nine hundred, including bills.", 'Devět set, včetně energií.'),
      m('Is the internet included too?', 'Je v tom i internet?'),
      t("No, you'd have to set that up yourself.", 'Ne, ten byste si musel zařídit sám.'),
      m('Are pets allowed?', 'Jsou povolená zvířata?'),
      t('Small pets are fine.', 'Malá zvířata nevadí.'),
      m('When could I move in?', 'Kdy bych se mohl nastěhovat?'),
      t('From the first of next month.', 'Od prvního příštího měsíce.'),
      m("Great. Can I think about it and let you know tomorrow?", 'Super. Můžu si to rozmyslet a dát vám vědět zítra?'),
    ],
  },
  {
    id: 'interview',
    level: 4,
    title: 'A job interview',
    cz: 'Pracovní pohovor',
    setting: 'Jsi na pohovoru do mezinárodní firmy.',
    lines: [
      t('Thanks for coming in. Could you tell me a bit about yourself?', 'Díky, že jste přišel. Řekl byste mi něco o sobě?'),
      m("I've been working in customer service for five years.", 'Pět let pracuju v zákaznickém servisu.', 'I have been working in customer service for five years.'),
      t('Why are you interested in this position?', 'Proč vás tahle pozice zajímá?'),
      m('I want to use my English and take on more responsibility.', 'Chci využít angličtinu a mít víc zodpovědnosti.'),
      t("What would you say is your biggest strength?", 'Co je podle vás vaše největší silná stránka?'),
      m("I'm good at solving problems under pressure.", 'Umím řešit problémy pod tlakem.', 'I am good at solving problems under pressure.'),
      t('And a weakness?', 'A slabá stránka?'),
      m('Sometimes I find it hard to say no to people.', 'Někdy je pro mě těžké lidem říct ne.'),
      t('Where do you see yourself in five years?', 'Kde se vidíte za pět let?'),
      m("I'd like to be leading a small team.", 'Rád bych vedl malý tým.', 'I would like to be leading a small team.'),
      t('Do you have any questions for us?', 'Máte na nás nějaké otázky?'),
      m('Yes. What does a typical day look like in this job?', 'Ano. Jak vypadá běžný den v této práci?'),
    ],
  },
  {
    id: 'plans',
    level: 4,
    title: 'Making plans with a friend',
    cz: 'Plánování s kamarádem',
    setting: 'Domlouváte se s kamarádkou na výlet.',
    lines: [
      t("I was thinking we could go somewhere next weekend. What do you reckon?", 'Napadlo mě, že bychom mohli příští víkend někam vyrazit. Co ty na to?'),
      m("That's a great idea. Where would you like to go?", 'To je super nápad. Kam bys chtěla jet?'),
      t("Maybe Vienna? I've never been.", 'Třeba do Vídně? Nikdy jsem tam nebyla.'),
      m("I've been there twice. It's really beautiful.", 'Byl jsem tam dvakrát. Je tam opravdu krásně.', 'I have been there twice. It is really beautiful.'),
      t('Should we take the train or drive?', 'Pojedeme vlakem, nebo autem?'),
      m("The train is more relaxing, and parking there is expensive.", 'Vlak je pohodovější a parkování je tam drahé.'),
      t('Fair enough. Shall I book the tickets?', 'To dává smysl. Mám koupit lístky?'),
      m("Yes, please. I'll look for somewhere to stay.", 'Ano, prosím. Já najdu, kde přespíme.', 'Yes please. I will look for somewhere to stay.'),
      t("Perfect. Let's not spend too much, though.", 'Super. Ale ať neutratíme moc.'),
      m("Don't worry, I'll find something cheap but nice.", 'Neboj, najdu něco levného, ale hezkého.'),
    ],
  },
  {
    id: 'colleague',
    level: 4,
    title: 'A problem at work',
    cz: 'Problém v práci',
    setting: 'Kolega potřebuje pomoct s termínem.',
    lines: [
      t("Have you got a minute? I'm a bit stressed about the deadline.", 'Máš minutku? Jsem trochu ve stresu kvůli termínu.'),
      m('Sure. What seems to be the problem?', 'Jasně. Co se děje?', "Sure. What's the problem?"),
      t("The client changed their mind and now I have to redo half of it.", 'Klient si to rozmyslel a teď musím půlku předělat.'),
      m('That sounds annoying. When is it due?', 'To zní otravně. Kdy je termín?'),
      t('On Friday, and I still have two other projects.', 'V pátek a ještě mám dva další projekty.'),
      m("Why don't you ask the manager for more time?", 'Proč nepožádáš šéfa o víc času?'),
      t("I'm worried it'll look like I can't cope.", 'Bojím se, že to bude vypadat, že to nezvládám.'),
      m("It wasn't your fault. The client changed the plan.", 'Nebyla to tvoje chyba. Klient změnil plán.', 'It was not your fault. The client changed the plan.'),
      t("You're right. Could you help me with the slides?", 'Máš pravdu. Pomohl bys mi s prezentací?'),
      m("Of course. Let's look at it after lunch.", 'Samozřejmě. Podíváme se na to po obědě.'),
    ],
  },
  {
    id: 'opinion',
    level: 5,
    title: 'Discussing remote work',
    cz: 'Debata o práci z domova',
    setting: 'Diskutujete o výhodách práce z domova.',
    lines: [
      t("Personally, I think working from home is overrated. What's your view?", 'Já osobně si myslím, že práce z domova je přeceňovaná. Jaký máš názor?'),
      m("I see your point, but for me it's been really positive.", 'Chápu, co myslíš, ale pro mě to bylo opravdu pozitivní.', 'I see your point, but for me it has been really positive.'),
      t('In what way?', 'V jakém smyslu?'),
      m("I don't waste two hours a day commuting.", 'Neztrácím dvě hodiny denně dojížděním.', 'I do not waste two hours a day commuting.'),
      t("But don't you miss your colleagues?", 'Ale nechybí ti kolegové?'),
      m('Sometimes, so I go to the office once a week.', 'Někdy ano, tak chodím do kanceláře jednou týdně.'),
      t("I'd find it hard to stay focused at home.", 'Mně by se doma těžko soustředilo.'),
      m('It depends on having a routine and a quiet place to work.', 'Záleží na tom mít režim a klidné místo na práci.'),
      t("So you'd never go back to the office full time?", 'Takže by ses nikdy nevrátil do kanceláře na plný úvazek?'),
      m("Never say never, but I'd need a very good reason.", 'Nikdy neříkej nikdy, ale potřeboval bych hodně dobrý důvod.', 'Never say never, but I would need a very good reason.'),
    ],
  },
];

export function dialogsFor(level: number) {
  return [...DIALOGS].sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level) || a.level - b.level);
}

const DONE = 'ajna-dialogs-done';
export function dialogsDone(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(DONE) ?? '{}');
  } catch {
    return {};
  }
}
export function saveDialogScore(id: string, pct: number) {
  try {
    const all = dialogsDone();
    all[id] = Math.max(all[id] ?? 0, pct);
    localStorage.setItem(DONE, JSON.stringify(all));
  } catch {
    /* optional */
  }
}
