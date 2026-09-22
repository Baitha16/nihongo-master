const fs = require('fs');
const path = require('path');

// ===== FIXED ROMAJI WITH SMALL KANA =====
const romajiMap = {
  // Basic vowels
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  // K-row
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  // S-row
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  // T-row
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  // N-row
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  // H-row
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  // M-row
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  // Y-row
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  // R-row
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  // W-row
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  // G-row (dakuten)
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  // Z-row (dakuten)
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  // D-row (dakuten)
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  // B-row (dakuten)
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  // P-row (handakuten)
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  // Small kana (yōon)
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
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  // Small tsu (sokuon) - handled separately
  'っ': '',
  // Katakana
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
  // Katakana yōon
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
  'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
  'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
  'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
  'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
  'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
  // Small kana in katakana
  'ァ': 'a', 'ィ': 'i', 'ゥ': 'u', 'ェ': 'e', 'ォ': 'o',
  'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo',
  'ッ': ''
};

function textToRomaji(text) {
  if (/^[a-zA-Z\s]+$/.test(text)) return text;
  
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    // Check for 3-character combo first
    if (i + 2 < text.length) {
      const combo3 = text.substring(i, i + 3);
      if (romajiMap[combo3]) {
        result += romajiMap[combo3];
        i += 3;
        continue;
      }
    }
    
    // Check for 2-character combo
    if (i + 1 < text.length) {
      const combo2 = text.substring(i, i + 2);
      if (romajiMap[combo2]) {
        result += romajiMap[combo2];
        i += 2;
        continue;
      }
    }
    
    // Single character
    const char = text[i];
    const romaji = romajiMap[char];
    
    // Handle small tsu (っ) - double the next consonant
    if (char === 'っ' || char === 'ッ') {
      if (i + 1 < text.length) {
        const nextChar = text[i + 1];
        const nextRomaji = romajiMap[nextChar];
        if (nextRomaji && nextRomaji.length > 0) {
          result += nextRomaji[0];
        }
      }
    } else if (romaji !== undefined) {
      result += romaji;
    } else {
      result += char;
    }
    i++;
  }
  
  return result;
}

// ===== CAPITALIZE FIRST LETTER =====
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== CLEAN ARTIFACTS =====
function cleanMeaning(meaning) {
  let cleaned = meaning
    .replace(/\s*\(\s*\)\s*/g, ' ')
    .replace(/\s*—\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[,\s]+$/, '')
    .trim();
  return cleaned;
}

// ===== PROCESS NOUNS =====
function processNouns() {
  const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'minna_extracted.txt');
  const rawText = fs.readFileSync(inputPath, 'utf8');
  const lines = rawText.split('\n').map(l => l.trim());

  function isJapanese(str) {
    return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～]+$/.test(str);
  }

  function isNumber(str) {
    return /^\d+$/.test(str);
  }

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

      // Get ALL meaning parts until next number
      while (j < lines.length) {
        const nextLine = lines[j];
        if (isNumber(nextLine)) break;
        
        if (nextLine && nextLine.length > 0 && !isJapanese(nextLine)) {
          if (nextLine.includes('Kelompok') || nextLine.includes('Minna') || 
              nextLine.includes('Daftar') || nextLine.includes('Bahasa') || 
              nextLine.includes('Arti') || nextLine.includes('Nomor') ||
              nextLine === 'Jepang' || nextLine === 'Indonesia' || 
              nextLine === 'No.' || nextLine === '-' || 
              nextLine.includes('Kata')) {
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
          meaning: meaning
        });
      }
    }
    i++;
  }

  return words;
}

