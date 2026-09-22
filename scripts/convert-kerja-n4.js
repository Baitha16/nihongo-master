const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'kerja_n4_extracted.txt');
const rawText = fs.readFileSync(inputPath, 'utf8');
const lines = rawText.split('\n').map(l => l.trim());

const verbs = [];
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
    let meaning = '';
    let japanese = '';
    let j = i + 1;

    // Collect meaning (Indonesian, might span multiple lines)
    while (j < lines.length && j < i + 6) {
      const nextLine = lines[j];
      if (nextLine && !isJapanese(nextLine) && !isNumber(nextLine) && nextLine !== '' &&
          nextLine !== 'KATA KERJA' && nextLine !== 'INDONESIA' && nextLine !== 'JEPANG' && nextLine !== 'KANJI' && nextLine !== 'NO') {
        meaning = nextLine;
        j++;
        // Check continuation
        while (j < lines.length && j < i + 10) {
          const contLine = lines[j];
          if (contLine && !isJapanese(contLine) && !isNumber(contLine) && contLine !== '' &&
              contLine !== 'KATA KERJA' && contLine !== 'INDONESIA' && contLine !== 'JEPANG' && contLine !== 'KANJI' && contLine !== 'NO') {
            meaning += ' ' + contLine;
            j++;
          } else {
            break;
          }
        }
        break;
      }
      j++;
    }

    // Collect Japanese
    while (j < lines.length && j < i + 12) {
      const nextLine = lines[j];
      if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
        japanese = nextLine;
        j++;
        break;
      }
      j++;
    }

    if (meaning && japanese && meaning.length > 0 && japanese.length > 0) {
      meaning = meaning.replace(/\s+/g, ' ').trim();
      meaning = meaning.replace(/&amp;/g, '&').trim();

      verbs.push({
        meaning: meaning,
        japanese: japanese
      });
    }
  }
  i++;
}

console.log(`Total verbs extracted: ${verbs.length}`);
console.log('Sample:');
verbs.slice(0, 10).forEach(v => console.log(`  ${v.japanese} = ${v.meaning}`));

// Generate questions
const allMeanings = verbs.map(v => v.meaning);

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

  const generic = ['Makan', 'Minum', 'Tidur', 'Jalan', 'Lari', 'Baca', 'Tulis', 'Duduk', 'Berdiri'];
  for (const g of generic) {
    if (wrongOptions.length >= 3) break;
    if (g !== correctMeaning && !wrongOptions.includes(g)) {
      wrongOptions.push(g);
    }
  }

  return wrongOptions.slice(0, 3);
}

const questions = verbs.map((verb, idx) => {
  const wrongOptions = generateOptions(verb.meaning);
  const options = [...wrongOptions];
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, verb.meaning);

  return {
    id: idx + 1,
    kanji: verb.japanese,
    reading: verb.japanese,
    meaning: verb.meaning,
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
  category: "Kata Kerja",
  categoryJapanese: "動詞",
  categoryRomaji: "Doushi",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'verbs.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nBerhasil! ${questions.length} soal kata kerja dibagi menjadi ${levels.length} level.`);
console.log(`File disimpan di: ${outputPath}`);
