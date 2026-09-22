const fs = require('fs');
const path = require('path');

// ===== ROMAJI MAP =====
const romajiMap = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  'っ': '',
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
  'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
  'ッ': ''
};

function textToRomaji(text) {
  if (/^[a-zA-Z\s]+$/.test(text)) return text;
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (i + 2 < text.length) {
      const combo3 = text.substring(i, i + 3);
      if (romajiMap[combo3]) {
        result += romajiMap[combo3];
        i += 3;
        continue;
      }
    }
    if (i + 1 < text.length) {
      const combo2 = text.substring(i, i + 2);
      if (romajiMap[combo2]) {
        result += romajiMap[combo2];
        i += 2;
        continue;
      }
    }
    const char = text[i];
    if (char === 'っ' || char === 'ッ') {
      if (i + 1 < text.length) {
        const nextChar = text[i + 1];
        const nextRomaji = romajiMap[nextChar];
        if (nextRomaji && nextRomaji.length > 0) {
          result += nextRomaji[0];
        }
      }
    } else {
      result += romajiMap[char] || char;
    }
    i++;
  }
  return result;
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanMeaning(meaning) {
  return meaning
    .replace(/\s*\(\s*\)\s*/g, ' ')
    .replace(/\s*—\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[,\s]+$/, '')
    .trim();
}

function isJapanese(str) {
  if (!str || str.length === 0) return false;
  return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～]+$/.test(str);
}

function isJapaneseOnly(str) {
  if (!str || str.length === 0) return false;
  return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF]+$/.test(str);
}

function isNumber(str) {
  return /^\d+$/.test(str);
}

function isHeaderLine(line) {
  const headers = [
    'KATA KERJA', 'INDONESIA', 'JEPANG', 'KANJI', 'NO', 'Bahasa',
    'KATA SIFAT', 'Kelompok', 'Minna', 'Daftar', 'Arti', 'Nomor',
    'Jepang', 'Indonesia', 'No.', '-', 'Kata'
  ];
  return headers.some(h => line.includes(h));
}

// ===== PROCESS VERBS - FIXED =====
function processVerbs() {
  const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'kerja_n4_extracted.txt');
  const rawText = fs.readFileSync(inputPath, 'utf8');
  const lines = rawText.split('\n').map(l => l.trim());

  const verbs = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isNumber(line)) {
      let meaningParts = [];
      let japaneseParts = [];
      let kanjiParts = [];
      let j = i + 1;
      let phase = 'meaning'; // meaning, japanese, kanji

      while (j < lines.length) {
        const nextLine = lines[j];
        
        // If we hit a new number, stop
        if (isNumber(nextLine)) break;
        
        // Skip empty lines
        if (!nextLine || nextLine.length === 0) {
          j++;
          continue;
        }

        // Skip header lines
        if (isHeaderLine(nextLine)) {
          j++;
          continue;
        }

        // Check if it's Japanese
        if (isJapaneseOnly(nextLine)) {
          if (phase === 'meaning') {
            phase = 'japanese';
          }
          
          if (phase === 'japanese') {
            japaneseParts.push(nextLine);
          } else if (phase === 'kanji') {
            kanjiParts.push(nextLine);
          }
          j++;
          continue;
        }

        // If it's a number but not the entry number, it's part of meaning
        if (/^\d+$/.test(nextLine)) {
          meaningParts.push(nextLine);
          j++;
          continue;
        }

        // If we're in Japanese phase and hit non-Japanese, switch to kanji phase
        if (phase === 'japanese' && !isJapanese(nextLine)) {
          phase = 'kanji';
          // Don't increment j, process this line as kanji or meaning
          continue;
        }

        // Otherwise, it's part of the meaning
        meaningParts.push(nextLine);
        j++;
      }

      // Combine Japanese parts (handle split words)
      let japanese = japaneseParts.join('');
      
      // Combine meaning parts
      let meaning = meaningParts.join(' ').replace(/\s+/g, ' ').trim();
      meaning = cleanMeaning(meaning);

      // Get kanji
      let kanji = kanjiParts.length > 0 ? kanjiParts.join('') : japanese;

      if (japanese.length > 0 && meaning.length > 0) {
        // Check for duplicates
        const existingIndex = verbs.findIndex(v => v.japanese === japanese);
        if (existingIndex >= 0) {
          const existingMeaning = verbs[existingIndex].meaning;
          if (existingMeaning !== meaning) {
            verbs.push({
              japanese: japanese,
              kanji: kanji,
              meaning: meaning
            });
          }
        } else {
          verbs.push({
            japanese: japanese,
            kanji: kanji,
            meaning: meaning
          });
        }
      }
    }
    i++;
  }

  return verbs;
}

