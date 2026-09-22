const fs = require('fs');
const path = require('path');

// Katakana characters with romaji
const katakana = [
  // Basic (Gojūon)
  { character: 'ア', romaji: 'a', meaning: 'a' },
  { character: 'イ', romaji: 'i', meaning: 'i' },
  { character: 'ウ', romaji: 'u', meaning: 'u' },
  { character: 'エ', romaji: 'e', meaning: 'e' },
  { character: 'オ', romaji: 'o', meaning: 'o' },
  { character: 'カ', romaji: 'ka', meaning: 'ka' },
  { character: 'キ', romaji: 'ki', meaning: 'ki' },
  { character: 'ク', romaji: 'ku', meaning: 'ku' },
  { character: 'ケ', romaji: 'ke', meaning: 'ke' },
  { character: 'コ', romaji: 'ko', meaning: 'ko' },
  { character: 'サ', romaji: 'sa', meaning: 'sa' },
  { character: 'シ', romaji: 'shi', meaning: 'shi' },
  { character: 'ス', romaji: 'su', meaning: 'su' },
  { character: 'セ', romaji: 'se', meaning: 'se' },
  { character: 'ソ', romaji: 'so', meaning: 'so' },
  { character: 'タ', romaji: 'ta', meaning: 'ta' },
  { character: 'チ', romaji: 'chi', meaning: 'chi' },
  { character: 'ツ', romaji: 'tsu', meaning: 'tsu' },
  { character: 'テ', romaji: 'te', meaning: 'te' },
  { character: 'ト', romaji: 'to', meaning: 'to' },
  { character: 'ナ', romaji: 'na', meaning: 'na' },
  { character: 'ニ', romaji: 'ni', meaning: 'ni' },
  { character: 'ヌ', romaji: 'nu', meaning: 'nu' },
  { character: 'ネ', romaji: 'ne', meaning: 'ne' },
  { character: 'ノ', romaji: 'no', meaning: 'no' },
  { character: 'ハ', romaji: 'ha', meaning: 'ha' },
  { character: 'ヒ', romaji: 'hi', meaning: 'hi' },
  { character: 'フ', romaji: 'fu', meaning: 'fu' },
  { character: 'ヘ', romaji: 'he', meaning: 'he' },
  { character: 'ホ', romaji: 'ho', meaning: 'ho' },
  { character: 'マ', romaji: 'ma', meaning: 'ma' },
  { character: 'ミ', romaji: 'mi', meaning: 'mi' },
  { character: 'ム', romaji: 'mu', meaning: 'mu' },
  { character: 'メ', romaji: 'me', meaning: 'me' },
  { character: 'モ', romaji: 'mo', meaning: 'mo' },
  { character: 'ヤ', romaji: 'ya', meaning: 'ya' },
  { character: 'ユ', romaji: 'yu', meaning: 'yu' },
  { character: 'ヨ', romaji: 'yo', meaning: 'yo' },
  { character: 'ラ', romaji: 'ra', meaning: 'ra' },
  { character: 'リ', romaji: 'ri', meaning: 'ri' },
  { character: 'ル', romaji: 'ru', meaning: 'ru' },
  { character: 'レ', romaji: 're', meaning: 're' },
  { character: 'ロ', romaji: 'ro', meaning: 'ro' },
  { character: 'ワ', romaji: 'wa', meaning: 'wa' },
  { character: 'ヲ', romaji: 'wo', meaning: 'wo' },
  { character: 'ン', romaji: 'n', meaning: 'n' },

  // Dakuten (Voiced)
  { character: 'ガ', romaji: 'ga', meaning: 'ga' },
  { character: 'ギ', romaji: 'gi', meaning: 'gi' },
  { character: 'グ', romaji: 'gu', meaning: 'gu' },
  { character: 'ゲ', romaji: 'ge', meaning: 'ge' },
  { character: 'ゴ', romaji: 'go', meaning: 'go' },
  { character: 'ザ', romaji: 'za', meaning: 'za' },
  { character: 'ジ', romaji: 'ji', meaning: 'ji' },
  { character: 'ズ', romaji: 'zu', meaning: 'zu' },
  { character: 'ゼ', romaji: 'ze', meaning: 'ze' },
  { character: 'ゾ', romaji: 'zo', meaning: 'zo' },
  { character: 'ダ', romaji: 'da', meaning: 'da' },
  { character: 'ヂ', romaji: 'di', meaning: 'di' },
  { character: 'ヅ', romaji: 'du', meaning: 'du' },
  { character: 'デ', romaji: 'de', meaning: 'de' },
  { character: 'ド', romaji: 'do', meaning: 'do' },
  { character: 'バ', romaji: 'ba', meaning: 'ba' },
  { character: 'ビ', romaji: 'bi', meaning: 'bi' },
  { character: 'ブ', romaji: 'bu', meaning: 'bu' },
  { character: 'ベ', romaji: 'be', meaning: 'be' },
  { character: 'ボ', romaji: 'bo', meaning: 'bo' },

  // Handakuten (Semi-voiced)
  { character: 'パ', romaji: 'pa', meaning: 'pa' },
  { character: 'ピ', romaji: 'pi', meaning: 'pi' },
  { character: 'プ', romaji: 'pu', meaning: 'pu' },
  { character: 'ペ', romaji: 'pe', meaning: 'pe' },
  { character: 'ポ', romaji: 'po', meaning: 'po' },

  // Combo (Yōon)
  { character: 'キャ', romaji: 'kya', meaning: 'kya' },
  { character: 'キュ', romaji: 'kyu', meaning: 'kyu' },
  { character: 'キョ', romaji: 'kyo', meaning: 'kyo' },
  { character: 'シャ', romaji: 'sha', meaning: 'sha' },
  { character: 'シュ', romaji: 'shu', meaning: 'shu' },
  { character: 'ショ', romaji: 'sho', meaning: 'sho' },
  { character: 'チャ', romaji: 'cha', meaning: 'cha' },
  { character: 'チュ', romaji: 'chu', meaning: 'chu' },
  { character: 'チョ', romaji: 'cho', meaning: 'cho' },
  { character: 'ニャ', romaji: 'nya', meaning: 'nya' },
  { character: 'ニュ', romaji: 'nyu', meaning: 'nyu' },
  { character: 'ニョ', romaji: 'nyo', meaning: 'nyo' },
  { character: 'ヒャ', romaji: 'hya', meaning: 'hya' },
  { character: 'ヒュ', romaji: 'hyu', meaning: 'hyu' },
  { character: 'ヒョ', romaji: 'hyo', meaning: 'hyo' },
  { character: 'ミャ', romaji: 'mya', meaning: 'mya' },
  { character: 'ミュ', romaji: 'myu', meaning: 'myu' },
  { character: 'ミョ', romaji: 'myo', meaning: 'myo' },
  { character: 'リャ', romaji: 'rya', meaning: 'rya' },
  { character: 'リュ', romaji: 'ryu', meaning: 'ryu' },
  { character: 'リョ', romaji: 'ryo', meaning: 'ryo' },
  { character: 'ギャ', romaji: 'gya', meaning: 'gya' },
  { character: 'ギュ', romaji: 'gyu', meaning: 'gyu' },
  { character: 'ギョ', romaji: 'gyo', meaning: 'gyo' },
  { character: 'ジャ', romaji: 'ja', meaning: 'ja' },
  { character: 'ジュ', romaji: 'ju', meaning: 'ju' },
  { character: 'ジョ', romaji: 'jo', meaning: 'jo' },
  { character: 'ビャ', romaji: 'bya', meaning: 'bya' },
  { character: 'ビュ', romaji: 'byu', meaning: 'byu' },
  { character: 'ビョ', romaji: 'byo', meaning: 'byo' },
  { character: 'ピャ', romaji: 'pya', meaning: 'pya' },
  { character: 'ピュ', romaji: 'pyu', meaning: 'pyu' },
  { character: 'ピョ', romaji: 'pyo', meaning: 'pyo' }
];

