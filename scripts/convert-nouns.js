const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'kotoba_extracted.txt');
const rawText = fs.readFileSync(inputPath, 'utf8');
const lines = rawText.split('\n').map(l => l.trim());

// Helper functions
function isJapanese(str) {
  return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～]+$/.test(str);
}

function isNumber(str) {
  return /^\d+\.?$/.test(str);
}

function isBabHeader(str) {
  return /^Bab\s*\d+/i.test(str);
}

// Parse vocabulary items
const allWords = [];
let currentChapter = 0;
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  // Detect chapter headers
  if (isBabHeader(line)) {
    const match = line.match(/Bab\s*(\d+)/i);
    if (match) {
      currentChapter = parseInt(match[1]);
    }
    i++;
    continue;
  }

  // Skip headers and empty lines
  if (line === 'No' || line === 'Kosakata' || line === 'Arti' || line === '') {
    i++;
    continue;
  }

  // Try to find vocabulary pattern: number, then Japanese, then Indonesian
  if (isNumber(line)) {
    const num = line.replace('.', '');

    // Look ahead for Japanese and Indonesian
    let japanese = '';
    let meaning = '';
    let j = i + 1;

    // Collect Japanese text (might span multiple lines)
    while (j < lines.length && j < i + 5) {
      const nextLine = lines[j];
      if (isJapanese(nextLine) && nextLine.length > 0) {
        japanese = nextLine.replace(/[I|II|III]+$/, '').trim();
        j++;
        break;
      }
      j++;
    }

    // Collect Indonesian meaning (might span multiple lines)
    while (j < lines.length && j < i + 8) {
      const nextLine = lines[j];
      if (nextLine && !isJapanese(nextLine) && !isNumber(nextLine) && !isBabHeader(nextLine) && nextLine !== 'No' && nextLine !== 'Kosakata' && nextLine !== 'Arti') {
        meaning = nextLine;
        j++;

        // Check if meaning continues on next line
        while (j < lines.length && j < i + 10) {
          const nextMeaningLine = lines[j];
          if (nextMeaningLine && !isJapanese(nextMeaningLine) && !isNumber(nextMeaningLine) && !isBabHeader(nextMeaningLine) && nextMeaningLine !== 'No' && nextMeaningLine !== 'Kosakata' && nextMeaningLine !== 'Arti' && nextMeaningLine.length > 0) {
            meaning += ' ' + nextMeaningLine;
            j++;
          } else {
            break;
          }
        }
        break;
      }
      j++;
    }

    if (japanese && meaning && japanese.length > 0 && meaning.length > 0) {
      // Clean up the meaning
      meaning = meaning.replace(/\s+/g, ' ').trim();

      allWords.push({
        japanese: japanese,
        meaning: meaning,
        chapter: currentChapter
      });
    }
  }

  i++;
}

console.log(`Total words extracted: ${allWords.length}`);
console.log('Sample words:');
allWords.slice(0, 5).forEach(w => console.log(`  ${w.japanese} = ${w.meaning}`));

// Generate wrong options from other meanings
function generateOptions(correctMeaning, allMeanings) {
  const wrongOptions = [];
  const otherMeanings = allMeanings.filter(m => m !== correctMeaning);

  // Shuffle and pick 3
  const shuffled = otherMeanings.sort(() => 0.5 - Math.random());
  for (const m of shuffled) {
    if (wrongOptions.length >= 3) break;
    if (!wrongOptions.includes(m)) {
      wrongOptions.push(m);
    }
  }

  // Fill remaining with generic options if needed
  const genericOptions = ['Makan', 'Minum', 'Tidur', 'Jalan', 'Lari', 'Baca', 'Tulis', 'Duduk', 'Berdiri', 'Pergi', 'Lari', 'Terbang'];
  for (const g of genericOptions) {
    if (wrongOptions.length >= 3) break;
    if (g !== correctMeaning && !wrongOptions.includes(g)) {
      wrongOptions.push(g);
    }
  }

  return wrongOptions.slice(0, 3);
}

// Create questions
const allMeanings = allWords.map(w => w.meaning);
const questions = allWords.map((word, idx) => {
  const wrongOptions = generateOptions(word.meaning, allMeanings);
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

// Split into levels of 50
const levels = [];
for (let i = 0; i < questions.length; i += 50) {
  const levelQuestions = questions.slice(i, i + 50);

  // Regenerate options for variety
  levelQuestions.forEach((q) => {
    const wrongOptions = generateOptions(q.meaning, allMeanings);
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
