// Typical mistakes Czech speakers make in English (original examples).
// The "Chytáky" game shows the options and the learner picks the one correct sentence.

export interface Trap {
  id: string;
  level: 1 | 2 | 3 | 4;
  right: string;
  wrong: string[]; // 1–2 typical wrong versions
  cz: string; // why
}

type Row = [right: string, wrong: string[], cz: string];
const t = (level: Trap['level'], rows: Row[]): Trap[] => rows.map(([right, wrong, cz], i) => ({ id: `t${level}-${i}`, level, right, wrong, cz }));

export const TRAPS: Trap[] = [
  ...t(1, [
    ['I agree with you.', ['I am agree with you.', 'I agree to you.'], '„Agree“ je sloveso, nepotřebuje „am“: I agree.'],
    ["I'm 25 years old.", ['I have 25 years.', 'I am 25 years.'], 'Věk se říká se slovesem „be“: I am 25 (years old).'],
    ['She works in a hospital.', ['She work in a hospital.', 'She working in a hospital.'], 'He/she/it: sloveso + -s.'],
    ['I am a teacher.', ['I am teacher.', 'I am the teacher.'], 'Povolání má člen „a“.'],
    ["I'm cold.", ['It is cold to me.', 'I have cold.'], 'Je mi zima = I am cold.'],
    ['Where is the station?', ['Where the station is?', 'Where is station?'], 'V otázce je sloveso před podmětem: Where is…?'],
    ['Do you speak English?', ['Speak you English?', 'You speak English?'], 'Otázka v přítomném čase potřebuje „do“.'],
    ["I don't like it.", ['I not like it.', "I don't like."], 'Zápor: don\'t + sloveso. A předmět „it“ se nevynechává.'],
    ['My sister has two children.', ['My sister have two childs.', 'My sister has two childrens.'], 'Has u she; množné číslo child → children.'],
    ['I live in Brno.', ['I live at Brno.', 'I am living on Brno.'], 'Město: in Brno.'],
    ['There is a bank near here.', ['Is here a bank near.', 'Here is bank near.'], 'Je tu…? → There is…'],
    ['How much is it?', ['How many it costs?', 'How much it is?'], 'Cena: How much is it? / How much does it cost?'],
  ]),
  ...t(2, [
    ['I went there yesterday.', ['I have gone there yesterday.', 'I go there yesterday.'], 'Yesterday = minulý čas prostý.'],
    ['It depends on the weather.', ['It depends from the weather.', 'It depends of the weather.'], 'Depend ON.'],
    ['I made a mistake.', ['I did a mistake.', 'I made mistake.'], 'Make a mistake.'],
    ['Can I borrow your pen?', ['Can I lend your pen?', 'Can you borrow me your pen?'], 'Borrow = půjčit si; lend = půjčit někomu.'],
    ['I listen to music every day.', ['I listen music every day.', 'I hear music every day.'], 'Listen TO.'],
    ['We arrived in London at six.', ['We arrived to London at six.', 'We came to London in six.'], 'Arrive IN (město) / AT (místo), čas AT six.'],
    ["I'm waiting for the bus.", ["I'm waiting the bus.", 'I wait on the bus.'], 'Wait FOR.'],
    ['She is better than me.', ['She is better like me.', 'She is more better than me.'], 'Better THAN; „more better“ nejde.'],
    ['I usually have breakfast at seven.', ['I have usually breakfast at seven.', 'Usually I have a breakfast in seven.'], 'Příslovce před slovesem, have breakfast bez členu, at seven.'],
    ['Did you see him?', ['Did you saw him?', 'You saw him?'], 'Po did je základní tvar.'],
    ['I need some information.', ['I need some informations.', 'I need an information.'], 'Information je nepočitatelné.'],
    ['Actually, I live in Prague now.', ['Actually, I am living in Prague in this moment.', 'Actual, I live in Prague now.'], 'Actually = vlastně. „Aktuálně“ = currently / at the moment.'],
  ]),
  ...t(3, [
    ["I've lived here for five years.", ['I live here for five years.', 'I am living here since five years.'], 'Trvá do teď → present perfect + for.'],
    ["I'm looking forward to seeing you.", ["I'm looking forward to see you.", 'I look forward to see you.'], 'Look forward to + -ing.'],
    ['If I had more time, I would travel.', ['If I would have more time, I would travel.', 'If I have more time, I would travel.'], 'Po „if“ nikdy „would“.'],
    ['He suggested going for a walk.', ['He suggested to go for a walk.', 'He suggested us to go for a walk.'], 'Suggest + -ing (nebo suggest that we…).'],
    ['It was a very nice evening.', ['It was a very sympathetic evening.', 'It was very nice evening.'], 'Sympatický = nice; sympathetic = chápavý.'],
    ["I've never been to Spain.", ["I've never been in Spain.", "I was never to Spain."], 'Byl jsem někde (zkušenost): been TO.'],
    ['Can you explain it to me?', ['Can you explain me it?', 'Can you explain me?'], 'Explain something TO someone.'],
    ['I used to play tennis.', ['I was used to play tennis.', 'I use to play tennis.'], 'Dříve jsem = used to + sloveso.'],
    ['Eventually, we found the hotel.', ['Eventually we will maybe find the hotel.', 'Possibly, we finally found the hotel.'], 'Eventually = nakonec, ne „eventuálně“.'],
    ['The people were very friendly.', ['The people was very friendly.', 'The peoples were very friendly.'], 'People je množné číslo.'],
    ["I'm not used to getting up early.", ["I'm not used to get up early.", "I didn't use to get up early now."], 'Be used to + -ing = být zvyklý.'],
    ['Let me know when you arrive.', ['Let me know when you will arrive.', 'Let me know when you arrived.'], 'Po „when“ o budoucnosti přítomný čas.'],
  ]),
  ...t(4, [
    ['If I had known, I would have come.', ['If I would have known, I would come.', 'If I knew, I would have came.'], '3. kondicionál: if + had known, would have come.'],
    ['Despite the rain, we went out.', ['Despite of the rain, we went out.', 'Although the rain, we went out.'], 'Despite bez „of“; although + věta.'],
    ['I wish I had more time.', ['I wish I would have more time.', 'I wish I have more time.'], 'Wish + minulý tvar.'],
    ['He told me he was tired.', ['He said me he was tired.', 'He told that he is tired.'], 'Tell someone / say (that).'],
    ['The report was written by Anna.', ['The report was wrote by Anna.', 'The report has written by Anna.'], 'Trpný rod: was + 3. tvar (written).'],
    ["I've been waiting for an hour.", ['I wait for an hour.', 'I am waiting since an hour.'], 'Trvá do teď → have been + -ing + for.'],
    ['She must have missed the train.', ['She must missed the train.', 'She had to miss the train.'], 'Dedukce o minulosti: must have + 3. tvar.'],
    ['I had my hair cut yesterday.', ['I have my hair cut yesterday.', 'I had cut my hair yesterday.'], 'Nechat si něco udělat: have something done.'],
    ["It's time we left.", ["It's time we leave.", "It's time that we will leave."], 'It\'s time + minulý tvar.'],
    ['Hardly had we arrived when it started to rain.', ['Hardly we had arrived when it started to rain.', 'Hardly had we arrived than it started to rain.'], 'Po „hardly“ na začátku je inverze + when.'],
  ]),
];

export function trapsFor(level: number) {
  const lv = Math.min(4, Math.max(1, level));
  return TRAPS.filter((x) => x.level === lv || x.level === lv - 1);
}
