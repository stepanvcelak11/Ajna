// "Schody" (steps): one tense at a time, from very short sentences to long ones, until you know it.
// Each step is a set of Czech sentences to translate; the last step is writing your own sentences.
// Accepted answers: several strings per item, and "(a|b|)" inside a string means any of the options
// (an empty option = the words can be left out).
import { VERBS } from './verbs';
import type { TenseId } from './tenses';

export interface StepItem {
  cz: string;
  en: string[];
}
export interface Step {
  title: string;
  desc: string;
}

export const STEPS: Step[] = [
  { title: 'Krátké věty', desc: 'Dvě tři slova, jen tvar slovesa' },
  { title: 'Zápor a otázka', desc: 'Stejný čas, ale ne… a …?' },
  { title: 'S podrobnostmi', desc: 'Přidáš kdy, kde a jak často' },
  { title: 'Souvětí', desc: 'Dlouhé věty se dvěma částmi' },
  { title: 'Vlastní věty', desc: 'Napíšeš svoje věty k zadání' },
];
export const FREE_STEP = STEPS.length - 1;
/** correct answers (without help) needed to pass a step */
export const PASS = 5;

type Raw = [string, ...string[]];
const T: Record<TenseId, [Raw[], Raw[], Raw[], Raw[]]> = {
  ps: [
    [
      ['Pracuju.', 'I work.'],
      ['Hraje tenis.', '(He|She) plays tennis.'],
      ['Bydlíme v Praze.', 'We live in Prague.'],
      ['Mám rád čaj.', 'I like tea.', 'I love tea.'],
      ['Mluví anglicky. (on)', 'He speaks English.'],
      ['Pije kávu. (ona)', 'She drinks coffee.'],
    ],
    [
      ['Nepracuju.', "I don't work."],
      ['Nemá rád ryby. (on)', "He doesn't like fish."],
      ['Pracuješ?', 'Do you work?'],
      ['Bydlí tady? (ona)', 'Does she live here?'],
      ['Nekouříme.', "We don't smoke."],
      ['Kde pracuješ?', 'Where do you work?'],
    ],
    [
      ['Každé ráno vstávám v sedm.', 'I get up at seven every morning.', 'Every morning I get up at seven.', 'I get up at seven o\'clock every morning.'],
      ['Moje sestra pracuje v nemocnici.', 'My sister works (in|at) a hospital.'],
      ['Obvykle chodíme do práce pěšky.', 'We usually walk to work.', 'We usually go to work on foot.'],
      ['Večer nikdy nepiju kávu.', 'I never drink coffee in the evening.', 'I never drink coffee at night.', 'In the evening I never drink coffee.'],
      ['Jak často hraješ fotbal?', 'How often do you play football?', 'How often do you play soccer?'],
      ['Vlak odjíždí v osm.', 'The train (leaves|departs|goes) at eight.', "The train (leaves|departs|goes) at eight o'clock."],
    ],
    [
      ['Když prší, zůstávám doma.', 'When it rains, I stay (at|) home.', 'I stay (at|) home when it rains.'],
      ['Můj bratr bydlí v Brně, ale pracuje v Praze.', 'My brother lives in Brno, but he works in Prague.'],
      ['Nechodím často do kina, protože nemám čas.', "I don't (often go|go) to the cinema (often|) because I (don't have|have no) time.", "I don't (often go|go) to the movies (often|) because I (don't have|have no) time."],
      ['Co obvykle děláš o víkendu?', 'What do you usually do (at|on) the weekend?', 'What do you usually do at weekends?'],
      ['Ví, že ji mám rád.', 'She knows (that|) I like her.', 'She knows (that|) I love her.'],
      ['Vstávám brzy, protože začínám v sedm.', 'I get up early because I start at seven.', 'I get up early because I start work at seven.'],
    ],
  ],
  pc: [
    [
      ['Vařím. (právě teď)', "I'm cooking."],
      ['Prší.', "It's raining."],
      ['Čekáme.', "We're waiting."],
      ['Spí. (on)', "He's sleeping."],
      ['Pracuju. (právě teď)', "I'm working."],
      ['Čte knihu. (ona)', "She's reading a book."],
    ],
    [
      ['Neposlouchám.', "I'm not listening."],
      ['Co děláš? (teď)', 'What are you doing?'],
      ['Neprší.', "It isn't raining.", "It's not raining."],
      ['Spíš?', 'Are you sleeping?', 'Are you asleep?'],
      ['Proč pláčeš?', 'Why are you crying?'],
      ['Dnes nepracuje. (on)', "He isn't working today.", "He's not working today.", "Today he isn't working."],
    ],
    [
      ['Zrovna vařím večeři.', "I'm cooking dinner (right now|at the moment|now).", "(Right now|At the moment) I'm cooking dinner.", "I'm making dinner (right now|at the moment|now)."],
      ['Tento týden bydlím u sestry.', "I'm staying (with|at) my sister('s|) this week.", "This week I'm staying (with|at) my sister('s|)."],
      ['Děti si hrají na zahradě.', 'The (children|kids) are playing in the garden.'],
      ['Podívej, sněží!', "Look, it's snowing!", "Look! It's snowing!"],
      ['Na co se díváš?', 'What are you looking at?', 'What are you watching?'],
      ['Ceny pořád rostou.', 'Prices are still (going up|rising).', 'Prices keep (going up|rising).'],
    ],
    [
      ['Teď nemůžu mluvit, protože řídím.', "I can't talk (now|right now) because I'm driving.", "I can't speak (now|right now) because I'm driving."],
      ['Momentálně se učím anglicky, protože chci pracovat v Londýně.', "(At the moment|Right now|Now) I'm (learning|studying) English because I want to work in London.", "I'm (learning|studying) English (at the moment|right now|now) because I want to work in London."],
      ['Zítra večer se vidím s Tomem. (domluveno)', "I'm (meeting|seeing) Tom tomorrow evening.", "Tomorrow evening I'm (meeting|seeing) Tom.", "I'm (meeting|seeing) Tom tomorrow night."],
      ['Buď potichu, miminko spí.', 'Be quiet, the baby is sleeping.', 'Be quiet, the baby is asleep.'],
      ['Proč se směješ? Na co myslíš?', 'Why are you laughing? What are you thinking about?', 'Why are you laughing? What are you thinking of?'],
      ['Obvykle jezdím autem, ale tento týden jezdím vlakem.', "I usually (go|travel) by car, but this week I'm (going|travelling|traveling) by train.", "I usually drive, but this week I'm taking the train.", "I usually drive, but this week I'm going by train."],
    ],
  ],
  pas: [
    [
      ['Pracoval jsem.', 'I worked.'],
      ['Viděl jsem ho.', 'I saw him.'],
      ['Volala mi.', 'She (called|phoned|rang) me.'],
      ['Šli jsme domů.', 'We went home.', 'We walked home.'],
      ['Koupil jsem auto.', 'I bought a car.'],
      ['Zavolali policii.', 'They called the police.', 'They phoned the police.'],
    ],
    [
      ['Neviděl jsem to.', "I didn't see it.", "I didn't see that."],
      ['Nepřišla.', "She didn't come."],
      ['Kdy jsi přijel?', 'When did you (arrive|come|get here)?'],
      ['Líbilo se ti to?', 'Did you like it?', 'Did you enjoy it?'],
      ['Nevěděl jsem to.', "I didn't know (it|that|)."],
      ['Co jsi dělal včera?', 'What did you do yesterday?'],
    ],
    [
      ['Včera jsem šel do kina.', 'I went to the (cinema|movies) yesterday.', 'Yesterday I went to the (cinema|movies).'],
      ['Minulý rok jsme byli v Itálii.', '(We were in|We went to) Italy last year.', 'Last year (we were in|we went to) Italy.'],
      ['Před dvěma dny mi volala.', 'She (called|phoned|rang) me two days ago.', 'Two days ago she (called|phoned|rang) me.'],
      ['V kolik jsi včera vstal?', 'What time did you get up yesterday?', 'When did you get up yesterday?'],
      ['V sobotu jsem nikam nešel.', "I didn't go anywhere on Saturday.", "On Saturday I didn't go anywhere.", 'I went nowhere on Saturday.'],
      ['Narodil jsem se v Brně.', 'I was born in Brno.'],
    ],
    [
      ['Když jsem přišel domů, uvařil jsem večeři.', 'When I (came|got) home, I (cooked|made) dinner.', 'I (cooked|made) dinner when I (came|got) home.'],
      ['Zavolal jsem jí, ale nezvedla to.', "I (called|phoned|rang) her, but she didn't (answer|pick up)."],
      ['Včera jsem nešel do práce, protože jsem byl nemocný.', "I didn't go to work yesterday because I was (ill|sick).", "Yesterday I didn't go to work because I was (ill|sick)."],
      ['Kde jste byli o prázdninách a co jste tam dělali?', 'Where (were you|did you go) (on|for) (holiday|vacation) and what did you do there?'],
      ['Vstal jsem, osprchoval se a šel do práce.', 'I got up, (had a shower|took a shower|showered) and went to work.'],
      ['Když mi bylo deset, bydleli jsme v Ostravě.', 'When I was ten, we lived in Ostrava.', 'We lived in Ostrava when I was ten.'],
    ],
  ],
  pac: [
    [
      ['Spal jsem. (zrovna v tu chvíli)', 'I was sleeping.', 'I was asleep.'],
      ['Pršelo. (zrovna v tu chvíli)', 'It was raining.'],
      ['Čekali jsme.', 'We were waiting.'],
      ['Vařila. (zrovna v tu chvíli)', 'She was cooking.'],
      ['Dívali se na televizi. (zrovna)', 'They were watching (TV|television).'],
      ['Řídil jsem. (zrovna)', 'I was driving.'],
    ],
    [
      ['Neposlouchal jsem.', "I wasn't listening."],
      ['Co jsi dělal? (v tu chvíli)', 'What were you doing?'],
      ['Nepršelo.', "It wasn't raining."],
      ['Spal jsi? (když jsem volal)', 'Were you sleeping?', 'Were you asleep?'],
      ['Proč plakala?', 'Why was she crying?'],
      ['Nepracovali. (v tu chvíli)', "They weren't working."],
    ],
    [
      ['Včera v osm jsem večeřel.', 'I was (having|eating) dinner at eight yesterday.', '(At eight yesterday|Yesterday at eight) I was (having|eating) dinner.'],
      ['Celé odpoledne pršelo.', 'It was raining all afternoon.', 'All afternoon it was raining.', 'It was raining the whole afternoon.'],
      ['Co jsi dělal včera v deset večer?', 'What were you doing at ten (last night|yesterday evening|in the evening yesterday)?', 'What were you doing yesterday at ten in the evening?'],
      ['Děti si hrály venku.', 'The (children|kids) were playing outside.'],
      ['V té době jsem bydlel v Londýně.', 'At that time I was living in London.', 'I was living in London at that time.'],
      ['Seděla u okna a četla.', 'She was sitting (by|at) the window and (she was|) reading.'],
    ],
    [
      ['Když jsem se sprchoval, zazvonil telefon.', '(When|While) I was (having|taking) a shower, the phone rang.', 'The phone rang (when|while) I was (having|taking) a shower.', '(When|While) I was showering, the phone rang.'],
      ['Zatímco jsem vařil, on se díval na televizi.', 'While I was cooking, he was watching (TV|television).', 'He was watching (TV|television) while I was cooking.'],
      ['Šel jsem domů, když jsem potkal Petra.', 'I was (walking|going) home when I met Petr.'],
      ['Když jsme přišli, všichni tančili.', 'When we (came|arrived|got there), (everyone|everybody) was dancing.'],
      ['Neslyšel jsem tě, protože jsem poslouchal hudbu.', "I didn't hear you because I was listening to music."],
      ['Pršelo, tak jsme zůstali doma.', 'It was raining, so we stayed (at|) home.'],
    ],
  ],
  pp: [
    [
      ['Už jsem jedl.', "I've already eaten.", "I've eaten already.", "I've eaten."],
      ['Ztratil jsem klíče.', "I've lost my keys."],
      ['Byl jsem v Londýně. (někdy v životě)', "I've been to London."],
      ['Dokončila to.', "She's finished it.", "She's done it."],
      ['Ten film jsme viděli.', "We've seen (that|this|the) film."],
      ['Přijeli. (a jsou tu)', "They've arrived.", "They've come."],
    ],
    [
      ['Ještě jsem nejedl.', "I haven't eaten yet."],
      ['Byl jsi někdy v Paříži?', 'Have you ever been to Paris?'],
      ['Nikdy jsem to neviděl.', "I've never seen (it|that)."],
      ['Už jsi skončil?', 'Have you finished (yet|already|)?', 'Have you done it (yet|already|)?'],
      ['Ještě nezavolal.', "He hasn't (called|phoned|rung) yet."],
      ['Kolikrát jsi tam byl?', 'How many times have you been there?'],
    ],
    [
      ['Bydlím tady od roku 2020.', "I've (lived|been living) here since 2020."],
      ['Znám ho deset let.', "I've known him for ten years."],
      ['Tento týden jsem hodně pracoval.', "I've (worked|been working) a lot this week.", "This week I've (worked|been working) a lot."],
      ['Právě jsem dostal tvou zprávu.', "I've just (got|gotten|received) your message."],
      ['Ještě nikdy jsem neletěl letadlem.', "I've never flown (before|).", "I've never been on a plane (before|).", "I've never (travelled|traveled) by plane (before|)."],
      ['Už jsi napsal ten e-mail?', 'Have you written (that|the) (email|e-mail) (yet|)?', 'Have you already written (that|the) (email|e-mail)?'],
    ],
    [
      ['Nemůžu jít ven, protože jsem ztratil klíče.', "I can't go out because I've lost my keys."],
      ['V Anglii jsem byl třikrát, ale ve Skotsku nikdy.', "I've been to England three times, but I've never been to Scotland.", "I've been to England three times, but never to Scotland."],
      ['Neviděl jsem ho od té doby, co jsme se přestěhovali.', "I haven't seen him since we moved."],
      ['Jedl jsi už někdy něco tak dobrého?', 'Have you ever eaten (anything|something) so good?', 'Have you ever eaten anything as good as this?'],
      ['Jsem unavený, protože jsem dnes hodně pracoval.', "I'm tired because I've (worked|been working) a lot today."],
      ['Ceny za poslední rok hodně vzrostly.', 'Prices have (gone up|risen|increased) a lot (in|over) the (last|past) year.'],
    ],
  ],
  ppc: [
    [
      ['Čekám. (už nějakou dobu)', "I've been waiting."],
      ['Pracuju. (už od rána)', "I've been working."],
      ['Pršelo. (a je mokro)', "It's been raining."],
      ['Běhal jsem. (proto jsem zpocený)', "I've been running."],
      ['Učí se. (ona, už nějakou dobu)', "She's been (studying|learning)."],
      ['Plakala. (má červené oči)', "She's been crying."],
    ],
    [
      ['Jak dlouho čekáš?', 'How long have you been waiting?'],
      ['Poslední dobou nespím dobře.', "I haven't been sleeping well (lately|recently|)."],
      ['Co jsi dělal? (jsi celý od barvy)', 'What have you been doing?'],
      ['Jak dlouho se učíš anglicky?', 'How long have you been (learning|studying) English?'],
      ['Poslední dobou moc nepracuje. (on)', "He hasn't been working much (lately|recently|)."],
      ['Jak dlouho tu bydlíš?', 'How long have you been living here?', 'How long have you lived here?'],
    ],
    [
      ['Čekám tu už hodinu.', "I've been waiting here for (an|one) hour.", "I've been waiting for (an|one) hour."],
      ['Celý den prší.', "It's been raining all day.", "It's been raining the whole day."],
      ['Od září se učím anglicky.', "I've been (learning|studying) English since September."],
      ['Poslední dobou hodně pracuju.', "I've been working a lot (lately|recently).", "(Lately|Recently) I've been working a lot."],
      ['Tu silnici opravují už tři měsíce.', "They've been (repairing|fixing) (the|that|this) road for three months."],
      ['Dvě hodiny se dívá na televizi. (on)', "He's been watching (TV|television) for two hours."],
    ],
    [
      ['Jsem unavený, protože jsem celý den uklízel.', "I'm tired because I've been cleaning all day.", "I'm tired because I've been cleaning the whole day."],
      ['Máš mokré vlasy. Plaval jsi?', '(Your hair is|Your hair\'s) wet. Have you been swimming?'],
      ['Učím se anglicky dva roky a pořád dělám chyby.', "I've been (learning|studying) English for two years (and|but) I still make mistakes."],
      ['Jak dlouho spolu chodíte?', 'How long have you been (going out|dating|seeing each other) (together|)?'],
      ['Bolí mě oči, protože jsem celý den pracoval u počítače.', "My eyes hurt because I've been working (on|at) the computer all day."],
      ['Volám ti od rána, kde jsi byl?', "I've been (calling|phoning|ringing) you since (this|the) morning, where have you been?"],
    ],
  ],
  pap: [
    [
      ['Už odešel. (než jsem přišel)', 'He had (already|) left.', 'He had (already|) gone.'],
      ['Už jsem jedl. (než přišli)', 'I had (already|) eaten.'],
      ['Zapomněla to. (ještě předtím)', 'She had forgotten (it|).'],
      ['Film už začal. (když jsme přišli)', 'The (film|movie) had (already|) started.', 'The (film|movie) had (already|) begun.'],
      ['Ztratil klíče. (ještě předtím)', 'He had lost his keys.'],
      ['Prodali dům. (ještě předtím)', 'They had sold (the|their) house.'],
    ],
    [
      ['Předtím jsem ho neviděl.', "I hadn't seen him before."],
      ['Nikdy předtím jsem neletěl.', 'I had never flown before.', 'I had never been on a plane before.'],
      ['Byl jsi tam už předtím?', 'Had you been there before?'],
      ['Ještě nepřijeli. (v tu chvíli)', "They hadn't arrived yet.", "They hadn't come yet."],
      ['Nesnídala. (ještě předtím)', "She hadn't had breakfast.", "She hadn't eaten breakfast."],
      ['Proč odešel tak brzy? (než jsem přišel)', 'Why had he left so early?'],
    ],
    [
      ['Když jsem přišel, film už začal.', 'When I (arrived|came|got there), the (film|movie) had already (started|begun).'],
      ['Do té doby jsem nikdy nebyl v zahraničí.', '(Until then|Before that|Before then) I had never been abroad.', 'I had never been abroad (until then|before that|before then).'],
      ['Předtím jsem ho dvakrát potkal.', 'I had met him twice before.', 'I had met him twice before that.'],
      ['Když jsem dorazil na nádraží, vlak už odjel.', 'When I (got to|arrived at|came to) the station, the train had already (left|gone).'],
      ['Byla unavená, protože špatně spala.', "She was tired because she had slept badly.", "She was tired because she hadn't slept well."],
      ['Poté, co jsme dojedli, šli jsme ven.', 'After we had (eaten|finished eating|finished dinner|had dinner), we went out.'],
    ],
    [
      ['Uvědomil jsem si, že jsem nechal peněženku doma.', 'I (realised|realized) (that|) I had (left|forgotten) my wallet (at|) home.'],
      ['Když jsme přišli na večírek, většina lidí už odešla.', 'When we (got to|arrived at|came to) the party, most (of the|) people had already (left|gone).'],
      ['Řekla mi, že ten film už viděla.', 'She told me (that|) she had already seen (the|that) (film|movie).', 'She told me (that|) she had seen (the|that) (film|movie) already.'],
      ['Nikdy předtím jsem nejedl sushi, tak jsem byl nervózní.', 'I had never eaten sushi before, so I was nervous.', 'I had never had sushi before, so I was nervous.'],
      ['Poté, co dokončil práci, šel domů.', 'After he had finished (his|) work, he went home.', 'He went home after he had finished (his|) work.'],
      ['Byl jsem naštvaný, protože na mě zapomněli.', 'I was (angry|upset|annoyed) because they had forgotten (about|) me.'],
    ],
  ],
  will: [
    [
      ['Zavolám ti.', "I'll (call|phone|ring) you."],
      ['Pomůžu ti.', "I'll help you."],
      ['Vezmu si to.', "I'll take it."],
      ['Uvidíme.', "We'll see."],
      ['Bude se ti to líbit.', "You'll like it.", "You'll love it."],
      ['Udělám to zítra.', "I'll do it tomorrow."],
    ],
    [
      ['Nezapomenu.', "I won't forget."],
      ['Pomůžeš mi?', 'Will you help me?'],
      ['Nebude to dlouho trvat.', "It won't take long."],
      ['Nikomu to neřeknu.', "I won't tell anyone.", "I won't tell anybody."],
      ['Myslíš, že vyhrají?', 'Do you think (that|) they will win?'],
      ['Otevřeš okno, prosím?', 'Will you open the window, please?'],
    ],
    [
      ['Myslím, že zítra bude hezky.', "I think (that|) it will be (nice|sunny) tomorrow.", "I think (that|) the weather will be (nice|good) tomorrow.", "I think (that|) tomorrow it will be nice."],
      ['Asi přijdu pozdě.', "I'll probably be late.", "I'll probably come late."],
      ['Zavolám ti zítra ráno.', "I'll (call|phone|ring) you tomorrow morning.", "Tomorrow morning I'll (call|phone|ring) you."],
      ['Za pár let budou auta jezdit sama.', 'In a few years(,|) cars will drive (themselves|by themselves).'],
      ['Počkej, pomůžu ti s taškami.', "Wait, I'll help you with (the|your) bags."],
      ['Dám si to kuře, prosím.', "I'll have the chicken, please."],
    ],
    [
      ['Jestli bude pršet, zůstaneme doma.', "If it rains, we'll stay (at|) home.", "We'll stay (at|) home if it rains."],
      ['Až přijdu domů, zavolám ti.', "When I get home, I'll (call|phone|ring) you.", "I'll (call|phone|ring) you when I get home."],
      ['Neboj se, nikomu to neřeknu.', "Don't worry, I won't tell anyone.", "Don't worry, I won't tell anybody."],
      ['Myslím, že ten test nebude těžký.', "I (don't think|do not think) the test will be (difficult|hard).", "I think (that|) the test won't be (difficult|hard)."],
      ['Jestli budeš mít čas, pomůžeš mi?', 'If you have time, will you help me?', 'Will you help me if you have time?'],
      ['Je zima, zavřu okno.', "It's cold, (so|) I'll (close|shut) the window."],
    ],
  ],
  going: [
    [
      ['Budu vařit. (mám to v plánu)', "I'm going to cook."],
      ['Bude pršet. (vidím mraky)', "It's going to rain."],
      ['Koupíme si auto. (už jsme se rozhodli)', "We're going to buy a car."],
      ['Bude se stěhovat. (ona, plánuje to)', "She's going to move."],
      ['Budu se učit. (mám to v plánu)', "I'm going to (study|learn)."],
      ['Spadne to!', "It's going to fall!"],
    ],
    [
      ['Nebudu čekat. (rozhodl jsem se)', "I'm not going to wait."],
      ['Co budeš dělat? (jaký máš plán)', 'What are you going to do?'],
      ['Budeš to jíst?', 'Are you going to eat (that|it|this)?'],
      ['Nepůjdeme tam. (rozhodli jsme se)', "We aren't going to go there.", "We're not going to go there."],
      ['Kdy mu to řekneš?', 'When are you going to tell him?'],
      ['Nebude to snadné.', "It isn't going to be easy.", "It's not going to be easy."],
    ],
    [
      ['Příští rok budu studovat v Anglii.', "I'm going to study in England next year.", "Next year I'm going to study in England."],
      ['O víkendu budeme malovat byt.', "We're going to paint (the|our) (flat|apartment) (at|on|this) (the|) weekend.", "(At|On|This) (the|) weekend we're going to paint (the|our) (flat|apartment)."],
      ['Podívej, ten kluk spadne z kola!', "Look, (that|the) boy is going to fall off (his|the) (bike|bicycle)!"],
      ['Dnes večer se budu dívat na zápas.', "I'm going to watch the (match|game) tonight.", "Tonight I'm going to watch the (match|game)."],
      ['Odteď budu chodit do práce pěšky.', "From now on(,|) I'm going to walk to work."],
      ['Kde budete bydlet? (máte plán)', 'Where are you going to live?'],
    ],
    [
      ['Rozhodl jsem se, že začnu běhat.', "I've decided (that|) I'm going to start running.", "I decided (that|) I'm going to start running.", "I've decided to start running."],
      ['Je hrozný provoz, přijdeme pozdě.', "(The traffic is|There's) terrible (traffic|), we're going to be late."],
      ['Až dodělám školu, budu cestovat.', "When I finish school, I'm going to travel.", "I'm going to travel when I finish school."],
      ['Co budeš dělat, až budeš v důchodu?', 'What are you going to do when you (retire|are retired)?'],
      ['Nebudu mu volat, protože se na mě zlobí.', "I'm not going to (call|phone|ring) him because he's angry (with|at) me."],
      ['Prodáme dům a přestěhujeme se k moři.', "We're going to sell (the|our) house and move to the (sea|seaside|coast)."],
    ],
  ],
  fc: [
    [
      ['Budu pracovat. (v tu dobu)', "I'll be working."],
      ['Budeme čekat.', "We'll be waiting."],
      ['Bude spát. (on, v tu dobu)', "He'll be sleeping."],
      ['Budu cestovat. (v tu dobu)', "I'll be (travelling|traveling)."],
      ['Budou jíst. (v tu dobu)', "They'll be eating."],
      ['Bude pršet. (celý den)', "It'll be raining."],
    ],
    [
      ['Nebudu pracovat. (v tu dobu)', "I won't be working."],
      ['Budeš zítra potřebovat auto?', 'Will you be using the car tomorrow?', 'Will you be needing the car tomorrow?'],
      ['Co budeš dělat v osm?', "What will you be doing at eight (o'clock|)?"],
      ['Nebudeme se dívat. (v tu dobu)', "We won't be watching."],
      ['Budeš zítra pracovat?', 'Will you be working tomorrow?'],
      ['Nebude spát. (ona, v tu dobu)', "She won't be sleeping."],
    ],
    [
      ['Zítra v tuhle dobu budu ležet na pláži.', "This time tomorrow I'll be lying on the beach.", "I'll be lying on the beach this time tomorrow."],
      ['V osm budu ještě pracovat.', "At eight I'll still be working.", "I'll still be working at eight."],
      ['Budeme na tebe čekat před kinem.', "We'll be waiting for you (in front of|outside) the cinema."],
      ['Příští týden budu celý týden cestovat.', "I'll be (travelling|traveling) all next week.", "Next week I'll be (travelling|traveling) (all week|the whole week)."],
      ['Nevolej v sedm, budu vařit.', "Don't (call|phone|ring) at seven, I'll be cooking."],
      ['Co budeš dělat zítra odpoledne?', 'What will you be doing tomorrow afternoon?'],
    ],
    [
      ['Až přijdeš, asi budu ještě spát.', "When you (come|arrive|get here), I'll probably still be sleeping.", "I'll probably still be sleeping when you (come|arrive|get here)."],
      ['Zítra v deset budu psát test, tak mi nepiš.', "(At ten tomorrow|Tomorrow at ten) I'll be (writing|taking|doing) a test, so don't (text|message|write to) me.", "I'll be (writing|taking|doing) a test at ten tomorrow, so don't (text|message|write to) me."],
      ['Pojedeš kolem obchodu? Můžeš mi koupit chleba?', 'Will you be going (past|by) the shop? (Can|Could) you buy me (some|) bread?', 'Will you be passing the shop? (Can|Could) you buy me (some|) bread?'],
      ['Za rok touhle dobou budu bydlet v Londýně.', "This time next year I'll be living in London.", "I'll be living in London this time next year."],
      ['Neboj, budeme na tebe myslet.', "Don't worry, we'll be thinking (of|about) you."],
      ['Celé odpoledne budu pracovat, tak se uvidíme večer.', "I'll be working all afternoon, so I'll see you (in the evening|tonight).", "I'll be working all afternoon, so see you (in the evening|tonight)."],
    ],
  ],
  fp: [
    [
      ['Do té doby skončím.', "I'll have finished by then."],
      ['Do pátku to dodělám.', "I'll have (finished|done) it by Friday."],
      ['Do té doby odejdou.', "They'll have left by then.", "They'll have gone by then."],
      ['Do zítřka to přečtu.', "I'll have read it by tomorrow."],
      ['Do večera dorazí. (on)', "He'll have arrived by (the evening|tonight|this evening)."],
      ['Do té doby zapomenu.', "I'll have forgotten by then.", "I'll have forgotten it by then."],
    ],
    [
      ['Do té doby nebudu hotový.', "I won't have finished by then."],
      ['Budeš to mít do pátku hotové?', 'Will you have (finished|done) it by Friday?'],
      ['Do zítřka to nestihnu.', "I won't have (finished|done) it by tomorrow."],
      ['Do osmi nedorazí. (oni)', "They won't have arrived by eight."],
      ['Kolik do té doby ušetříš?', 'How much will you have saved by then?'],
      ['Budou do té doby hotoví?', 'Will they have finished by then?'],
    ],
    [
      ['Do konce roku ušetřím hodně peněz.', "I'll have saved a lot of money by the end of the year.", "By the end of the year I'll have saved a lot of money."],
      ['Do pěti dokončím tu zprávu.', "I'll have finished the report by five (o'clock|).", "By five (o'clock|) I'll have finished the report."],
      ['Příští měsíc tu budu pracovat deset let.', "Next month I'll have (worked|been working) here for ten years.", "I'll have (worked|been working) here for ten years next month."],
      ['Do té doby už odjedou.', "They'll have already left by then.", "By then they'll have (already|) left.", "They'll have left by then."],
      ['Do zítřka to opravíme.', "We'll have (fixed|repaired) it by tomorrow."],
      ['Do léta zhubnu pět kilo.', "I'll have lost five (kilos|kilograms|kg) by (the|) summer.", "By (the|) summer I'll have lost five (kilos|kilograms|kg)."],
    ],
    [
      ['Než přijdeš, uvařím večeři.', "I'll have (cooked|made) dinner by the time you (come|arrive|get here).", "By the time you (come|arrive|get here), I'll have (cooked|made) dinner."],
      ['Než tam dorazíme, film už skončí.', 'By the time we get there, the (film|movie) will have (already|) (finished|ended).'],
      ['Do konce kurzu se naučím spoustu nových slov.', "By the end of the course(,|) I'll have (learned|learnt) a lot of new words.", "I'll have (learned|learnt) a lot of new words by the end of the course."],
      ['Do příštího roku dostuduju a najdu si práci.', "By next year(,|) I'll have finished (my studies|school|university) and found a job."],
      ['Než mi odpovíš, zapomenu, na co jsem se ptal.', "By the time you (answer|reply), I'll have forgotten what I asked."],
      ['Za týden už budou zpátky z dovolené.', "In a week they'll have (come|got) back from (their|) (holiday|vacation)."],
    ],
  ],
};

