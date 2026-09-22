const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'minna_extracted.txt');
const rawText = fs.readFileSync(inputPath, 'utf8');
const lines = rawText.split('\n').map(l => l.trim());

const words = [];
let i = 0;

function isJapanese(str) {
  return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～]+$/.test(str);
}

function isNumber(str) {
  return /^\d+$/.test(str);
}

while (i < lines.length) {
  const line = lines[i];

  if (isNumber(line)) {
    const num = parseInt(line);
    let japanese = '';
    let meaning = '';
    let j = i + 1;

    // Look for Japanese
    while (j < lines.length && j < i + 5) {
      const nextLine = lines[j];
      if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
        japanese = nextLine;
        j++;
        break;
      }
      // Skip non-Japanese, non-meaning lines
      if (nextLine && !isNumber(nextLine) && nextLine !== '' &&
          !nextLine.includes('Kelompok') && !nextLine.includes('Minna') &&
          !nextLine.includes('Daftar') && !nextLine.includes('Bahasa') &&
          !nextLine.includes('Arti')) {
        break;
      }
      j++;
    }

    // Look for meaning (Indonesian text)
    while (j < lines.length && j < i + 8) {
      const nextLine = lines[j];
      if (nextLine && !isJapanese(nextLine) && !isNumber(nextLine) && nextLine !== '' &&
          !nextLine.includes('Kelompok') && !nextLine.includes('Minna') &&
          !nextLine.includes('Daftar') && !nextLine.includes('Bahasa') &&
          !nextLine.includes('Arti') && nextLine.length > 1) {
        meaning = nextLine;
        j++;
        break;
      }
      j++;
    }

    if (japanese && meaning && japanese.length > 0 && meaning.length > 0) {
      words.push({
        japanese: japanese,
        meaning: meaning.replace(/\s+/g, ' ').trim()
      });
    }
  }
  i++;
}

console.log(`Total words extracted: ${words.length}`);
console.log('Sample:');
words.slice(0, 10).forEach(w => console.log(`  ${w.japanese} = ${w.meaning}`));

// Generate questions
const allMeanings = words.map(w => w.meaning);

function generateOptions(correctMeaning) {
  const wrongOptions = [];
  const otherMeanings = allMeanings.filter(m => m !== correctMeaning);
  const shuffled = otherMeanings.sort(() => 0.5 - Math.random());

  for (const m of shuffled) {
    if (wrongOptions.length >= 3) break;
    if (!wrongOptions.includes(m)) {
      wrongOptions.push(m);
    }
  }

  const generic = ['Makan', 'Minum', 'Tidur', 'Jalan', 'Lari', 'Baca', 'Tulis', 'Duduk', 'Berdiri', 'Pergi'];
  for (const g of generic) {
    if (wrongOptions.length >= 3) break;
    if (g !== correctMeaning && !wrongOptions.includes(g)) {
      wrongOptions.push(g);
    }
  }

  return wrongOptions.slice(0, 3);
}

const questions = words.map((word, idx) => {
  const wrongOptions = generateOptions(word.meaning);
  const options = [...wrongOptions];
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, word.meaning);

  return {
    id: idx + 1,
    kanji: word.japanese,
    reading: word.japanese,
    meaning: word.meaning,
    options: options,
    correctIndex: correctIndex
  };
});

// Split into levels
const levels = [];
for (let i = 0; i < questions.length; i += 50) {
  const levelQuestions = questions.slice(i, i + 50);

  levelQuestions.forEach(q => {
    const wrongOptions = generateOptions(q.meaning);
    const options = [...wrongOptions];
    const correctIdx = Math.floor(Math.random() * 4);
    options.splice(correctIdx, 0, q.meaning);
    q.options = options;
    q.correctIndex = correctIdx;
  });

  levels.push({
    level: levels.length + 1,
    questions: levelQuestions
  });
}

const output = {
  category: "Kata Benda",
  categoryJapanese: "名詞",
  categoryRomaji: "Meishi",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'nouns.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nBerhasil! ${questions.length} soal kata benda dibagi menjadi ${levels.length} level.`);
console.log(`File disimpan di: ${outputPath}`);
