// Kana Database - 92 base kana + variants
export type Element = 'luce' | 'fuoco' | 'ghiaccio' | 'vento' | 'fulmine' | 'terra' | 'ombra' | 'fisico';
export type Temperament = 'timido' | 'fiero' | 'curioso' | 'burlone';
export type Script = 'hiragana' | 'katakana';

export interface Ability {
  name: string;
  italian: string;
  element: Element;
  power: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
}

export interface Kana {
  id: string;
  glyph: string;
  romaji: string;
  script: Script;
  element: Element;
  strokes: number;
  row: string;
  temperament: Temperament;
  abilities: Ability[];
  hp: number;
  mp: number;
  atk: number;
  def: number;
  agi: number;
  mag: number;
}

const ROW_ELEMENTS: Record<string, Element> = {
  'a': 'luce', 'ka': 'vento', 'sa': 'ghiaccio', 'ta': 'fulmine',
  'na': 'terra', 'ha': 'fuoco', 'ma': 'ombra', 'ya': 'fisico',
  'ra': 'fulmine', 'wa': 'ombra'
};

function deriveStats(strokes: number, script: Script, element: Element): Partial<Kana> {
  const base = strokes * 3 + 10;
  const isHiragana = script === 'hiragana';
  return {
    hp: base + (isHiragana ? 5 : -2),
    mp: isHiragana ? 15 + strokes * 2 : 8 + strokes,
    atk: isHiragana ? base - 3 : base + 5,
    def: base - 2,
    agi: 8 + strokes * 2,
    mag: isHiragana ? base + 3 : base - 5,
  };
}

const TEMPERAMENTS: Temperament[] = ['timido', 'fiero', 'curioso', 'burlone'];

function getTemperament(row: string): Temperament {
  const idx = row.charCodeAt(0) % 4;
  return TEMPERAMENTS[idx];
}

// Hiragana base
const HIRAGANA_BASE = [
  { glyph: 'あ', romaji: 'a', row: 'a', strokes: 3 },
  { glyph: 'い', romaji: 'i', row: 'a', strokes: 2 },
  { glyph: 'う', romaji: 'u', row: 'a', strokes: 2 },
  { glyph: 'え', romaji: 'e', row: 'a', strokes: 3 },
  { glyph: 'お', romaji: 'o', row: 'a', strokes: 4 },
  { glyph: 'か', romaji: 'ka', row: 'ka', strokes: 3 },
  { glyph: 'き', romaji: 'ki', row: 'ka', strokes: 5 },
  { glyph: 'く', romaji: 'ku', row: 'ka', strokes: 2 },
  { glyph: 'け', romaji: 'ke', row: 'ka', strokes: 3 },
  { glyph: 'こ', romaji: 'ko', row: 'ka', strokes: 2 },
  { glyph: 'さ', romaji: 'sa', row: 'sa', strokes: 3 },
  { glyph: 'し', romaji: 'shi', row: 'sa', strokes: 2 },
  { glyph: 'す', romaji: 'su', row: 'sa', strokes: 3 },
  { glyph: 'せ', romaji: 'se', row: 'sa', strokes: 3 },
  { glyph: 'そ', romaji: 'so', row: 'sa', strokes: 2 },
  { glyph: 'た', romaji: 'ta', row: 'ta', strokes: 3 },
  { glyph: 'ち', romaji: 'chi', row: 'ta', strokes: 3 },
  { glyph: 'つ', romaji: 'tsu', row: 'ta', strokes: 2 },
  { glyph: 'て', romaji: 'te', row: 'ta', strokes: 2 },
  { glyph: 'と', romaji: 'to', row: 'ta', strokes: 2 },
  { glyph: 'な', romaji: 'na', row: 'na', strokes: 3 },
  { glyph: 'に', romaji: 'ni', row: 'na', strokes: 4 },
  { glyph: 'ぬ', romaji: 'nu', row: 'na', strokes: 3 },
  { glyph: 'ね', romaji: 'ne', row: 'na', strokes: 3 },
  { glyph: 'の', romaji: 'no', row: 'na', strokes: 2 },
  { glyph: 'は', romaji: 'ha', row: 'ha', strokes: 3 },
  { glyph: 'ひ', romaji: 'hi', row: 'ha', strokes: 3 },
  { glyph: 'ふ', romaji: 'fu', row: 'ha', strokes: 3 },
  { glyph: 'へ', romaji: 'he', row: 'ha', strokes: 1 },
  { glyph: 'ほ', romaji: 'ho', row: 'ha', strokes: 4 },
  { glyph: 'ま', romaji: 'ma', row: 'ma', strokes: 3 },
  { glyph: 'み', romaji: 'mi', row: 'ma', strokes: 3 },
  { glyph: 'む', romaji: 'mu', row: 'ma', strokes: 3 },
  { glyph: 'め', romaji: 'me', row: 'ma', strokes: 3 },
  { glyph: 'も', romaji: 'mo', row: 'ma', strokes: 3 },
  { glyph: 'や', romaji: 'ya', row: 'ya', strokes: 3 },
  { glyph: 'ゆ', romaji: 'yu', row: 'ya', strokes: 2 },
  { glyph: 'よ', romaji: 'yo', row: 'ya', strokes: 3 },
  { glyph: 'ら', romaji: 'ra', row: 'ra', strokes: 3 },
  { glyph: 'り', romaji: 'ri', row: 'ra', strokes: 3 },
  { glyph: 'る', romaji: 'ru', row: 'ra', strokes: 2 },
  { glyph: 'れ', romaji: 're', row: 'ra', strokes: 2 },
  { glyph: 'ろ', romaji: 'ro', row: 'ra', strokes: 3 },
  { glyph: 'わ', romaji: 'wa', row: 'wa', strokes: 2 },
  { glyph: 'を', romaji: 'wo', row: 'wa', strokes: 3 },
  { glyph: 'ん', romaji: 'n', row: 'wa', strokes: 1 },
];