/** Ideas for writing your own sentences (last step). */
export const FREE: Record<TenseId, string[]> = {
  ps: ['Co děláš každé ráno?', 'Kde pracuje nebo co dělá někdo z tvé rodiny?', 'Co nikdy neděláš? (zápor)', 'Jak často sportuješ? (otázka nebo věta)'],
  pc: ['Co právě teď děláš?', 'Co právě dělají lidé kolem tebe?', 'Co se tento týden učíš nebo na čem pracuješ?', 'Polož kamarádovi otázku, co zrovna dělá.'],
  pas: ['Co jsi dělal včera večer?', 'Kam jsi jel na poslední dovolenou?', 'Co jsi včera nestihl? (zápor)', 'Zeptej se kamaráda na jeho víkend.'],
  pac: ['Co jsi dělal včera v osm večer?', 'Co jsi dělal, když ti naposledy někdo zavolal?', 'Co se dělo kolem tebe, když jsi dnes ráno odcházel z domu?', 'Zeptej se, co někdo dělal včera v poledne.'],
  pp: ['Kde všude jsi už v životě byl?', 'Co jsi dnes už stihl udělat?', 'Co jsi ještě nikdy nedělal? (never)', 'Jak dlouho znáš svého nejlepšího kamaráda? (for / since)'],
  ppc: ['Co děláš už od rána?', 'Jak dlouho se učíš anglicky? (for / since)', 'Proč jsi unavený? Co jsi dělal?', 'Zeptej se někoho, jak dlouho na tebe čeká.'],
  pap: ['Co se stalo předtím, než jsi dnes odešel z domu?', 'Co jsi nikdy neudělal, než ti bylo osmnáct?', 'Kdy jsi přišel pozdě a co se už stalo?', 'Napiš, proč byl někdo naštvaný (co se stalo předtím).'],
  will: ['Co si myslíš, že se stane za deset let?', 'Slib někomu něco.', 'Co uděláš, když zítra bude pršet? (If…)', 'Nabídni někomu pomoc.'],
  going: ['Co máš v plánu o víkendu?', 'Co se chystáš udělat příští rok?', 'Podívej se kolem sebe: co se brzy stane?', 'Zeptej se kamaráda na jeho plány.'],
  fc: ['Co budeš dělat zítra v tuhle dobu?', 'Co budeš dělat v sobotu v deset ráno?', 'Kde budeš bydlet za pět let?', 'Zeptej se, co bude někdo dělat dnes večer.'],
  fp: ['Co budeš mít hotové do konce týdne?', 'Co stihneš do konce roku?', 'Co se stane, než dorazíš domů? (By the time…)', 'Kolik toho do léta ušetříš nebo se naučíš?'],
};

