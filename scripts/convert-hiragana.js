const fs = require('fs');
const path = require('path');

// Hiragana characters with romaji
const hiragana = [
  // Basic (Gojūon)
  { character: 'あ', romaji: 'a', meaning: 'a' },
  { character: 'い', romaji: 'i', meaning: 'i' },
  { character: 'う', romaji: 'u', meaning: 'u' },
  { character: 'え', romaji: 'e', meaning: 'e' },
  { character: 'お', romaji: 'o', meaning: 'o' },
  { character: 'か', romaji: 'ka', meaning: 'ka' },
  { character: 'き', romaji: 'ki', meaning: 'ki' },
  { character: 'く', romaji: 'ku', meaning: 'ku' },
  { character: 'け', romaji: 'ke', meaning: 'ke' },
  { character: 'こ', romaji: 'ko', meaning: 'ko' },
  { character: 'さ', romaji: 'sa', meaning: 'sa' },
  { character: 'し', romaji: 'shi', meaning: 'shi' },
  { character: 'す', romaji: 'su', meaning: 'su' },
  { character: 'せ', romaji: 'se', meaning: 'se' },
  { character: 'そ', romaji: 'so', meaning: 'so' },
  { character: 'た', romaji: 'ta', meaning: 'ta' },
  { character: 'ち', romaji: 'chi', meaning: 'chi' },
  { character: 'つ', romaji: 'tsu', meaning: 'tsu' },
  { character: 'て', romaji: 'te', meaning: 'te' },
  { character: 'と', romaji: 'to', meaning: 'to' },
  { character: 'な', romaji: 'na', meaning: 'na' },
  { character: 'に', romaji: 'ni', meaning: 'ni' },
  { character: 'ぬ', romaji: 'nu', meaning: 'nu' },
  { character: 'ね', romaji: 'ne', meaning: 'ne' },
  { character: 'の', romaji: 'no', meaning: 'no' },
  { character: 'は', romaji: 'ha', meaning: 'ha' },
  { character: 'ひ', romaji: 'hi', meaning: 'hi' },
  { character: 'ふ', romaji: 'fu', meaning: 'fu' },
  { character: 'へ', romaji: 'he', meaning: 'he' },
  { character: 'ほ', romaji: 'ho', meaning: 'ho' },
  { character: 'ま', romaji: 'ma', meaning: 'ma' },
  { character: 'み', romaji: 'mi', meaning: 'mi' },
  { character: 'む', romaji: 'mu', meaning: 'mu' },
  { character: 'め', romaji: 'me', meaning: 'me' },
  { character: 'も', romaji: 'mo', meaning: 'mo' },
  { character: 'や', romaji: 'ya', meaning: 'ya' },
  { character: 'ゆ', romaji: 'yu', meaning: 'yu' },
  { character: 'よ', romaji: 'yo', meaning: 'yo' },
  { character: 'ら', romaji: 'ra', meaning: 'ra' },
  { character: 'り', romaji: 'ri', meaning: 'ri' },
  { character: 'る', romaji: 'ru', meaning: 'ru' },
  { character: 'れ', romaji: 're', meaning: 're' },
  { character: 'ろ', romaji: 'ro', meaning: 'ro' },
  { character: 'わ', romaji: 'wa', meaning: 'wa' },
  { character: 'を', romaji: 'wo', meaning: 'wo' },
  { character: 'ん', romaji: 'n', meaning: 'n' },

  // Dakuten (Voiced)
  { character: 'が', romaji: 'ga', meaning: 'ga' },
  { character: 'ぎ', romaji: 'gi', meaning: 'gi' },
  { character: 'ぐ', romaji: 'gu', meaning: 'gu' },
  { character: 'げ', romaji: 'ge', meaning: 'ge' },
  { character: 'ご', romaji: 'go', meaning: 'go' },
  { character: 'ざ', romaji: 'za', meaning: 'za' },
  { character: 'じ', romaji: 'ji', meaning: 'ji' },
  { character: 'ず', romaji: 'zu', meaning: 'zu' },
  { character: 'ぜ', romaji: 'ze', meaning: 'ze' },
  { character: 'ぞ', romaji: 'zo', meaning: 'zo' },
  { character: 'だ', romaji: 'da', meaning: 'da' },
  { character: 'ぢ', romaji: 'di', meaning: 'di' },
  { character: 'づ', romaji: 'du', meaning: 'du' },
  { character: 'で', romaji: 'de', meaning: 'de' },
  { character: 'ど', romaji: 'do', meaning: 'do' },
  { character: 'ば', romaji: 'ba', meaning: 'ba' },
  { character: 'び', romaji: 'bi', meaning: 'bi' },
  { character: 'ぶ', romaji: 'bu', meaning: 'bu' },
  { character: 'べ', romaji: 'be', meaning: 'be' },
  { character: 'ぼ', romaji: 'bo', meaning: 'bo' },

  // Handakuten (Semi-voiced)
  { character: 'ぱ', romaji: 'pa', meaning: 'pa' },
  { character: 'ぴ', romaji: 'pi', meaning: 'pi' },
  { character: 'ぷ', romaji: 'pu', meaning: 'pu' },
  { character: 'ぺ', romaji: 'pe', meaning: 'pe' },
  { character: 'ぽ', romaji: 'po', meaning: 'po' },

  // Combo (Yōon)
  { character: 'きゃ', romaji: 'kya', meaning: 'kya' },
  { character: 'きゅ', romaji: 'kyu', meaning: 'kyu' },
  { character: 'きょ', romaji: 'kyo', meaning: 'kyo' },
  { character: 'しゃ', romaji: 'sha', meaning: 'sha' },
  { character: 'しゅ', romaji: 'shu', meaning: 'shu' },
  { character: 'しょ', romaji: 'sho', meaning: 'sho' },
  { character: 'ちゃ', romaji: 'cha', meaning: 'cha' },
  { character: 'ちゅ', romaji: 'chu', meaning: 'chu' },
  { character: 'ちょ', romaji: 'cho', meaning: 'cho' },
  { character: 'にゃ', romaji: 'nya', meaning: 'nya' },
  { character: 'にゅ', romaji: 'nyu', meaning: 'nyu' },
  { character: 'にょ', romaji: 'nyo', meaning: 'nyo' },
  { character: 'ひゃ', romaji: 'hya', meaning: 'hya' },
  { character: 'ひゅ', romaji: 'hyu', meaning: 'hyu' },
  { character: 'ひょ', romaji: 'hyo', meaning: 'hyo' },
  { character: 'みゃ', romaji: 'mya', meaning: 'mya' },
  { character: 'みゅ', romaji: 'myu', meaning: 'myu' },
  { character: 'みょ', romaji: 'myo', meaning: 'myo' },
  { character: 'りゃ', romaji: 'rya', meaning: 'rya' },
  { character: 'りゅ', romaji: 'ryu', meaning: 'ryu' },
  { character: 'りょ', romaji: 'ryo', meaning: 'ryo' },
  { character: 'ぎゃ', romaji: 'gya', meaning: 'gya' },
  { character: 'ぎゅ', romaji: 'gyu', meaning: 'gyu' },
  { character: 'ぎょ', romaji: 'gyo', meaning: 'gyo' },
  { character: 'じゃ', romaji: 'ja', meaning: 'ja' },
  { character: 'じゅ', romaji: 'ju', meaning: 'ju' },
  { character: 'じょ', romaji: 'jo', meaning: 'jo' },
  { character: 'びゃ', romaji: 'bya', meaning: 'bya' },
  { character: 'びゅ', romaji: 'byu', meaning: 'byu' },
  { character: 'びょ', romaji: 'byo', meaning: 'byo' },
  { character: 'ぴゃ', romaji: 'pya', meaning: 'pya' },
  { character: 'ぴゅ', romaji: 'pyu', meaning: 'pyu' },
  { character: 'ぴょ', romaji: 'pyo', meaning: 'pyo' }
];

// Generate questions - ask for romaji
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

const allRomaji = hiragana.map(h => h.romaji);

const questions = hiragana.map((h, idx) => {
  const wrongOptions = generateOptions(h.romaji, allRomaji);
  const options = [...wrongOptions];
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, h.romaji);

  return {
    id: idx + 1,
    kanji: h.character,
    reading: h.character,
    romaji: h.romaji,
    meaning: h.romaji,
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
  category: "Hiragana",
  categoryJapanese: "ひらがな",
  categoryRomaji: "Hiragana",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'hiragana.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Berhasil! ${questions.length} soal hiragana dibagi menjadi ${levels.length} level.`);
