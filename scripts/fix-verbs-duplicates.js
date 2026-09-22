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

// ===== PROCESS VERBS - HANDLING DUPLICATES =====
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
      while (j < lines.length && j < i + 25) {
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

      // Get kanji from source (look for Japanese after the first one)
      while (j < lines.length && j < i + 30) {
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

        // Check if this is a duplicate with different meaning
        const existingIndex = verbs.findIndex(v => v.japanese === japanese);
        if (existingIndex >= 0) {
          // Add as a new entry with modified meaning to distinguish
          verbs.push({
            japanese: japanese + '_dup',
            kanjiFromSource: kanjiFromSource,
            meaning: meaning
          });
        } else {
          verbs.push({
            japanese: japanese,
            kanjiFromSource: kanjiFromSource,
            meaning: meaning
          });
        }
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

      while (j < lines.length && j < i + 5) {
        const nextLine = lines[j];
        if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
          japanese = nextLine;
          j++;
          break;
        }
        j++;
      }

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
    // Get the actual hiragana reading (remove _dup suffix if present)
    let reading = item.japanese;
    if (reading.endsWith('_dup')) {
      reading = reading.slice(0, -4);
    }
    
    const romaji = textToRomaji(reading);
    const kanji = item.kanjiFromSource || reading;
    
    const wrongOptions = generateOptions(item.meaning, allMeanings);
    const options = wrongOptions.map(opt => capitalize(opt));
    const correctIndex = Math.floor(Math.random() * 4);
    options.splice(correctIndex, 0, capitalize(item.meaning));
    
    return {
      id: idx + 1,
      kanji: kanji,
      reading: reading,
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

// Check とまる entries
console.log('\nVerifying とまる entries:');
const tomaruVerbs = verbQuestions.filter(q => q.reading === 'とまる');
tomaruVerbs.forEach(q => {
  console.log(`  ${q.kanji} (${q.romaji}): ${q.meaning}`);
});

// Check かえる entries
console.log('\nVerifying かえる entries:');
const kaeruVerbs = verbQuestions.filter(q => q.reading === 'かえる');
kaeruVerbs.forEach(q => {
  console.log(`  ${q.kanji} (${q.romaji}): ${q.meaning}`);
});

// Check つく entries
console.log('\nVerifying つく entries:');
const tsukuVerbs = verbQuestions.filter(q => q.reading === 'つく');
tsukuVerbs.forEach(q => {
  console.log(`  ${q.kanji} (${q.romaji}): ${q.meaning}`);
});

// Check ざっし
console.log('\nChecking ざっし:');
const zasshi = nounQuestions.find(q => q.reading === 'ざっし');
if (zasshi) console.log(`  ${zasshi.kanji} (${zasshi.romaji}): ${zasshi.meaning}`);

// Check でんき
console.log('\nChecking でんき:');
const denki = nounQuestions.find(q => q.reading === 'でんき');
if (denki) console.log(`  ${denki.kanji} (${denki.romaji}): ${denki.meaning}`);

// Romaji check
console.log('\n===== ROMAJI CHECK =====');
const romajiChecks = ['ざっし', 'きっぷ', 'にっき', 'ひっかく', 'じゃんけん', 'ひゃく'];
romajiChecks.forEach(word => {
  console.log(`${word} → ${textToRomaji(word)}`);
});
