// Five-letter English words with a Czech clue for the "Slovo dne" spelling game.
export const WORDLE_WORDS: [en: string, cz: string][] = [
  ['water', 'voda'], ['house', 'dům'], ['bread', 'chleba'], ['apple', 'jablko'], ['train', 'vlak'], ['money', 'peníze'],
  ['happy', 'šťastný'], ['sleep', 'spát'], ['chair', 'židle'], ['table', 'stůl'], ['phone', 'telefon'], ['music', 'hudba'],
  ['light', 'světlo'], ['night', 'noc'], ['green', 'zelený'], ['white', 'bílý'], ['black', 'černý'], ['sugar', 'cukr'],
  ['lunch', 'oběd'], ['beach', 'pláž'], ['river', 'řeka'], ['plant', 'rostlina'], ['smile', 'úsměv'], ['dream', 'sen'],
  ['heart', 'srdce'], ['horse', 'kůň'], ['mouse', 'myš'], ['shirt', 'košile'], ['shoes', 'boty'], ['money', 'peníze'],
  ['clock', 'hodiny (na zdi)'], ['watch', 'hodinky; dívat se'], ['early', 'brzy'], ['later', 'později'], ['today', 'dnes'], ['party', 'večírek'],
  ['quiet', 'tichý'], ['noisy', 'hlučný'], ['tired', 'unavený'], ['angry', 'naštvaný'], ['proud', 'hrdý'], ['funny', 'vtipný'],
  ['sweet', 'sladký'], ['salty', 'slaný'], ['fresh', 'čerstvý'], ['cheap', 'levný'], ['heavy', 'těžký'], ['empty', 'prázdný'],
  ['clean', 'čistý'], ['dirty', 'špinavý'], ['young', 'mladý'], ['every', 'každý'], ['never', 'nikdy'], ['often', 'často'],
  ['again', 'znovu'], ['under', 'pod'], ['above', 'nad'], ['after', 'po (čase)'], ['study', 'studovat'], ['learn', 'učit se'],
  ['write', 'psát'], ['speak', 'mluvit'], ['think', 'myslet'], ['bring', 'přinést'], ['carry', 'nést'], ['build', 'stavět'],
  ['laugh', 'smát se'], ['drink', 'pít'], ['dance', 'tančit'], ['cook', 'vařit'], ['start', 'začít'], ['close', 'zavřít'],
  ['visit', 'navštívit'], ['enjoy', 'užívat si'], ['agree', 'souhlasit'], ['allow', 'dovolit'], ['worry', 'bát se, trápit se'], ['share', 'sdílet'],
  ['hotel', 'hotel'], ['floor', 'podlaha; patro'], ['glass', 'sklenice'], ['knife', 'nůž'], ['spoon', 'lžíce'], ['plate', 'talíř'],
  ['towel', 'ručník'], ['money', 'peníze'], ['price', 'cena'], ['ticket', 'jízdenka'], ['guest', 'host'], ['nurse', 'zdravotní sestra'],
  ['judge', 'soudce'], ['chief', 'vedoucí'], ['uncle', 'strýc'], ['child', 'dítě'], ['woman', 'žena'], ['adult', 'dospělý'],
  ['earth', 'Země'], ['ocean', 'oceán'], ['cloud', 'mrak'], ['storm', 'bouřka'], ['snowy', 'zasněžený'], ['sunny', 'slunečný'],
  ['field', 'pole'], ['grass', 'tráva'], ['stone', 'kámen'], ['fruit', 'ovoce'], ['onion', 'cibule'], ['lemon', 'citron'],
  ['juice', 'džus'], ['pizza', 'pizza'], ['salad', 'salát'], ['bacon', 'slanina'], ['steak', 'steak'], ['honey', 'med'],
  ['sport', 'sport'], ['skirt', 'sukně'], ['dress', 'šaty'], ['jeans', 'džíny'], ['scarf', 'šála'], ['boots', 'kozačky, boty'],
  ['story', 'příběh'], ['movie', 'film'], ['photo', 'fotka'], ['email', 'e-mail'], ['video', 'video'], ['radio', 'rádio'],
  ['habit', 'zvyk'], ['skill', 'dovednost'], ['peace', 'mír'], ['truth', 'pravda'], ['trust', 'důvěra'], ['doubt', 'pochybnost'],
].filter(([en]) => en.length === 5) as [string, string][];

const unique = [...new Map(WORDLE_WORDS.map((w) => [w[0], w])).values()];
export const WORDS5 = unique;

/** Same word for everyone on a given day. */
export function wordOfDay(day: string): [string, string] {
  let h = 0;
  for (const ch of day) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  return WORDS5[Math.abs(h) % WORDS5.length];
}