// Katakana base
const KATAKANA_BASE = [
  { glyph: 'ア', romaji: 'a', row: 'a', strokes: 2 },
  { glyph: 'イ', romaji: 'i', row: 'a', strokes: 1 },
  { glyph: 'ウ', romaji: 'u', row: 'a', strokes: 3 },
  { glyph: 'エ', romaji: 'e', row: 'a', strokes: 3 },
  { glyph: 'オ', romaji: 'o', row: 'a', strokes: 3 },
  { glyph: 'カ', romaji: 'ka', row: 'ka', strokes: 3 },
  { glyph: 'キ', romaji: 'ki', row: 'ka', strokes: 4 },
  { glyph: 'ク', romaji: 'ku', row: 'ka', strokes: 3 },
  { glyph: 'ケ', romaji: 'ke', row: 'ka', strokes: 3 },
  { glyph: 'コ', romaji: 'ko', row: 'ka', strokes: 2 },
  { glyph: 'サ', romaji: 'sa', row: 'sa', strokes: 3 },
  { glyph: 'シ', romaji: 'shi', row: 'sa', strokes: 3 },
  { glyph: 'ス', romaji: 'su', row: 'sa', strokes: 3 },
  { glyph: 'セ', romaji: 'se', row: 'sa', strokes: 3 },
  { glyph: 'ソ', romaji: 'so', row: 'sa', strokes: 2 },
  { glyph: 'タ', romaji: 'ta', row: 'ta', strokes: 3 },
  { glyph: 'チ', romaji: 'chi', row: 'ta', strokes: 3 },
  { glyph: 'ツ', romaji: 'tsu', row: 'ta', strokes: 3 },
  { glyph: 'テ', romaji: 'te', row: 'ta', strokes: 3 },
  { glyph: 'ト', romaji: 'to', row: 'ta', strokes: 2 },
  { glyph: 'ナ', romaji: 'na', row: 'na', strokes: 3 },
  { glyph: 'ニ', romaji: 'ni', row: 'na', strokes: 2 },
  { glyph: 'ヌ', romaji: 'nu', row: 'na', strokes: 3 },
  { glyph: 'ネ', romaji: 'ne', row: 'na', strokes: 3 },
  { glyph: 'ノ', romaji: 'no', row: 'na', strokes: 1 },
  { glyph: 'ハ', romaji: 'ha', row: 'ha', strokes: 3 },
  { glyph: 'ヒ', romaji: 'hi', row: 'ha', strokes: 3 },
  { glyph: 'フ', romaji: 'fu', row: 'ha', strokes: 2 },
  { glyph: 'ヘ', romaji: 'he', row: 'ha', strokes: 1 },
  { glyph: 'ホ', romaji: 'ho', row: 'ha', strokes: 4 },
  { glyph: 'マ', romaji: 'ma', row: 'ma', strokes: 2 },
  { glyph: 'ミ', romaji: 'mi', row: 'ma', strokes: 3 },
  { glyph: 'ム', romaji: 'mu', row: 'ma', strokes: 2 },
  { glyph: 'メ', romaji: 'me', row: 'ma', strokes: 2 },
  { glyph: 'モ', romaji: 'mo', row: 'ma', strokes: 3 },
  { glyph: 'ヤ', romaji: 'ya', row: 'ya', strokes: 3 },
  { glyph: 'ユ', romaji: 'yu', row: 'ya', strokes: 2 },
  { glyph: 'ヨ', romaji: 'yo', row: 'ya', strokes: 3 },
  { glyph: 'ラ', romaji: 'ra', row: 'ra', strokes: 2 },
  { glyph: 'リ', romaji: 'ri', row: 'ra', strokes: 2 },
  { glyph: 'ル', romaji: 'ru', row: 'ra', strokes: 2 },
  { glyph: 'レ', romaji: 're', row: 'ra', strokes: 1 },
  { glyph: 'ロ', romaji: 'ro', row: 'ra', strokes: 2 },
  { glyph: 'ワ', romaji: 'wa', row: 'wa', strokes: 2 },
  { glyph: 'ヲ', romaji: 'wo', row: 'wa', strokes: 3 },
  { glyph: 'ン', romaji: 'n', row: 'wa', strokes: 2 },
];