/** "(a|b|)" → every combination. */
export function expand(s: string): string[] {
  const m = s.match(/\(([^()]*\|[^()]*)\)/);
  if (!m) return [s];
  return m[1].split('|').flatMap((opt) => expand(s.replace(m[0], opt)));
}

export function stepItems(t: TenseId, step: number): StepItem[] {
  return (T[t][step] ?? []).map(([cz, ...en]) => ({ cz, en: en.flatMap(expand) }));
}

// ---------------------------------------------------------------------------------------------
// Which tense(s) does a free sentence use? A rough offline check for the "own sentences" step.

const EXTRA = ['learnt', 'burnt', 'dreamt', 'spelt', 'spoilt', 'smelt'];
const IRR_PAST = new Set([...VERBS.flatMap((v) => v.past.split('/')).filter((p) => !VERBS.some((v) => v.base === p)), ...EXTRA]);
const IRR_PP = new Set([...VERBS.flatMap((v) => v.pp.split('/')), ...EXTRA, 'gotten']);
const ADJ_ED = new Set(['tired', 'bored', 'interested', 'excited', 'married', 'worried', 'scared', 'surprised', 'pleased', 'closed', 'tired', 'annoyed', 'confused', 'relaxed', 'stressed']);
const DET = new Set(['my', 'your', 'his', 'her', 'our', 'their', 'the', 'a', 'an', 'this', 'that']);
const NOT_ING = new Set(['thing', 'king', 'ring', 'sing', 'bring', 'spring', 'string', 'wing', 'morning', 'evening', 'nothing', 'something', 'anything', 'everything', 'during', 'ceiling', 'wedding', 'boring', 'interesting', 'amazing', 'exciting']);
const SKIP = new Set(['not', 'never', 'already', 'just', 'ever', 'still', 'always', 'probably', 'really', 'also', 'definitely', 'certainly', 'soon', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'there', 'this', 'that', 'the', 'my', 'your', 'his', 'her', 'our', 'their', 'a', 'an']);
const SUBJ = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they']);
const MODAL = new Set(['can', 'could', 'should', 'must', 'might', 'may', 'would', 'will', 'shall', 'to', 'do', 'does', 'did', 'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', "'s", 'not', 'never', 'going']);