// Generate questions
function generateOptions(correctRomaji, allRomaji) {
  const wrongOptions = [];
  const otherRomaji = allRomaji.filter(r => r !== correctRomaji);
  const shuffled = otherRomaji.sort(() => 0.5 - Math.random());

  for (const r of shuffled) {
    if (wrongOptions.length >= 3) break;
    if (!wrongOptions.includes(r)) {
      wrongOptions.push(r);
    }
  }

  return wrongOptions.slice(0, 3);
}

const allRomaji = katakana.map(k => k.romaji);

const questions = katakana.map((k, idx) => {
  const wrongOptions = generateOptions(k.romaji, allRomaji);
  const options = [...wrongOptions];
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, k.romaji);

  return {
    id: idx + 1,
    kanji: k.character,
    reading: k.character,
    romaji: k.romaji,
    meaning: k.romaji,
    options: options,
    correctIndex: correctIndex
  };
});

// Split into levels of 25
const levels = [];
for (let i = 0; i < questions.length; i += 25) {
  const levelQuestions = questions.slice(i, i + 25);

  // Regenerate options from same level only
  const levelRomaji = levelQuestions.map(q => q.romaji);
  levelQuestions.forEach(q => {
    const wrongOptions = [];
    const otherRomaji = levelRomaji.filter(r => r !== q.romaji);
    const shuffled = otherRomaji.sort(() => 0.5 - Math.random());
    for (const r of shuffled) {
      if (wrongOptions.length >= 3) break;
      if (!wrongOptions.includes(r)) {
        wrongOptions.push(r);
      }
    }
    const options = [...wrongOptions.slice(0, 3)];
    const correctIdx = Math.floor(Math.random() * 4);
    options.splice(correctIdx, 0, q.romaji);
    q.options = options;
    q.correctIndex = correctIdx;
  });

  levels.push({
    level: levels.length + 1,
    questions: levelQuestions
  });
}

const output = {
  category: "Katakana",
  categoryJapanese: "カタカナ",
  categoryRomaji: "Katakana",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'katakana.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Berhasil! ${questions.length} soal katakana dibagi menjadi ${levels.length} level.`);