// Ability pools per element
const ABILITY_POOLS: Record<Element, Ability[]> = {
  luce: [
    { name: 'Hikari', italian: 'Luce', element: 'luce', power: 20, type: 'attack' },
    { name: 'Kagayaki', italian: 'Splendore', element: 'luce', power: 35, type: 'attack' },
    { name: 'Iyashi', italian: 'Guarigione', element: 'luce', power: 25, type: 'heal' },
    { name: 'Seikatsu', italian: 'Protezione', element: 'luce', power: 15, type: 'buff' },
  ],
  fuoco: [
    { name: 'Hi', italian: 'Fuoco', element: 'fuoco', power: 22, type: 'attack' },
    { name: 'Honoo', italian: 'Fiamma', element: 'fuoco', power: 38, type: 'attack' },
    { name: 'Shakunetsu', italian: 'Calore Rovente', element: 'fuoco', power: 45, type: 'attack' },
    { name: 'Kasai', italian: 'Incendio', element: 'fuoco', power: 30, type: 'attack' },
  ],
  ghiaccio: [
    { name: 'Yuki', italian: 'Neve', element: 'ghiaccio', power: 20, type: 'attack' },
    { name: 'Koori', italian: 'Ghiaccio', element: 'ghiaccio', power: 35, type: 'attack' },
    { name: 'Fubuki', italian: 'Bufera', element: 'ghiaccio', power: 42, type: 'attack' },
    { name: 'Reitō', italian: 'Congelamento', element: 'ghiaccio', power: 18, type: 'debuff' },
  ],
  vento: [
    { name: 'Kaze', italian: 'Vento', element: 'vento', power: 18, type: 'attack' },
    { name: 'Arashi', italian: 'Tempesta', element: 'vento', power: 36, type: 'attack' },
    { name: 'Tsumuji', italian: 'Tromba', element: 'vento', power: 28, type: 'attack' },
    { name: 'Soyokaze', italian: 'Brezza', element: 'vento', power: 12, type: 'buff' },
  ],
  fulmine: [
    { name: 'Kaminari', italian: 'Tuono', element: 'fulmine', power: 24, type: 'attack' },
    { name: 'Inazuma', italian: 'Lampo', element: 'fulmine', power: 40, type: 'attack' },
    { name: 'Raijin', italian: 'Dio del Tuono', element: 'fulmine', power: 48, type: 'attack' },
    { name: 'Shibire', italian: 'Scossa', element: 'fulmine', power: 15, type: 'debuff' },
  ],
  terra: [
    { name: 'Tsuchi', italian: 'Terra', element: 'terra', power: 20, type: 'attack' },
    { name: 'Iwa', italian: 'Roccia', element: 'terra', power: 32, type: 'attack' },
    { name: 'Daichi', italian: 'Grande Terra', element: 'terra', power: 38, type: 'attack' },
    { name: 'Kabe', italian: 'Muro', element: 'terra', power: 20, type: 'buff' },
  ],
  ombra: [
    { name: 'Kage', italian: 'Ombra', element: 'ombra', power: 22, type: 'attack' },
    { name: 'Yami', italian: 'Oscurità', element: 'ombra', power: 38, type: 'attack' },
    { name: 'Noroi', italian: 'Maledizione', element: 'ombra', power: 25, type: 'debuff' },
    { name: 'Kyōfu', italian: 'Paura', element: 'ombra', power: 18, type: 'debuff' },
  ],
  fisico: [
    { name: 'Naguri', italian: 'Pugno', element: 'fisico', power: 20, type: 'attack' },
    { name: 'Kiri', italian: 'Taglio', element: 'fisico', power: 30, type: 'attack' },
    { name: 'Totsugeki', italian: 'Carica', element: 'fisico', power: 40, type: 'attack' },
    { name: 'Mamori', italian: 'Difesa', element: 'fisico', power: 15, type: 'buff' },
  ],
};