const isIng = (w: string) => w.length > 4 && w.endsWith('ing') && !NOT_ING.has(w);
const isPP = (w: string) => IRR_PP.has(w) || (w.length > 3 && w.endsWith('ed'));
const isPast = (w: string) => IRR_PAST.has(w) || (w.length > 3 && w.endsWith('ed'));

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bcan't\b|\bcannot\b/g, 'can not')
    .replace(/n't\b/g, ' not')
    .replace(/'ll\b/g, ' will')
    .replace(/'ve\b/g, ' have')
    .replace(/'re\b/g, ' are')
    .replace(/\bi'm\b/g, 'i am')
    .replace(/'d\b/g, ' had')
    .replace(/'s\b/g, " 's")
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

const FREQ = new Set(['usually', 'often', 'sometimes', 'always', 'never', 'also', 'rarely', 'normally', 'still']);
/** "my sister (usually) works": a determiner + noun right before the verb */
function nounSubject(w: string[], i: number) {
  let k = i - 1;
  while (k >= 0 && FREQ.has(w[k])) k--;
  return (k >= 1 && DET.has(w[k - 1]) && !SKIP.has(w[k]) && !MODAL.has(w[k])) || ['he', 'she', 'it'].includes(w[k] ?? '');
}

export function detectTenses(s: string): Set<TenseId> {
  const w = tokens(s);
  const out = new Set<TenseId>();
  const used = new Set<number>();
  const next = (i: number) => {
    let j = i + 1;
    for (let k = 0; k < 4 && j < w.length && SKIP.has(w[j]); k++) j++;
    return j;
  };
  for (let i = 0; i < w.length; i++) {
    const a = w[i];
    const j = next(i);
    const b = w[j] ?? '';
    const c = w[next(j)] ?? '';
    if (a === 'will' || a === 'shall') {
      if (b === 'have' && (isPP(c) || c === 'been')) out.add('fp');
      else if (b === 'be' && isIng(c)) out.add('fc');
      else if (b) out.add('will');
      used.add(j);
    } else if (['am', 'is', 'are', "'s"].includes(a)) {
      if (b === 'going' && w[j + 1] === 'to') {
        out.add('going');
        used.add(j);
      } else if (isIng(b)) {
        out.add('pc');
        used.add(j);
      } else if (a === "'s" && b === 'been') {
        out.add(isIng(c) ? 'ppc' : 'pp');
        used.add(j);
      } else if (a === "'s" && ((IRR_PP.has(b) && !IRR_PAST.has(b)) || (isPP(b) && !ADJ_ED.has(b)))) {
        out.add('pp');
        used.add(j);
      } else if (a !== "'s" || SUBJ.has(w[i - 1] ?? '')) out.add('ps');
    } else if (a === 'was' || a === 'were') {
      if (isIng(b) && !(b === 'going' && w[j + 1] === 'to')) out.add('pac');
      else if (b === 'going' && w[j + 1] === 'to') out.add('pas');
      else out.add('pas');
      used.add(j);
    } else if (a === 'have' || a === 'has') {
      if (b === 'been' && isIng(c)) out.add('ppc');
      else if (isPP(b) || b === 'been') out.add('pp');
      else if (b === 'to') out.add('ps');
      else if (!w[i - 1] || SUBJ.has(w[i - 1]) || !MODAL.has(w[i - 1])) out.add(w[i - 1] === 'will' ? 'fp' : 'ps');
      used.add(j);
    } else if (a === 'had') {
      if (b === 'been' && isIng(c)) out.add('pap');
      else if (isPP(b)) out.add('pap');
      else out.add('pas');
      used.add(j);
    } else if (a === 'did') out.add('pas');
    else if (a === 'do' || a === 'does') {
      if (SUBJ.has(w[i - 1] ?? '') && !MODAL.has(b)) out.add('ps');
      else out.add('ps');
    } else if (!used.has(i) && isPast(a) && i > 0 && !MODAL.has(w[i - 1]) && (SUBJ.has(w[i - 1]) || SKIP.has(w[i - 1]) || /^[a-z]+$/.test(w[i - 1])) && !['be', 'get', 'got'].includes(w[i - 1])) {
      // "I worked", "she went" — but not "I am tired" (handled above) or "to work"
      if (SUBJ.has(w[i - 1]) || ['never', 'just', 'already', 'also', 'always'].includes(w[i - 1]) || i === 1) out.add('pas');
    } else if (!used.has(i) && SUBJ.has(w[i - 1] ?? '') && !MODAL.has(a) && !SKIP.has(a) && !isIng(a) && !isPast(a)) {
      out.add('ps');
    } else if (!used.has(i) && /[^s]s$/.test(a) && a.length > 3 && nounSubject(w, i)) {
      // "my sister works", "the train leaves"
      out.add('ps');
    } else if (!used.has(i) && ['usually', 'often', 'sometimes', 'always', 'never'].includes(w[i - 1] ?? '') && SUBJ.has(w[i - 2] ?? '') && !MODAL.has(a) && !isPast(a)) {
      out.add('ps');
    }
  }
  return out;
}
