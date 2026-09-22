const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'vocab_extracted.txt');
const outputPath = path.join(__dirname, '..', 'data', 'verbs.json');

const rawText = fs.readFileSync(inputPath, 'utf8');
const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const questions = [];
let i = 0;

// Helper to detect if a line is a number (item index)
function isNumber(str) {
  return /^\d+$/.test(str);
}

while (i < lines.length) {
  // Try to find patterns: number, meaning, kamus, masu, te
  if (isNumber(lines[i])) {
    const num = parseInt(lines[i]);
    // Check if next line looks like Indonesian meaning (not hiragana/katakana)
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      // Indonesian meaning: should not be pure hiragana/katakana
      const isJapanese = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s]+$/.test(nextLine);

      if (!isJapanese && nextLine.length > 0 && i + 3 < lines.length) {
        const meaning = nextLine;
        const kamus = lines[i + 2];
        // Skip masu form (lines[i+3])
        // We have the data we need

        // Check if kamus looks like Japanese
        const isKamusJapanese = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF]+$/.test(kamus);

        if (isKamusJapanese && kamus.length > 0) {
          // Generate 3 wrong options from other meanings
          const wrongOptions = [];
          const allMeanings = questions.map(q => q.meaning);

          // Add some random wrong options
          const shuffled = allMeanings.sort(() => 0.5 - Math.random());
          for (const m of shuffled) {
            if (wrongOptions.length >= 3) break;
            if (m !== meaning && !wrongOptions.includes(m)) {
              wrongOptions.push(m);
            }
          }

          // If not enough wrong options, add some generic ones
          const genericWrong = ['Makan', 'Minum', 'Tidur', 'Jalan', 'Lari', 'Baca', 'Tulis', 'Duduk', 'Berdiri', 'Pergi'];
          for (const g of genericWrong) {
            if (wrongOptions.length >= 3) break;
            if (g !== meaning && !wrongOptions.includes(g)) {
              wrongOptions.push(g);
            }
          }

          // Create options array with correct answer at random position
          const options = [...wrongOptions.slice(0, 3)];
          const correctIndex = Math.floor(Math.random() * 4);
          options.splice(correctIndex, 0, meaning);

          questions.push({
            id: questions.length + 1,
            kanji: kamus,
            reading: kamus,
            meaning: meaning,
            options: options,
            correctIndex: correctIndex
          });

          i += 4; // Skip number, meaning, kamus, masu (or te)
          continue;
        }
      }
    }
  }
  i++;
}

// Split into levels of 50 questions each
const levels = [];
for (let i = 0; i < questions.length; i += 50) {
  const levelQuestions = questions.slice(i, i + 50);
  // Regenerate options for each level to ensure variety
  levelQuestions.forEach((q, idx) => {
    const otherMeanings = questions.filter(x => x.id !== q.id).map(x => x.meaning);
    const shuffled = otherMeanings.sort(() => 0.5 - Math.random());
    const wrongOptions = shuffled.slice(0, 3);

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
  category: "Kata Kerja",
  categoryJapanese: "動詞",
  categoryRomaji: "Doushi",
  levels: levels
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Berhasil! ${questions.length} soal kata kerja dibagi menjadi ${levels.length} level.`);
console.log(`File disimpan di: ${outputPath}`);