// ===== PROCESS NOUNS - FIXED =====
function processNouns() {
  const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'minna_extracted.txt');
  const rawText = fs.readFileSync(inputPath, 'utf8');
  const lines = rawText.split('\n').map(l => l.trim());

  const words = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isNumber(line)) {
      let japanese = '';
      let meaningParts = [];
      let j = i + 1;

      // Get Japanese
      while (j < lines.length && j < i + 5) {
        const nextLine = lines[j];
        if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
          japanese = nextLine;
          j++;
          break;
        }
        j++;
      }

      // Get meaning
      while (j < lines.length) {
        const nextLine = lines[j];
        if (isNumber(nextLine)) break;
        
        if (nextLine && nextLine.length > 0 && !isJapanese(nextLine)) {
          if (isHeaderLine(nextLine)) {
            j++;
            continue;
          }
          meaningParts.push(nextLine);
        }
        j++;
      }

      if (japanese && meaningParts.length > 0 && japanese.length > 0) {
        let meaning = meaningParts.join(' ').replace(/\s+/g, ' ').trim();
        meaning = meaning.replace(/[,\s]+$/, '').trim();

        words.push({
          japanese: japanese,
          kanji: japanese,
          meaning: meaning
        });
      }
    }
    i++;
  }

  return words;
}

// ===== PROCESS ADJECTIVES - FIXED =====
function processAdjectives() {
  const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'sifat_extracted.txt');
  const rawText = fs.readFileSync(inputPath, 'utf8');
  const lines = rawText.split('\n').map(l => l.trim());

  const adjectives = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isNumber(line)) {
      let meaningParts = [];
      let japaneseParts = [];
      let kanjiParts = [];
      let j = i + 1;
      let phase = 'meaning';

      while (j < lines.length) {
        const nextLine = lines[j];
        if (isNumber(nextLine)) break;
        
        if (!nextLine || nextLine.length === 0) {
          j++;
          continue;
        }

        if (isHeaderLine(nextLine)) {
          j++;
          continue;
        }

        if (isJapaneseOnly(nextLine)) {
          if (phase === 'meaning') {
            phase = 'japanese';
          }
          
          if (phase === 'japanese') {
            japaneseParts.push(nextLine);
          } else if (phase === 'kanji') {
            kanjiParts.push(nextLine);
          }
          j++;
          continue;
        }

        if (/^\d+$/.test(nextLine)) {
          meaningParts.push(nextLine);
          j++;
          continue;
        }

        if (phase === 'japanese' && !isJapanese(nextLine)) {
          phase = 'kanji';
          continue;
        }

        meaningParts.push(nextLine);
        j++;
      }

      let japanese = japaneseParts.join('');
      let meaning = meaningParts.join(' ').replace(/\s+/g, ' ').trim();
      meaning = cleanMeaning(meaning);
      let kanji = kanjiParts.length > 0 ? kanjiParts.join('') : japanese;

      if (japanese.length > 0 && meaning.length > 0) {
        adjectives.push({
          japanese: japanese,
          kanji: kanji,
          meaning: meaning
        });
      }
    }
    i++;
  }

  return adjectives;
}

// ===== GENERATE QUESTIONS =====
function generateOptions(correctMeaning, allMeanings) {
  const wrongOptions = [];
  const otherMeanings = allMeanings.filter(m => m !== correctMeaning);
  const shuffled = otherMeanings.sort(() => 0.5 - Math.random());

  for (const m of shuffled) {
    if (wrongOptions.length >= 3) break;
    if (!wrongOptions.includes(m)) {
      wrongOptions.push(m);
    }
  }

  if (wrongOptions.length < 3) {
    const allOther = allMeanings.filter(m => m !== correctMeaning && !wrongOptions.includes(m));
    const shuffledAll = allOther.sort(() => 0.5 - Math.random());
    for (const m of shuffledAll) {
      if (wrongOptions.length >= 3) break;
      wrongOptions.push(m);
    }
  }

  return wrongOptions.slice(0, 3);
}

