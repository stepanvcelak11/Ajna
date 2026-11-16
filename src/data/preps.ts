// Prepositions – the gap is "_" and `a` is the right answer. Options are drawn from the same group.
export interface Prep {
  s: string;
  a: string;
  cz: string;
  why: string;
  level: number;
  g: 'time' | 'place' | 'other';
}

export const PREP_GROUPS: Record<Prep['g'], string[]> = {
  time: ['in', 'on', 'at', 'for', 'since', 'by', 'during', 'until'],
  place: ['in', 'on', 'at', 'to', 'into', 'from', 'under', 'between'],
  other: ['of', 'about', 'with', 'for', 'to', 'on', 'at', 'by', 'in', 'from'],
};

export const PREPS: Prep[] = [
  // time – level 1/2
  { s: 'My birthday is _ May.', a: 'in', cz: 'v květnu', why: 'Měsíce, roky, roční období: IN (in May, in 2020, in summer).', level: 1, g: 'time' },
  { s: 'See you _ Monday!', a: 'on', cz: 'v pondělí', why: 'Dny a data: ON (on Monday, on 3rd May).', level: 1, g: 'time' },
  { s: 'The film starts _ eight o\'clock.', a: 'at', cz: 'v osm', why: 'Přesný čas: AT (at 8, at noon, at midnight).', level: 1, g: 'time' },
  { s: 'I drink coffee _ the morning.', a: 'in', cz: 'ráno', why: 'Části dne: IN the morning / afternoon / evening, ale AT night.', level: 1, g: 'time' },
  { s: 'I sleep badly _ night.', a: 'at', cz: 'v noci', why: 'Výjimka: AT night.', level: 1, g: 'time' },
  { s: 'We go skiing _ winter.', a: 'in', cz: 'v zimě', why: 'Roční období: IN winter.', level: 1, g: 'time' },
  { s: 'What do you do _ the weekend?', a: 'at', cz: 'o víkendu', why: 'Britsky AT the weekend (americky on the weekend).', level: 2, g: 'time' },
  { s: 'The shop is closed _ Christmas Day.', a: 'on', cz: 'na Štědrý den / o Vánocích', why: 'Konkrétní den (i svátek): ON Christmas Day. Ale AT Christmas = o Vánocích obecně.', level: 2, g: 'time' },
  { s: 'I have lived here _ 2015.', a: 'since', cz: 'od roku 2015', why: 'SINCE + začátek (since 2015, since Monday). Se present perfect.', level: 2, g: 'time' },
  { s: 'I have lived here _ ten years.', a: 'for', cz: 'deset let', why: 'FOR + doba trvání (for ten years, for a week).', level: 2, g: 'time' },
  { s: 'Please send it _ Friday.', a: 'by', cz: 'do pátku (nejpozději)', why: 'BY = nejpozději do. UNTIL = až do (trvání).', level: 3, g: 'time' },
  { s: 'I will wait here _ you come back.', a: 'until', cz: 'dokud se nevrátíš', why: 'UNTIL = až do chvíle, kdy (děj trvá).', level: 3, g: 'time' },
  { s: 'Nobody spoke _ the meeting.', a: 'during', cz: 'během porady', why: 'DURING + podstatné jméno (during the meeting). Ne „while the meeting“.', level: 3, g: 'time' },
  { s: 'I was born _ 1990.', a: 'in', cz: 'v roce 1990', why: 'Roky: IN 1990.', level: 1, g: 'time' },
  { s: 'The train leaves _ 6:15.', a: 'at', cz: 'v 6:15', why: 'Čas na hodinách: AT.', level: 1, g: 'time' },
  { s: 'We met _ my birthday.', a: 'on', cz: 'na moje narozeniny', why: 'Konkrétní den: ON my birthday.', level: 2, g: 'time' },
  // place
  { s: 'I live _ Prague.', a: 'in', cz: 'v Praze', why: 'Města a země: IN Prague, in Czechia.', level: 1, g: 'place' },
  { s: 'The keys are _ the table.', a: 'on', cz: 'na stole', why: 'Na povrchu: ON the table.', level: 1, g: 'place' },
  { s: 'I am _ home.', a: 'at', cz: 'doma', why: 'AT home, at work, at school.', level: 1, g: 'place' },
  { s: 'I go _ work by bus.', a: 'to', cz: 'do práce', why: 'Pohyb směrem: GO TO work. Ale go home (bez to)!', level: 1, g: 'place' },
  { s: 'She is _ work now.', a: 'at', cz: 'v práci', why: 'Místo, kde jsi: AT work.', level: 1, g: 'place' },
  { s: 'The milk is _ the fridge.', a: 'in', cz: 've ledničce', why: 'Uvnitř: IN.', level: 1, g: 'place' },
  { s: 'There is a picture _ the wall.', a: 'on', cz: 'na zdi', why: 'Na stěně: ON the wall.', level: 2, g: 'place' },
  { s: 'Wait for me _ the bus stop.', a: 'at', cz: 'na zastávce', why: 'Bod / konkrétní místo: AT the bus stop.', level: 2, g: 'place' },
  { s: 'I read it _ the newspaper.', a: 'in', cz: 'v novinách', why: 'IN the newspaper, in a book. Ale ON the internet / on TV.', level: 2, g: 'place' },
  { s: 'I saw it _ TV.', a: 'on', cz: 'v televizi', why: 'ON TV, on the radio, on the internet.', level: 2, g: 'place' },
  { s: 'We were _ the cinema last night.', a: 'at', cz: 'v kině', why: 'Akce / instituce: AT the cinema, at a party, at the doctor\'s.', level: 2, g: 'place' },
  { s: 'He got _ the car and left.', a: 'into', cz: 'nasedl do auta', why: 'Pohyb dovnitř: INTO. Do auta „get into“, do autobusu „get on“.', level: 3, g: 'place' },
  { s: 'Get _ the bus at the next stop.', a: 'on', cz: 'nastup do autobusu', why: 'Autobus, vlak, letadlo: get ON / get OFF.', level: 3, g: 'place' },
  { s: 'The café is _ the bank and the post office.', a: 'between', cz: 'mezi', why: 'Mezi dvěma věcmi: BETWEEN.', level: 2, g: 'place' },
  { s: 'I arrived _ London at noon.', a: 'in', cz: 'do Londýna', why: 'ARRIVE IN + město/země, ARRIVE AT + budova. Nikdy „arrive to“!', level: 3, g: 'place' },
  { s: 'We arrived _ the airport late.', a: 'at', cz: 'na letiště', why: 'ARRIVE AT + konkrétní místo (airport, station, hotel).', level: 3, g: 'place' },
  { s: 'My room is _ the second floor.', a: 'on', cz: 've druhém patře', why: 'Patra: ON the second floor.', level: 3, g: 'place' },
  // other
  { s: 'It depends _ the weather.', a: 'on', cz: 'záleží na počasí', why: 'DEPEND ON (ne „depend of“).', level: 2, g: 'other' },
  { s: 'I\'m interested _ history.', a: 'in', cz: 'zajímám se o', why: 'INTERESTED IN.', level: 2, g: 'other' },
  { s: 'I\'m afraid _ dogs.', a: 'of', cz: 'bojím se psů', why: 'AFRAID OF.', level: 2, g: 'other' },
  { s: 'She is good _ maths.', a: 'at', cz: 'je dobrá v matice', why: 'GOOD AT (ne „good in“).', level: 2, g: 'other' },
  { s: 'Listen _ me!', a: 'to', cz: 'poslouchej mě', why: 'LISTEN TO somebody.', level: 1, g: 'other' },
  { s: 'I\'m waiting _ the bus.', a: 'for', cz: 'čekám na autobus', why: 'WAIT FOR (ne „wait on“).', level: 1, g: 'other' },
  { s: 'What are you talking _?', a: 'about', cz: 'o čem mluvíš', why: 'TALK ABOUT something.', level: 1, g: 'other' },
  { s: 'Thank you _ your help.', a: 'for', cz: 'díky za pomoc', why: 'THANK YOU FOR.', level: 1, g: 'other' },
  { s: 'I agree _ you.', a: 'with', cz: 'souhlasím s tebou', why: 'AGREE WITH somebody.', level: 2, g: 'other' },
  { s: 'We went there _ car.', a: 'by', cz: 'autem', why: 'Dopravní prostředek: BY car, by train. Ale ON foot (pěšky).', level: 1, g: 'other' },
  { s: 'This book was written _ a Czech author.', a: 'by', cz: 'od českého autora', why: 'Trpný rod: BY (kým).', level: 3, g: 'other' },
  { s: 'I\'m tired _ waiting.', a: 'of', cz: 'už mě nebaví čekat', why: 'TIRED OF = mít dost (něčeho).', level: 3, g: 'other' },
  { s: 'He is married _ my sister.', a: 'to', cz: 'je ženatý s mou sestrou', why: 'MARRIED TO (ne „married with“).', level: 3, g: 'other' },
  { s: 'It\'s different _ what I expected.', a: 'from', cz: 'jiné, než jsem čekal', why: 'DIFFERENT FROM.', level: 3, g: 'other' },
  { s: 'I\'m responsible _ the budget.', a: 'for', cz: 'odpovídám za rozpočet', why: 'RESPONSIBLE FOR.', level: 3, g: 'other' },
  { s: 'She insisted _ paying.', a: 'on', cz: 'trvala na tom, že zaplatí', why: 'INSIST ON + -ing.', level: 4, g: 'other' },
  { s: 'He apologised _ being late.', a: 'for', cz: 'omluvil se za zpoždění', why: 'APOLOGISE FOR + -ing.', level: 4, g: 'other' },
  { s: 'This is typical _ him.', a: 'of', cz: 'to je pro něj typické', why: 'TYPICAL OF (ne „typical for“).', level: 4, g: 'other' },
  { s: 'We need to focus _ the main problem.', a: 'on', cz: 'zaměřit se na', why: 'FOCUS ON.', level: 3, g: 'other' },
  { s: 'I\'m looking forward _ the holiday.', a: 'to', cz: 'těším se na dovolenou', why: 'LOOK FORWARD TO (+ -ing): looking forward to seeing you.', level: 3, g: 'other' },
  { s: 'She succeeded _ passing the exam.', a: 'in', cz: 'uspěla u zkoušky', why: 'SUCCEED IN + -ing.', level: 4, g: 'other' },
  { s: 'There\'s been an increase _ prices.', a: 'in', cz: 'nárůst cen', why: 'INCREASE IN something.', level: 4, g: 'other' },
  { s: 'What\'s the reason _ the delay?', a: 'for', cz: 'důvod zpoždění', why: 'REASON FOR.', level: 4, g: 'other' },
];

export function prepsFor(level: number) {
  const lv = Math.min(level, 4);
  return PREPS.filter((p) => p.level <= lv && p.level >= lv - 2);
}
