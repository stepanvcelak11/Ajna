// Phrase sprint: short, high-frequency spoken sentences. Czech → say it in English.
// Works fully offline; the answer is checked by fuzzy matching against `en` and `alt`.
// `tip` explains the Czech trap behind the phrase.

export interface Phrase {
  id: string;
  level: 1 | 2 | 3 | 4;
  cz: string;
  en: string;
  alt?: string[];
  tip?: string;
}

type Row = [cz: string, en: string, alt?: string[] | null, tip?: string];

function group(level: Phrase['level'], prefix: string, rows: Row[]): Phrase[] {
  return rows.map(([cz, en, alt, tip], i) => ({ id: `${prefix}${i + 1}`, level, cz, en, alt: alt ?? undefined, tip }));
}

export const PHRASES: Phrase[] = [
  ...group(1, 'a', [
    ['Je mi 25 let.', "I'm 25 years old.", ["I'm 25."], 'Věk se říká s „be“: I am 25, ne „I have 25 years“.'],
    ['Mám hlad.', "I'm hungry.", null, 'Hlad, žízeň, zima: „be“, ne „have“.'],
    ['Je mi zima.', "I'm cold.", null, '„It is cold to me“ neexistuje.'],
    ['Bydlím v Praze.', 'I live in Prague.'],
    ['Pracuju jako učitel.', 'I work as a teacher.', ["I'm a teacher."], 'Povolání má člen: a teacher.'],
    ['Kolik to stojí?', 'How much is it?', ['How much does it cost?', 'How much is this?']],
    ['Můžu platit kartou?', 'Can I pay by card?', null, 'by card, in cash.'],
    ['Nerozumím.', "I don't understand.", null],
    ['Můžete to zopakovat, prosím?', 'Could you repeat that, please?', ['Can you repeat that, please?', 'Could you say that again, please?']],
    ['Mluvte pomaleji, prosím.', 'Could you speak more slowly, please?', ['Please speak more slowly.', 'Can you speak more slowly, please?']],
    ['Kde je nádraží?', 'Where is the train station?', ['Where is the station?', "Where's the train station?"]],
    ['Včera jsem byl doma.', 'I was at home yesterday.', ['Yesterday I was at home.'], 'at home, ne „in home“.'],
    ['Zítra jdu do práce.', "I'm going to work tomorrow.", ['Tomorrow I am going to work.', 'I go to work tomorrow.'], 'go to work bez členu.'],
    ['Mám rád kávu.', 'I like coffee.', ['I love coffee.'], 'Obecně: bez členu (coffee, ne the coffee).'],
    ['Nemám čas.', "I don't have time.", ["I haven't got time.", 'I have no time.']],
    ['Jak se máš?', 'How are you?', ["How's it going?"]],
    ['Mám se dobře, díky.', "I'm fine, thanks.", ["I'm good, thanks.", "I'm doing well, thanks."]],
    ['Máme psa.', 'We have a dog.', ["We've got a dog."]],
    ['Kolik je hodin?', 'What time is it?', null, '„How many hours“ = kolik hodin to trvá.'],
    ['Je pět hodin.', "It's five o'clock.", ["It's five."]],
    ['Jsem unavený.', "I'm tired.", null],
    ['Dáš si čaj?', 'Would you like some tea?', ['Do you want some tea?', 'Would you like a cup of tea?']],
    ['Nevím.', "I don't know.", null],
    ['Promiň, jdu pozdě.', "Sorry, I'm late.", ["Sorry I'm late."]],
    ['Brzy se uvidíme.', 'See you soon.', null],
    ['Můj bratr je starší než já.', 'My brother is older than me.', ['My brother is older than I am.'], 'older THAN, ne „older like“.'],
    ['Venku prší.', "It's raining outside.", ["It's raining."]],
    ['Mám to rád.', 'I like it.', null, 'Předmět se v angličtině nevypouští: like IT.'],
    ['Je to daleko?', 'Is it far?', ['Is it far away?']],
    ['Musím jít.', 'I have to go.', ['I must go.', "I've got to go.", 'I need to go.']],
  ]),
  ...group(2, 'b', [
    ['Těším se na víkend.', "I'm looking forward to the weekend.", null, 'look forward TO + podstatné jméno / -ing.'],
    ['Záleží na počasí.', 'It depends on the weather.', null, 'depend ON, nikdy „depend from“.'],
    ['Už jsem to udělal.', "I've already done it.", ['I already did it.'], 'already → předpřítomný čas.'],
    ['Ještě jsem tam nebyl.', "I haven't been there yet.", null],
    ['Učím se anglicky dva roky.', "I've been learning English for two years.", ["I've learned English for two years."], 'Trvá do teď → present perfect, ne „I learn … two years“.'],
    ['Myslím, že máš pravdu.', 'I think you are right.', ["I think you're right."], 'mít pravdu = BE right.'],
    ['Nemám na to náladu.', "I'm not in the mood for it.", ["I'm not in the mood."]],
    ['Je to na tobě.', "It's up to you.", null],
    ['Nevadí mi to.', "I don't mind.", ["I don't mind it."]],
    ['Dej mi vědět.', 'Let me know.', null],
    ['Zavolám ti později.', "I'll call you later.", null, 'Rozhodnutí teď → will.'],
    ['Můžeš mi pomoct?', 'Can you help me?', ['Could you help me?']],
    ['Půjčíš mi nabíječku?', 'Can I borrow your charger?', ['Could you lend me your charger?', 'Can you lend me your charger?'], 'borrow = půjčit si, lend = půjčit někomu.'],
    ['Zapomněl jsem si klíče.', 'I forgot my keys.', ["I've forgotten my keys.", 'I left my keys at home.']],
    ['Když bude pršet, zůstaneme doma.', "If it rains, we'll stay at home.", ['If it rains, we will stay home.'], 'Po „if“ není will.'],
    ['Zvykám si na nové město.', "I'm getting used to the new city.", null, 'get used to + -ing / podstatné jméno.'],
    ['Měl bys jít k doktorovi.', 'You should see a doctor.', ['You should go to the doctor.', 'You should go to a doctor.']],
    ['Zeptám se ho.', "I'll ask him.", null, 'ask HIM, ne „ask to him“.'],
    ['Čekám na autobus.', "I'm waiting for the bus.", null, 'wait FOR.'],
    ['Poslouchám hudbu.', "I'm listening to music.", null, 'listen TO.'],
    ['Stalo se to minulý týden.', 'It happened last week.', null, 'last week bez „the“ a bez „in“.'],
    ['Šel jsem tam pěšky.', 'I walked there.', ['I went there on foot.']],
    ['Moc se omlouvám.', "I'm really sorry.", ["I'm so sorry.", "I'm very sorry."]],
    ['To je škoda.', "That's a shame.", ["That's a pity.", "What a shame."]],
    ['Nejsem si jistý.', "I'm not sure.", null],
    ['Dobrý nápad!', 'Good idea!', ["That's a good idea!"]],
    ['Nic se nestalo.', 'No problem.', ["It's okay.", "Don't worry about it.", "It's fine."], '„Nothing happened“ zní jako hlášení policii.'],
    ['Jak dlouho to trvá?', 'How long does it take?', null],
    ['Trvá to asi hodinu.', 'It takes about an hour.', null],
    ['Udělal jsem chybu.', 'I made a mistake.', null, 'MAKE a mistake, ne „do“.'],
  ]),
  ...group(3, 'c', [
    ['Ukázalo se, že měl pravdu.', 'It turned out that he was right.', ['It turned out he was right.']],
    ['Nakonec jsme zůstali doma.', 'We ended up staying at home.', ['In the end we stayed at home.', 'We ended up staying home.'], 'end up + -ing.'],
    ['Kdybych měl víc času, cestoval bych.', 'If I had more time, I would travel.', ["If I had more time, I'd travel."], '2. kondicionál: if + minulý čas, would.'],
    ['Nemůžu si dovolit nové auto.', "I can't afford a new car.", null],
    ['Dřív jsem hrával fotbal.', 'I used to play football.', null],
    ['Je to člověk, který mi pomohl.', "He's the person who helped me.", ['He is the man who helped me.', "She's the person who helped me."]],
    ['Neodkládej to.', "Don't put it off.", null],
    ['Došlo nám mléko.', "We've run out of milk.", ['We ran out of milk.']],
    ['Musím na to přijít.', 'I need to figure it out.', ['I have to figure it out.']],
    ['S kolegy vycházím dobře.', 'I get along well with my colleagues.', ['I get on well with my colleagues.']],
    ['Přestal jsem kouřit.', 'I gave up smoking.', ['I quit smoking.', "I've given up smoking."]],
    ['Ozvu se ti do pondělí.', "I'll get back to you by Monday.", null, 'by Monday = nejpozději v pondělí.'],
    ['Je to čím dál dražší.', "It's getting more and more expensive.", null],
    ['Čím dřív, tím líp.', 'The sooner, the better.', null],
    ['Upřímně řečeno, nechce se mi.', "To be honest, I don't feel like it.", null, 'feel like + -ing / it = mít chuť.'],
    ['Nestojí to za to.', "It's not worth it.", null],
    ['Stojí za to to vidět.', "It's worth seeing.", ["It's worth seeing it."], 'worth + -ing.'],
    ['Navrhuju, abychom šli dřív.', 'I suggest we leave earlier.', ['I suggest that we leave earlier.', 'I suggest leaving earlier.'], 'suggest NEVAŽ s „to“: ne „suggest us to“.'],
    ['Nechal jsem si opravit kolo.', 'I had my bike repaired.', ['I got my bike fixed.', 'I had my bike fixed.'], 'have something done.'],
    ['Pokud vím, je zavřeno.', "As far as I know, it's closed.", null],
    ['Mám dojem, že se zlobí.', 'I have a feeling that she is angry.', ["I get the feeling she's angry.", "I have a feeling he's angry."]],
    ['Nebylo to tak špatné, jak jsem čekal.', "It wasn't as bad as I expected.", null],
    ['Zvažuju, že změním práci.', "I'm thinking about changing jobs.", ["I'm considering changing jobs."]],
    ['Bylo by lepší počkat.', 'It would be better to wait.', null],
    ['Stihli jsme vlak na poslední chvíli.', 'We caught the train at the last minute.', null, 'stihnout vlak = CATCH the train.'],
    ['Zmeškal jsem autobus.', 'I missed the bus.', null],
    ['Záleží mi na tom.', 'I care about it.', ['It matters to me.']],
    ['Podle mě je to dobrý nápad.', 'In my opinion, it is a good idea.', ["In my opinion, it's a good idea.", "I think it's a good idea."], '„According to me“ se neříká.'],
  ]),
  ...group(4, 'd', [
    ['Kdybych to věděl, řekl bych ti to.', 'If I had known, I would have told you.', ["If I'd known, I'd have told you."], '3. kondicionál.'],
    ['Měl jsem tě poslechnout.', 'I should have listened to you.', null],
    ['Určitě zapomněl.', 'He must have forgotten.', ['She must have forgotten.'], 'must have + 3. tvar = určitě se to stalo.'],
    ['Kéž bych měl víc času.', 'I wish I had more time.', null],
    ['Než jsme dorazili, film už začal.', 'By the time we arrived, the film had already started.', ['When we arrived, the movie had already started.']],
    ['Prý se stěhují.', "Apparently, they're moving.", ["I heard they're moving.", 'They are said to be moving.']],
    ['Řekl, že přijde později.', 'He said he would come later.', ["He said he'd come later."]],
    ['Navzdory dešti jsme šli ven.', 'Despite the rain, we went out.', ['In spite of the rain, we went out.'], 'despite BEZ „of“.'],
    ['Nejde o peníze.', "It's not about the money.", null],
    ['Je na čase, abychom šli.', "It's time we left.", ["It's time to go.", "It's time for us to go."]],
    ['Nemusel jsi to dělat.', "You didn't have to do that.", ["You needn't have done that."]],
    ['Zítra v tuhle dobu budu sedět v letadle.', "This time tomorrow I'll be sitting on the plane.", null],
    ['Ať se stane cokoliv, nevzdávej to.', "Whatever happens, don't give up.", null],
    ['Nejde mi to do hlavy.', "I can't get my head around it.", null],
    ['To je mimo moji kontrolu.', "That's out of my control.", ["It's beyond my control."]],
    ['Chtěl bych, abys přišel.', "I'd like you to come.", ['I would like you to come.'], 'Ne „I would like that you come“.'],
    ['Zvykl jsem si vstávat brzy.', "I've got used to getting up early.", ["I'm used to getting up early.", 'I got used to getting up early.']],
    ['Kdybys potřeboval pomoc, ozvi se.', 'If you need any help, let me know.', ['Should you need any help, let me know.']],
    ['Čím víc trénuješ, tím je to snazší.', 'The more you practise, the easier it gets.', ['The more you practice, the easier it gets.', 'The more you practise, the easier it becomes.']],
    ['Nedá se nic dělat.', "There's nothing we can do.", ["It can't be helped.", "There's nothing to be done."]],
  ]),
];

export function phrasesFor(level: number) {
  const top = Math.min(4, Math.max(1, level === 5 ? 4 : level));
  // current level plus a bit of the level below for confidence
  return PHRASES.filter((p) => p.level === top || p.level === top - 1);
}