function buildKanaDatabase(): Kana[] {
  const allBase = [
    ...HIRAGANA_BASE.map(k => ({ ...k, script: 'hiragana' as Script })),
    ...KATAKANA_BASE.map(k => ({ ...k, script: 'katakana' as Script })),
  ];

  return allBase.map((k, idx) => {
    const element = ROW_ELEMENTS[k.row] || 'fisico';
    const stats = deriveStats(k.strokes, k.script, element);
    const abilities = ABILITY_POOLS[element].slice(0, 4);
    return {
      id: `${k.script}_${k.romaji}_${idx}`,
      glyph: k.glyph,
      romaji: k.romaji,
      script: k.script,
      element,
      strokes: k.strokes,
      row: k.row,
      temperament: getTemperament(k.row),
      abilities,
      ...stats,
    } as Kana;
  });
}

export const KANA_DATABASE: Kana[] = buildKanaDatabase();

// Fusion recipes
export interface FusionRecipe {
  inputs: string[]; // romaji
  output: string; // word
  outputMeaning: string;
  outputGlyph: string;
}

export const FUSION_RECIPES: FusionRecipe[] = [
  { inputs: ['ne', 'ko'], output: 'neko', outputMeaning: 'gatto', outputGlyph: 'ねこ' },
  { inputs: ['tsu', 'ki'], output: 'tsuki', outputMeaning: 'luna', outputGlyph: 'つき' },
  { inputs: ['ho', 'shi'], output: 'hoshi', outputMeaning: 'stella', outputGlyph: 'ほし' },
  { inputs: ['yu', 'me'], output: 'yume', outputMeaning: 'sogno', outputGlyph: 'ゆめ' },
  { inputs: ['u', 'mi'], output: 'umi', outputMeaning: 'mare', outputGlyph: 'うみ' },
  { inputs: ['hi', 'ka', 'ri'], output: 'hikari', outputMeaning: 'luce', outputGlyph: 'ひかり' },
  { inputs: ['yo', 'ru'], output: 'yoru', outputMeaning: 'notte', outputGlyph: 'よる' },
  { inputs: ['sa', 'ku', 'ra'], output: 'sakura', outputMeaning: 'ciliegio', outputGlyph: 'さくら' },
  { inputs: ['ki', 'tsu', 'ne'], output: 'kitsune', outputMeaning: 'volpe', outputGlyph: 'きつね' },
  { inputs: ['ko', 'ko', 'ro'], output: 'kokoro', outputMeaning: 'cuore', outputGlyph: 'こころ' },
  { inputs: ['shi', 'ro'], output: 'shiro', outputMeaning: 'bianco', outputGlyph: 'しろ' },
  { inputs: ['ka', 'sa'], output: 'kasa', outputMeaning: 'ombrello', outputGlyph: 'かさ' },
  { inputs: ['ha', 'na'], output: 'hana', outputMeaning: 'fiore', outputGlyph: 'はな' },
  { inputs: ['ki', 'ri'], output: 'kiri', outputMeaning: 'nebbia', outputGlyph: 'きり' },
  { inputs: ['ta', 'mi'], output: 'tami', outputMeaning: 'popolo', outputGlyph: 'たみ' },
  { inputs: ['su', 'na'], output: 'suna', outputMeaning: 'sabbia', outputGlyph: 'すな' },
  { inputs: ['ka', 'ze'], output: 'kaze', outputMeaning: 'vento', outputGlyph: 'かぜ' },
  { inputs: ['a', 'me'], output: 'ame', outputMeaning: 'pioggia', outputGlyph: 'あめ' },
  { inputs: ['so', 'ra'], output: 'sora', outputMeaning: 'cielo', outputGlyph: 'そら' },
  { inputs: ['yu', 'ki'], output: 'yuki', outputMeaning: 'coraggio/neve', outputGlyph: 'ゆき' },
  { inputs: ['ka', 'i'], output: 'kai', outputMeaning: 'mare/aperto', outputGlyph: 'かい' },
  { inputs: ['mo', 'ri'], output: 'mori', outputMeaning: 'foresta', outputGlyph: 'もり' },
  { inputs: ['ya', 'ma'], output: 'yama', outputMeaning: 'montagna', outputGlyph: 'やま' },
  { inputs: ['ka', 'wa'], output: 'kawa', outputMeaning: 'fiume', outputGlyph: 'かわ' },
  { inputs: ['i', 'nu'], output: 'inu', outputMeaning: 'cane', outputGlyph: 'いぬ' },
  { inputs: ['to', 'ri'], output: 'tori', outputMeaning: 'uccello', outputGlyph: 'とり' },
  { inputs: ['sa', 'ka', 'na'], output: 'sakana', outputMeaning: 'pesce', outputGlyph: 'さかな' },
  { inputs: ['te', 'ga', 'mi'], output: 'tegami', outputMeaning: 'lettera', outputGlyph: 'てがみ' },
  { inputs: ['ko', 'e'], output: 'koe', outputMeaning: 'voce', outputGlyph: 'こえ' },
  { inputs: ['ko', 'to', 'ba'], output: 'kotoba', outputMeaning: 'parola', outputGlyph: 'ことば' },
  { inputs: ['ka', 'ge'], output: 'kage', outputMeaning: 'ombra', outputGlyph: 'かげ' },
  { inputs: ['hi', 'ka', 'ge'], output: 'hikage', outputMeaning: 'ombra luminosa', outputGlyph: 'ひかげ' },
  { inputs: ['i', 'no', 'chi'], output: 'inochi', outputMeaning: 'vita', outputGlyph: 'いのち' },
  { inputs: ['na', 'mi', 'da'], output: 'namida', outputMeaning: 'lacrima', outputGlyph: 'なみだ' },
  { inputs: ['wa', 'su', 're'], output: 'wasure', outputMeaning: 'dimenticare', outputGlyph: 'わすれ' },
  { inputs: ['o', 'mo', 'i'], output: 'omoi', outputMeaning: 'pensiero', outputGlyph: 'おもい' },
  { inputs: ['ka', 'ta'], output: 'kata', outputMeaning: 'forma/spalla', outputGlyph: 'かた' },
  { inputs: ['mi', 'chi'], output: 'michi', outputMeaning: 'cammino', outputGlyph: 'みち' },
  { inputs: ['ka', 'do'], output: 'kado', outputMeaning: 'angolo', outputGlyph: 'かど' },
  { inputs: ['ni', 'wa'], output: 'niwa', outputMeaning: 'giardino', outputGlyph: 'にわ' },
];