// ===== PROCESS VERBS =====
function processVerbs() {
  const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'kerja_n4_extracted.txt');
  const rawText = fs.readFileSync(inputPath, 'utf8');
  const lines = rawText.split('\n').map(l => l.trim());

  function isJapanese(str) {
    return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～]+$/.test(str);
  }

  function isNumber(str) {
    return /^\d+$/.test(str);
  }

  const verbs = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isNumber(line)) {
      let meaningParts = [];
      let japanese = '';
      let kanjiFromSource = '';
      let j = i + 1;

      // Get meaning parts until we hit Japanese
      while (j < lines.length && j < i + 20) {
        const nextLine = lines[j];
        
        if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
          japanese = nextLine;
          j++;
          break;
        }
        
        if (nextLine && nextLine.length > 0 && !isJapanese(nextLine) && !isNumber(nextLine)) {
          if (nextLine.includes('KATA KERJA') || nextLine.includes('INDONESIA') || 
              nextLine.includes('JEPANG') || nextLine.includes('KANJI') || 
              nextLine === 'NO' || nextLine === '-' || 
              nextLine.includes('NO.') || nextLine.includes('Bahasa')) {
            j++;
            continue;
          }
          meaningParts.push(nextLine);
        }
        j++;
      }

      // Get kanji from source (if available)
      while (j < lines.length && j < i + 25) {
        const nextLine = lines[j];
        if (isNumber(nextLine)) break;
        
        if (nextLine && isJapanese(nextLine) && nextLine.length > 0 && nextLine !== japanese) {
          kanjiFromSource = nextLine;
          j++;
          break;
        }
        j++;
      }

      if (meaningParts.length > 0 && japanese && japanese.length > 0) {
        let meaning = meaningParts.join(' ').replace(/\s+/g, ' ').trim();
        meaning = cleanMeaning(meaning);

        verbs.push({
          japanese: japanese,
          kanjiFromSource: kanjiFromSource,
          meaning: meaning
        });
      }
    }
    i++;
  }

  return verbs;
}

// ===== PROCESS ADJECTIVES =====
function processAdjectives() {
  const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'sifat_extracted.txt');
  const rawText = fs.readFileSync(inputPath, 'utf8');
  const lines = rawText.split('\n').map(l => l.trim());

  function isJapanese(str) {
    return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～（）\-]+$/.test(str);
  }

  function isNumber(str) {
    return /^\d+$/.test(str);
  }

  const adjectives = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isNumber(line)) {
      let meaningParts = [];
      let japanese = '';
      let kanjiFromSource = '';
      let j = i + 1;

      // Get meaning parts until we hit Japanese
      while (j < lines.length && j < i + 15) {
        const nextLine = lines[j];
        
        if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
          japanese = nextLine;
          j++;
          break;
        }
        
        if (nextLine && nextLine.length > 0 && !isJapanese(nextLine) && !isNumber(nextLine)) {
          if (nextLine.includes('KATA SIFAT') || nextLine.includes('INDONESIA') || 
              nextLine.includes('KANJI') || nextLine === 'NO' || 
              nextLine === '-' || nextLine.includes('NO.') || 
              nextLine.includes('Bahasa')) {
            j++;
            continue;
          }
          meaningParts.push(nextLine);
        }
        j++;
      }

      // Get kanji from source (if available)
      while (j < lines.length && j < i + 20) {
        const nextLine = lines[j];
        if (isNumber(nextLine)) break;
        
        if (nextLine && isJapanese(nextLine) && nextLine.length > 0 && nextLine !== japanese) {
          kanjiFromSource = nextLine;
          j++;
          break;
        }
        j++;
      }

      if (meaningParts.length > 0 && japanese && japanese.length > 0) {
        let meaning = meaningParts.join(' ').replace(/\s+/g, ' ').trim();
        meaning = cleanMeaning(meaning);

        adjectives.push({
          japanese: japanese,
          kanjiFromSource: kanjiFromSource,
          meaning: meaning
        });
      }
    }
    i++;
  }

  return adjectives;
}

// ===== MAIN PROCESSING =====
console.log('Processing vocabulary data...\n');

// Process nouns
const nouns = processNouns();
console.log(`Nouns extracted: ${nouns.length}`);

// Process verbs
const verbs = processVerbs();
console.log(`Verbs extracted: ${verbs.length}`);

// Process adjectives
const adjectives = processAdjectives();
console.log(`Adjectives extracted: ${adjectives.length}`);

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

