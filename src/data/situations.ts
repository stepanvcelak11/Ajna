// "Co řekneš?" – a situation in Czech, pick the most natural English reaction.
// Wrong options are typical Czech calques, too blunt, or simply not what natives say.
export interface Situation {
  cz: string;
  right: string;
  wrong: [string, string];
  why: string;
  level: number;
}

export const SITUATIONS: Situation[] = [
  // level 1
  { level: 1, cz: 'Někdo ti řekne „Thank you!“', right: "You're welcome.", wrong: ['Please.', 'Nothing.'], why: '„Prosím“ jako odpověď na díky je „You\'re welcome“ (nebo „No problem“). „Please“ se používá jen při žádosti.' },
  { level: 1, cz: 'Chceš v kavárně kávu.', right: "Can I have a coffee, please?", wrong: ['I want coffee.', 'Give me a coffee.'], why: '„I want…“ a „Give me…“ zní v obchodě hrubě. Zdvořile: „Can I have…, please?“' },
  { level: 1, cz: 'Neslyšel jsi, co člověk řekl.', right: 'Sorry, could you say that again?', wrong: ['What?', 'Repeat.'], why: '„What?“ je hodně přímé. „Sorry?“ nebo „Could you say that again?“ je zdvořilé.' },
  { level: 1, cz: 'Někoho poprvé potkáš.', right: 'Nice to meet you.', wrong: ['Nice to know you.', 'I am glad.'], why: 'Při seznámení se říká „Nice to meet you“. „Nice to know you“ se neříká.' },
  { level: 1, cz: 'Kamarád se ptá „How are you?“', right: "I'm good, thanks. And you?", wrong: ['I have good.', 'I am fine, and what you?'], why: 'Odpověď je „I\'m good/fine, thanks. And you?“ – nikdy „I have good“.' },
  { level: 1, cz: 'Chceš vědět, kolik to stojí.', right: 'How much is it?', wrong: ['How many it costs?', 'How much it is?'], why: 'Otázka má obrácený slovosled: „How much is it?“ nebo „How much does it cost?“.' },
  { level: 1, cz: 'Loučíš se s kolegou v pátek.', right: 'Have a nice weekend!', wrong: ['Nice weekend!', 'Have a nice week end you too.'], why: 'Typické přání: „Have a nice/good weekend!“' },
  { level: 1, cz: 'Nerozumíš anglickému slovu.', right: 'What does this word mean?', wrong: ['What means this word?', 'What is meaning this word?'], why: 'Otázka s „mean“ potřebuje „does“: „What does it mean?“' },
  { level: 1, cz: 'Ptáš se, kde je toaleta.', right: 'Where is the toilet, please?', wrong: ['Where is toilet?', 'Where I find WC?'], why: 'Nezapomeň na „the“. V Americe spíš „restroom“ nebo „bathroom“.' },
  { level: 1, cz: 'Omlouváš se, že jdeš pozdě.', right: "Sorry I'm late.", wrong: ['Sorry for my lateness.', 'I am sorry, I come late.'], why: 'Přirozeně a krátce: „Sorry I\'m late.“' },
  { level: 1, cz: 'Chceš zaplatit v restauraci.', right: 'Can we have the bill, please?', wrong: ['We want to pay the count.', 'Bill!'], why: 'V Británii „the bill“, v USA „the check“.' },
  { level: 1, cz: 'Někdo kýchne.', right: 'Bless you!', wrong: ['Health!', 'Good health to you!'], why: 'Na kýchnutí se říká „Bless you!“ (doslova „žehnej ti“).' },
  // level 2
  { level: 2, cz: 'Chceš kolem někoho projít v úzké uličce.', right: 'Excuse me.', wrong: ['Sorry, I go.', 'Make place, please.'], why: '„Excuse me“ používáš, když chceš projít nebo upoutat pozornost.' },
  { level: 2, cz: 'Kamarád ti řekne, že dostal novou práci.', right: "That's great news! Congratulations!", wrong: ['I congratulate you to it.', 'Good for you job.'], why: 'Gratuluje se „Congratulations!“ (vždy s -s) nebo „Well done!“' },
  { level: 2, cz: 'Kamarádovi umřela babička.', right: "I'm so sorry to hear that.", wrong: ['That is bad luck.', 'Oh, pity.'], why: 'Soustrast: „I\'m so sorry (to hear that).“' },
  { level: 2, cz: 'V obchodě se tě ptají „Can I help you?“ a jen se díváš.', right: "I'm just looking, thanks.", wrong: ['No, I only watch.', 'No help.'], why: 'Ustálená fráze: „I\'m just looking, thanks.“' },
  { level: 2, cz: 'Chceš něco navrhnout kamarádovi na víkend.', right: 'Why don\'t we go hiking on Saturday?', wrong: ['What about we go hiking?', 'We could to go hiking.'], why: 'Návrhy: „Why don\'t we…?“, „Let\'s…“, „How about going…?“ (po about je -ing).' },
  { level: 2, cz: 'Telefonuješ a chceš mluvit s Petrem.', right: 'Could I speak to Peter, please?', wrong: ['Is there Peter?', 'I want Peter.'], why: 'Do telefonu: „Could I speak to…?“ nebo „Is Peter there?“' },
  { level: 2, cz: 'Ptáš se cizího člověka na cestu.', right: 'Excuse me, how do I get to the station?', wrong: ['Hello, where is going to station?', 'Tell me way to station.'], why: 'Začni „Excuse me“ a použij „How do I get to…?“' },
  { level: 2, cz: 'Souhlasíš s názorem kamaráda.', right: 'I totally agree.', wrong: ['I am agree.', 'I give you right.'], why: '„Agree“ je sloveso: „I agree“, nikdy „I am agree“.' },
  { level: 2, cz: 'Nabízíš návštěvě něco k pití.', right: 'Would you like something to drink?', wrong: ['Do you want drink something?', 'You will drink?'], why: 'Zdvořilá nabídka: „Would you like…?“' },
  { level: 2, cz: 'Recepční ti něco vysvětlí a ty nerozumíš.', right: "Sorry, I didn't catch that.", wrong: ['I didn\'t understand you nothing.', 'Not understand.'], why: '„I didn\'t catch that“ je přirozené, když jsi něco neslyšel/nepochytil.' },
  { level: 2, cz: 'Doktor se ptá, co ti je.', right: "I've had a headache since Monday.", wrong: ['I have headache from Monday.', 'My head is hurting me from Monday.'], why: 'Od kdy něco trvá: present perfect + since: „I\'ve had… since Monday.“' },
  { level: 2, cz: 'Chceš, aby ti někdo podal sůl.', right: 'Could you pass the salt, please?', wrong: ['Give me salt.', 'Can you give me the salt here?'], why: 'U stolu: „Could you pass the…, please?“' },
  { level: 2, cz: 'Chceš odmítnout pozvání, ale slušně.', right: "I'd love to, but I'm busy that day.", wrong: ['No, I don\'t want.', 'I can\'t, I have no time for you.'], why: 'Zdvořilé odmítnutí: „I\'d love to, but…“' },
  // level 3
  { level: 3, cz: 'Šéf tě požádá o něco, co nestihneš dnes.', right: "I'm afraid I won't be able to finish it today.", wrong: ['I will not make it, sorry.', 'It is not possible today, no.'], why: '„I\'m afraid…“ zjemní špatnou zprávu.' },
  { level: 3, cz: 'Na poradě chceš něco dodat.', right: 'Can I just add something here?', wrong: ['I want to say also.', 'Wait, I speak now.'], why: 'Slušné vstoupení do diskuze: „Can I just add something?“' },
  { level: 3, cz: 'Chceš vyjádřit nesouhlas, ale zdvořile.', right: "I see your point, but I'm not sure that's right.", wrong: ['You are not right.', 'This is nonsense.'], why: 'Angličané nesouhlas zjemňují: „I see your point, but…“' },
  { level: 3, cz: 'Píšeš kolegovi e-mail a chceš ho připomenout.', right: 'Just a quick reminder about tomorrow\'s meeting.', wrong: ['I remind you the meeting.', 'Don\'t forget meeting tomorrow!'], why: '„Just a quick reminder about…“ je zdvořilé a běžné.' },
  { level: 3, cz: 'Kolega ti pomohl s projektem.', right: 'Thanks a lot, I really appreciate it.', wrong: ['I thank you very much for it.', 'You helped, thanks you.'], why: '„I really appreciate it“ zní přirozeně a vděčně.' },
  { level: 3, cz: 'V hotelu chceš reklamovat pokoj.', right: "I'm sorry, but there seems to be a problem with the shower.", wrong: ['Your shower is broken!', 'I have complaint for shower.'], why: 'Stížnost zdvořile: „There seems to be a problem with…“' },
  { level: 3, cz: 'Nevíš odpověď na otázku na pohovoru.', right: "That's a good question. Let me think for a moment.", wrong: ['I don\'t know.', 'Hmm, wait, I am thinking.'], why: 'Získáš čas: „That\'s a good question. Let me think…“' },
  { level: 3, cz: 'Chceš, aby někdo mluvil pomaleji.', right: 'Could you speak a bit more slowly, please?', wrong: ['Speak slower!', 'Can you speak more slow?'], why: 'Příslovce: „more slowly“; „a bit“ to zjemní.' },
  { level: 3, cz: 'Přítel se ptá, jestli půjdeš na večírek. Ještě nevíš.', right: "I'm not sure yet. I'll let you know.", wrong: ['I don\'t know still.', 'Maybe yes, maybe no.'], why: '„I\'ll let you know“ = dám ti vědět.' },
  { level: 3, cz: 'Číšník přinesl něco jiného, než jsi objednal.', right: 'Excuse me, I think this isn\'t what I ordered.', wrong: ['This is bad, I ordered other.', 'You made mistake!'], why: 'Zdvořile a nepřímo: „I think this isn\'t what I ordered.“' },
  { level: 3, cz: 'Kolega se omlouvá, že něco zapomněl.', right: "Don't worry about it.", wrong: ['Nothing happened.', 'It\'s nothing, no problem happened.'], why: '„Nic se nestalo“ = „Don\'t worry about it“ / „No worries“, ne „Nothing happened“.' },
  { level: 3, cz: 'Chceš někomu poradit.', right: 'If I were you, I\'d talk to her.', wrong: ['If I am you, I talk to her.', 'You must talk to her.'], why: 'Rada: „If I were you, I\'d…“ – „must“ zní jako rozkaz.' },
  // level 4
  { level: 4, cz: 'Na meetingu chceš vrátit diskuzi k tématu.', right: "Let's get back to the main point.", wrong: ['We are going out of the topic.', 'Return to theme, please.'], why: '„Let\'s get back to…“ je přirozené. „Téma“ ≠ „theme“, spíš „topic/point“.' },
  { level: 4, cz: 'Klient chce slevu, kterou nemůžeš dát.', right: "I'm afraid that's not something we can offer at the moment.", wrong: ['No discount, sorry.', 'It is impossible to give you it.'], why: 'Diplomaticky: „I\'m afraid that\'s not something we can…“' },
  { level: 4, cz: 'Chceš si ověřit, že jsi správně pochopil zadání.', right: 'Just to make sure I understand, you want…?', wrong: ['Did I understand good?', 'So you want, yes?'], why: '„Just to make sure I understand…“ / „So if I\'ve got this right…“' },
  { level: 4, cz: 'Musíš odmítnout nabídku práce.', right: 'Thank you for the offer, but I\'ve decided to go in a different direction.', wrong: ['I don\'t accept your offer.', 'Sorry, I take another work.'], why: 'Formální odmítnutí poděkuje a nic nevyčítá.' },
  { level: 4, cz: 'Prezentuješ a chceš přejít k dalšímu bodu.', right: "Moving on to the next point…", wrong: ['Now I go to next point.', 'Next theme is…'], why: 'Přechod v prezentaci: „Moving on to…“, „Let\'s now look at…“' },
  { level: 4, cz: 'Někdo ti položí nepříjemnou osobní otázku.', right: "I'd rather not talk about that, if you don't mind.", wrong: ['It is not your business.', 'I don\'t want to answer you.'], why: '„I\'d rather not…“ odmítne zdvořile.' },
  { level: 4, cz: 'Chceš vyjádřit, že s něčím souhlasíš jen částečně.', right: 'I agree up to a point.', wrong: ['I agree on half.', 'I am partly agree.'], why: '„Up to a point“ / „To some extent“ = částečně.' },
  { level: 4, cz: 'Kolega prezentoval skvěle a chceš ho pochválit.', right: 'That was a really impressive presentation.', wrong: ['Your presentation was very good done.', 'You presented very nice.'], why: 'Pochvala: „That was really impressive / You did a great job.“' },
];

export function situationsFor(level: number) {
  const lv = Math.min(level, 4);
  const own = SITUATIONS.filter((s) => s.level === lv);
  const lower = SITUATIONS.filter((s) => s.level < lv);
  return own.length >= 10 ? [...own, ...lower.slice(0, 4)] : [...own, ...lower];
}