// Rumors system
export interface Rumor {
  id: string;
  chapter: number;
  text: string;
  effect: 'enemy_change' | 'shortcut' | 'item_bonus' | 'boss_easier' | 'boss_harder' | 'extra_scene';
  description: string;
}

export const RUMORS: Rumor[] = [
  { id: 'r1', chapter: 1, text: 'Dicono che di notte le aule del liceo si muovano da sole...', effect: 'enemy_change', description: 'Nemici diversi nel dungeon' },
  { id: 'r2', chapter: 1, text: 'Il vecchio custode ha lasciato una chiave nascosta...', effect: 'shortcut', description: 'Scorciatoia nel dungeon' },
  { id: 'r3', chapter: 1, text: 'Chi porta un foglio bianco trova oggetti rari...', effect: 'item_bonus', description: 'Oggetti bonus nel dungeon' },
  { id: 'r4', chapter: 2, text: 'Il porto mormora nomi di marinai perduti...', effect: 'extra_scene', description: 'Scena extra nel dungeon' },
  { id: 'r5', chapter: 2, text: 'Le onde si ritirano quando qualcuno canta...', effect: 'boss_easier', description: 'Boss più facile' },
  { id: 'r6', chapter: 2, text: 'Nessuno ricorda più il colore del faro...', effect: 'boss_harder', description: 'Boss più difficile' },
  { id: 'r7', chapter: 3, text: 'Gli specchi del magazzino mostrano chi non sei...', effect: 'enemy_change', description: 'Nemici diversi nel dungeon' },
  { id: 'r8', chapter: 3, text: 'Il terzo piano ha un ascensore segreto...', effect: 'shortcut', description: 'Scorciatoia nel dungeon' },
  { id: 'r9', chapter: 3, text: 'I manichini si muovono quando non li guardi...', effect: 'boss_harder', description: 'Boss più difficile' },
  { id: 'r10', chapter: 4, text: 'L\'ospedale abbandonato ha ancora pazienti...', effect: 'extra_scene', description: 'Scena extra nel dungeon' },
  { id: 'r11', chapter: 4, text: 'Il dottore sorride anche nel buio...', effect: 'boss_easier', description: 'Boss più facile' },
  { id: 'r12', chapter: 4, text: 'Le cartelle cliniche sono tutte bianche...', effect: 'item_bonus', description: 'Oggetti bonus nel dungeon' },
  { id: 'r13', chapter: 5, text: 'La biblioteca non ha ultima pagina...', effect: 'enemy_change', description: 'Nemici diversi nel dungeon' },
  { id: 'r14', chapter: 5, text: 'I libri scrivono se stessi mentre li leggi...', effect: 'shortcut', description: 'Scorciatoia nel dungeon' },
  { id: 'r15', chapter: 5, text: 'La ragazza senza voce ha lasciato un messaggio...', effect: 'extra_scene', description: 'Scena extra nel dungeon' },
  { id: 'r16', chapter: 6, text: 'Il bianco non è un colore, è un silenzio...', effect: 'boss_harder', description: 'Boss più difficile' },
  { id: 'r17', chapter: 6, text: 'Chi entra nel Vuoto dimentica il proprio nome...', effect: 'boss_easier', description: 'Boss più facile' },
  { id: 'r18', chapter: 6, text: 'Tachibana ha scritto l\'ultima parola...', effect: 'item_bonus', description: 'Oggetti bonus nel dungeon' },
];