function createQuestions(items, category) {
  const allMeanings = items.map(item => item.meaning);
  
  return items.map((item, idx) => {
    const romaji = textToRomaji(item.japanese);
    const kanji = item.kanjiFromSource || item.japanese;
    
    const wrongOptions = generateOptions(item.meaning, allMeanings);
    const options = wrongOptions.map(opt => capitalize(opt));
    const correctIndex = Math.floor(Math.random() * 4);
    options.splice(correctIndex, 0, capitalize(item.meaning));
    
    return {
      id: idx + 1,
      kanji: kanji,
      reading: item.japanese,
      romaji: romaji,
      meaning: capitalize(item.meaning),
      options: options,
      correctIndex: correctIndex
    };
  });
}

// Create questions for each category
const nounQuestions = createQuestions(nouns, 'nouns');
const verbQuestions = createQuestions(verbs, 'verbs');
const adjectiveQuestions = createQuestions(adjectives, 'adjectives');

// Split into levels of 50
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

// Save nouns
const nounsOutput = {
  category: "Kata Benda",
  categoryJapanese: "名詞",
  categoryRomaji: "Meishi",
  levels: createLevels(nounQuestions)
};
fs.writeFileSync(path.join(__dirname, '..', 'data', 'nouns.json'), JSON.stringify(nounsOutput, null, 2), 'utf8');
console.log(`\nNouns saved: ${nounQuestions.length} questions in ${nounsOutput.levels.length} levels`);

// Save verbs
const verbsOutput = {
  category: "Kata Kerja",
  categoryJapanese: "動詞",
  categoryRomaji: "Doushi",
  levels: createLevels(verbQuestions)
};
fs.writeFileSync(path.join(__dirname, '..', 'data', 'verbs.json'), JSON.stringify(verbsOutput, null, 2), 'utf8');
console.log(`Verbs saved: ${verbQuestions.length} questions in ${verbsOutput.levels.length} levels`);

// Save adjectives
const adjectivesOutput = {
  category: "Kata Sifat",
  categoryJapanese: "形容詞",
  categoryRomaji: "Keiyoushi",
  levels: createLevels(adjectiveQuestions)
};
fs.writeFileSync(path.join(__dirname, '..', 'data', 'adjectives.json'), JSON.stringify(adjectivesOutput, null, 2), 'utf8');
console.log(`Adjectives saved: ${adjectiveQuestions.length} questions in ${adjectivesOutput.levels.length} levels`);

// ===== VERIFICATION =====
console.log('\n===== VERIFICATION =====');

// Check specific words
const checkWords = [
  { japanese: 'ざっし', expected: 'Majalah' },
  { japanese: 'でんき', expected: 'Lampu, Listrik' },
  { japanese: 'あのひと', expected: 'Orang Itu, Dia' },
  { japanese: 'とまる', expected: ['berhenti', 'menginap'] },
  { japanese: 'かえる', expected: ['pulang', 'menukar'] },
  { japanese: 'つく', expected: ['tiba 1', 'tiba'] },
];

console.log('\nSample verifications:');
checkWords.forEach(check => {
  const noun = nouns.find(w => w.japanese === check.japanese);
  const verb = verbs.find(w => w.japanese === check.japanese);
  const adj = adjectives.find(w => w.japanese === check.japanese);
  
  const found = noun || verb || adj;
  if (found) {
    console.log(`✓ ${check.japanese}: ${found.meaning}`);
  } else {
    console.log(`✗ ${check.japanese}: NOT FOUND`);
  }
});

// Show sample of each category
console.log('\n--- Nouns Sample ---');
nounQuestions.slice(0, 5).forEach(q => {
  console.log(`${q.reading} (${q.romaji}): ${q.meaning}`);
});

console.log('\n--- Verbs Sample ---');
verbQuestions.slice(0, 5).forEach(q => {
  console.log(`${q.reading} (${q.romaji}): ${q.meaning}`);
});

console.log('\n--- Adjectives Sample ---');
adjectiveQuestions.slice(0, 5).forEach(q => {
  console.log(`${q.reading} (${q.romaji}): ${q.meaning}`);
});

// Check romaji for small kana
console.log('\n--- Romaji Check ---');
const romajiChecks = ['ざっし', 'きっぷ', 'にっき', 'ひっかく', 'ざっし'];
romajiChecks.forEach(word => {
  console.log(`${word} → ${textToRomaji(word)}`);
});