function createQuestions(items) {
  const allMeanings = items.map(item => item.meaning);
  
  return items.map((item, idx) => {
    const romaji = textToRomaji(item.japanese);
    
    const wrongOptions = generateOptions(item.meaning, allMeanings);
    const options = wrongOptions.map(opt => capitalize(opt));
    const correctIndex = Math.floor(Math.random() * 4);
    options.splice(correctIndex, 0, capitalize(item.meaning));
    
    return {
      id: idx + 1,
      kanji: item.kanji,
      reading: item.japanese,
      romaji: romaji,
      meaning: capitalize(item.meaning),
      options: options,
      correctIndex: correctIndex
    };
  });
}

function createLevels(questions) {
  const levels = [];
  for (let i = 0; i < questions.length; i += 50) {
    levels.push({
      level: levels.length + 1,
      questions: questions.slice(i, i + 50)
    });
  }
  return levels;
}

// ===== MAIN =====
console.log('Processing vocabulary data...\n');

const nouns = processNouns();
console.log(`Nouns extracted: ${nouns.length}`);

const verbs = processVerbs();
console.log(`Verbs extracted: ${verbs.length}`);

const adjectives = processAdjectives();
console.log(`Adjectives extracted: ${adjectives.length}`);

// Create questions
const nounQuestions = createQuestions(nouns);
const verbQuestions = createQuestions(verbs);
const adjectiveQuestions = createQuestions(adjectives);

// Save
fs.writeFileSync(path.join(__dirname, '..', 'data', 'nouns.json'), JSON.stringify({
  category: "Kata Benda",
  categoryJapanese: "名詞",
  categoryRomaji: "Meishi",
  levels: createLevels(nounQuestions)
}, null, 2), 'utf8');

fs.writeFileSync(path.join(__dirname, '..', 'data', 'verbs.json'), JSON.stringify({
  category: "Kata Kerja",
  categoryJapanese: "動詞",
  categoryRomaji: "Doushi",
  levels: createLevels(verbQuestions)
}, null, 2), 'utf8');

fs.writeFileSync(path.join(__dirname, '..', 'data', 'adjectives.json'), JSON.stringify({
  category: "Kata Sifat",
  categoryJapanese: "形容詞",
  categoryRomaji: "Keiyoushi",
  levels: createLevels(adjectiveQuestions)
}, null, 2), 'utf8');

console.log(`\nNouns: ${nounQuestions.length} questions`);
console.log(`Verbs: ${verbQuestions.length} questions`);
console.log(`Adjectives: ${adjectiveQuestions.length} questions`);

// ===== VERIFICATION =====
console.log('\n===== VERIFICATION =====');

// Check specific problem words
const checkWords = [
  { japanese: 'いる', category: 'verbs' },
  { japanese: 'まつ', category: 'verbs' },
  { japanese: 'ひく', category: 'verbs' },
  { japanese: 'よむ', category: 'verbs' },
  { japanese: 'きく', category: 'verbs' },
  { japanese: 'つく', category: 'verbs' },
  { japanese: 'とうちゃくする', category: 'verbs' },
];

console.log('\nChecking specific words:');
checkWords.forEach(check => {
  let found;
  if (check.category === 'verbs') {
    found = verbQuestions.filter(q => q.reading === check.japanese);
  } else if (check.category === 'nouns') {
    found = [nounQuestions.find(q => q.reading === check.japanese)].filter(Boolean);
  } else {
    found = [adjectiveQuestions.find(q => q.reading === check.japanese)].filter(Boolean);
  }
  
  if (found && found.length > 0) {
    found.forEach(q => {
      console.log(`✓ ${q.reading} (${q.romaji}): ${q.meaning}`);
    });
  } else {
    console.log(`✗ ${check.japanese}: NOT FOUND`);
  }
});

// Check for incomplete readings (single character)
console.log('\nChecking for incomplete readings (single character):');
const singleCharVerbs = verbQuestions.filter(q => q.reading.length === 1);
singleCharVerbs.forEach(q => {
  console.log(`  ${q.reading} (${q.romaji}): ${q.meaning}`);
});

// Sample from each category
console.log('\n--- Sample Verbs ---');
verbQuestions.slice(0, 15).forEach(q => {
  console.log(`${q.reading} (${q.romaji}): ${q.meaning}`);
});