// Story chapters
export interface StoryScene {
  id: string;
  chapter: number;
  type: 'dialogue' | 'choice' | 'battle' | 'narration';
  speaker?: string;
  text?: string;
  choices?: { text: string; flag: string }[];
  next?: string;
}

export const STORY_SCENES: StoryScene[] = [
  { id: 'prologue_1', chapter: 1, type: 'narration', text: 'Autunno. La città di Kotonoha si specchia nel mare come un ricordo che non vuole svanire.', next: 'prologue_2' },
  { id: 'prologue_2', chapter: 1, type: 'narration', text: 'Circola una voce: chi scrive un desiderio in kana su un foglio bianco e lo brucia, lo vede avverarsi. Ma qualcosa viene cancellato in cambio.', next: 'prologue_3' },
  { id: 'prologue_3', chapter: 1, type: 'dialogue', speaker: 'Clomp', text: '...Mi chiamo Clomp. Mi sono appena trasferito qui. Non so ancora perché ascolto tanto e parlo poco.', next: 'prologue_4' },
  { id: 'prologue_4', chapter: 1, type: 'dialogue', speaker: 'Clomp', text: 'Quella notte, al Liceo Kotonoha, ho sentito qualcosa. Le lettere... si muovevano. Si staccavano dalle pagine.', next: 'prologue_5' },
  { id: 'prologue_5', chapter: 1, type: 'narration', text: 'Il corridoio del primo piano è immerso nel buio. La luna filtra dalle finestre, disegnando sillabe d\'argento sul pavimento.', next: 'prologue_6' },
  { id: 'prologue_6', chapter: 1, type: 'dialogue', speaker: '???', text: '...Puoi sentirmi? Davvero?', next: 'prologue_7' },
  { id: 'prologue_7', chapter: 1, type: 'dialogue', speaker: 'Clomp', text: 'Chi... chi sei?', next: 'prologue_8' },
  { id: 'prologue_8', chapter: 1, type: 'dialogue', speaker: '???', text: 'Sono あ. Mi chiamo A. Sono una lettera. E stanotte ho paura di essere cancellata.', next: 'prologue_9' },
  { id: 'prologue_9', chapter: 1, type: 'choice', text: 'Come rispondi?', choices: [
    { text: 'Non ti cancellerò nessuno.', flag: 'protect_kana' },
    { text: 'Perché hai paura?', flag: 'curious_kana' },
    { text: '...Dimmi cosa sta succedendo.', flag: 'ask_truth' },
  ], next: 'prologue_10' },
  { id: 'prologue_10', chapter: 1, type: 'narration', text: 'La prima lettera si unisce a te. Il suo glifo brilla sul tuo quaderno come una promessa.', next: 'tutorial_battle' },
  { id: 'tutorial_battle', chapter: 1, type: 'narration', text: 'Un\'ombra si materializza nel corridoio. È fatta di inchiostro rappreso e parole cancellate. Preparati al primo combattimento.', next: undefined },
];

// Dungeon maps (simplified grid format)
export interface DungeonMap {
  id: string;
  name: string;
  theme: 'school' | 'port' | 'mall' | 'hospital' | 'library' | 'void';
  floors: number;
  grid: string[];
  enemies: string[];
  boss: string;
}

export const DUNGEON_MAPS: DungeonMap[] = [
  {
    id: 'd1',
    name: 'Liceo di Notte',
    theme: 'school',
    floors: 2,
    grid: [
      '##########',
      '#P.......#',
      '#.##.##..#',
      '#.#....#.#',
      '#.#.##.#.#',
      '#...#....#',
      '#.##.#.#.#',
      '#......#.#',
      '#.##.....#',
      '####B#####',
    ],
    enemies: ['Ombra di Kaito', 'Eco di Corridoio', 'Pagina Strappata'],
    boss: 'Ombra di Kaito',
  },
  {
    id: 'd2',
    name: 'Porto Dimenticato',
    theme: 'port',
    floors: 2,
    grid: [
      '##########',
      '#P..#....#',
      '#.#.#.##.#',
      '#.#....#.#',
      '#.####...#',
      '#......#.#',
      '#.##.#.#.#',
      '#.#....#.#',
      '#.#.##...#',
      '####B#####',
    ],
    enemies: ['Il Mare Muto', 'Riflesso Sommerso', 'Ancora Parlante'],
    boss: 'Il Mare Muto',
  },
  {
    id: 'd3',
    name: 'Grande Magazzino Hoshi',
    theme: 'mall',
    floors: 2,
    grid: [
      '##########',
      '#P.......#',
      '#.##.#.#.#',
      '#....#.#.#',
      '#.##...#.#',
      '#.#.##.#.#',
      '#.#....#.#',
      '#.####.#.#',
      '#......#.#',
      '####B#####',
    ],
    enemies: ['La Vetrina', 'Manichino Vuoto', 'Prezzo Cancellato'],
    boss: 'La Vetrina',
  },
];

// Characters
export interface Character {
  name: string;
  role: string;
  description: string;
  color: string;
}

export const CHARACTERS: Character[] = [
  { name: 'Clomp', role: 'Protagonista', description: '16 anni, lunghi capelli blu. Ascoltatore silenzioso.', color: '#4488ff' },
  { name: 'Sana Mirei', role: 'Compagna di classe', description: 'Non parla più da quando il fratello Ren è sparito.', color: '#ff6688' },
  { name: 'Kaito Arima', role: 'Presidente di classe', description: 'Perfezionismo, paura del fallimento.', color: '#ffaa44' },
  { name: 'Hana Umino', role: 'Figlia di un pescatore', description: 'Lutto congelato per il padre perduto in mare.', color: '#44ccff' },
  { name: 'Yui Hoshino', role: 'Ragazza popolare', description: 'Molte maschere, senso di vuoto.', color: '#ff88cc' },
  { name: 'Dott. Tachibana', role: 'Psicologo scolastico', description: 'Ha fondato il Progetto Bianco.', color: '#ffffff' },
];

// Element colors
export const ELEMENT_COLORS: Record<Element, string> = {
  luce: '#ffee88',
  fuoco: '#ff6644',
  ghiaccio: '#88ddff',
  vento: '#88ff88',
  fulmine: '#ffdd44',
  terra: '#cc8844',
  ombra: '#8844aa',
  fisico: '#cccccc',
};
