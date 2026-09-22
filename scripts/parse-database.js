const fs = require('fs');
const path = require('path');

const DATABASE_DIR = path.join(__dirname, '..', 'DATABASE');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'database');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function readFile(filename) {
  const filePath = path.join(DATABASE_DIR, filename);
  return fs.readFileSync(filePath, 'utf8');
}

function parseKotoba(filename) {
  const text = readFile(filename);
  const lines = text.split('\n');
  const questions = [];
  let id = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || line.startsWith('@DONIHONGO') || line.startsWith('No') || line === 'KOTOBA' || line.startsWith('MINNA') || line.startsWith('BAB ')) {
      continue;
    }
    
    const match = line.match(/^(\d+)([\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]+)([a-zA-Z][a-zA-Z\s\-\(\)]*?)([A-Z\u3000-\u9fff].+)$/);
    if (match) {
      const num = parseInt(match[1]);
      const kana = match[2].trim();
      const romaji = match[3].trim();
      const meaning = match[4].trim();
      
      const kanjiMatch = kana.match(/^(.*?)([\u4e00-\u9fff]+)$/);
      let hiragana = kana;
      let kanji = '';
      
      if (kanjiMatch) {
        hiragana = kanjiMatch[1];
        kanji = kanjiMatch[2];
      } else {
        kanji = kana;
      }
      
      if (hiragana && meaning) {
        questions.push({
          id: id++,
          kanji: kanji || hiragana,
          reading: hiragana,
          romaji: romaji,
          meaning: meaning
        });
      }
    }
  }
  
  return questions;
}

function organizeByLevel(questions, jlptLevel) {
  const levels = {};
  const questionsPerLevel = Math.ceil(questions.length / 15);
  
  questions.forEach((q, index) => {
    const level = Math.floor(index / questionsPerLevel) + 1;
    if (!levels[level]) {
      levels[level] = [];
    }
    q.id = levels[level].length + 1;
    levels[level].push(q);
  });
  
  return {
    category: `Kosakata JLPT N${jlptLevel}`,
    categoryJapanese: `語彙 N${jlptLevel}`,
    categoryRomaji: `Kotoba N${jlptLevel}`,
    levels: Object.entries(levels).map(([level, questions]) => ({
      level: parseInt(level),
      questions: questions
    }))
  };
}

function parseKanji(filename) {
  const text = readFile(filename);
  const lines = text.split('\n');
  const questions = [];
  let id = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('@DONIHONGO') || line === '' || line.startsWith('Part') || line.startsWith('Rangkuman') || line.startsWith('漢') || line.startsWith('字') || line.startsWith('KANJI') || line === '\\' || line.length <= 1) {
      continue;
    }
    
    const kanjiLine = line.match(/^([\u4e00-\u9fff])\s+(.+?)\s*=\s*(.+)/);
    if (kanjiLine) {
      const kanji = kanjiLine[1];
      const meaning = kanjiLine[2].trim();
      const reading = kanjiLine[3].trim();
      
      questions.push({
        id: id++,
        kanji: kanji,
        reading: reading,
        romaji: '',
        meaning: meaning
      });
    }
  }
  
  return questions;
}

function parseBunpou(filename) {
  const text = readFile(filename);
  const lines = text.split('\n');
  const items = [];
  let id = 1;
  let currentLevel = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('BAB ')) {
      const babMatch = line.match(/BAB\s+(\d+)/);
      if (babMatch) {
        currentLevel = parseInt(babMatch[1]);
      }
      continue;
    }
    
    if (line.startsWith('@DONIHONGO') || line === '' || line.startsWith('MINNA') || line === 'BUNPOU') {
      continue;
    }
    
    const grammarMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (grammarMatch) {
      const num = parseInt(grammarMatch[1]);
      const pattern = grammarMatch[2].trim();
      
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith('Arti:') || nextLine.startsWith('arti:')) {
          const artiMatch = nextLine.match(/^[Aa]rti:\s*["""](.+?)["""]/);
          if (artiMatch) {
            items.push({
              id: id++,
              pattern: pattern,
              meaning: artiMatch[1].trim(),
              level: currentLevel
            });
          }
        }
      }
    }
  }
  
  return items;
}

function generateOptionsForQuestion(question, allQuestions) {
  const correctMeaning = question.meaning;
  const otherMeanings = allQuestions
    .filter(q => q.meaning !== correctMeaning)
    .map(q => q.meaning);
  
  const shuffled = otherMeanings.sort(() => Math.random() - 0.5).slice(0, 3);
  shuffled.push(correctMeaning);
  shuffled.sort(() => Math.random() - 0.5);
  
  const correctIndex = shuffled.indexOf(correctMeaning);
  
  return {
    options: shuffled,
    correctIndex: correctIndex
  };
}

function addOptionsToQuestions(data) {
  data.levels.forEach(level => {
    level.questions.forEach(q => {
      const allQuestions = data.levels.flatMap(l => l.questions);
      const { options, correctIndex } = generateOptionsForQuestion(q, allQuestions);
      q.options = options;
      q.correctIndex = correctIndex;
    });
  });
  return data;
}

function main() {
  console.log('Parsing KOTOBA N5...');
  const kotobaN5Questions = parseKotoba('3. KOTOBA MASTER N5 (Updated) - @donihongo.txt');
  const kotobaN5 = organizeByLevel(kotobaN5Questions, 5);
  addOptionsToQuestions(kotobaN5);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'kotoba-n5.json'), JSON.stringify(kotobaN5, null, 2));
  console.log(`  Found ${kotobaN5.levels.reduce((sum, l) => sum + l.questions.length, 0)} questions in ${kotobaN5.levels.length} levels`);
  
  console.log('Parsing KOTOBA N4...');
  const kotobaN4Questions = parseKotoba('6. KOTOBA MASTER N4 - @donihongo.txt');
  const kotobaN4 = organizeByLevel(kotobaN4Questions, 4);
  addOptionsToQuestions(kotobaN4);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'kotoba-n4.json'), JSON.stringify(kotobaN4, null, 2));
  console.log(`  Found ${kotobaN4.levels.reduce((sum, l) => sum + l.questions.length, 0)} questions in ${kotobaN4.levels.length} levels`);
  
  console.log('Parsing KANJI N5...');
  const kanjiN5Questions = parseKanji('5. KANJI MASTER N5  - @donihongo.txt');
  const kanjiN5 = organizeByLevel(kanjiN5Questions, 5);
  addOptionsToQuestions(kanjiN5);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'kanji-n5.json'), JSON.stringify(kanjiN5, null, 2));
  console.log(`  Found ${kanjiN5.levels.reduce((sum, l) => sum + l.questions.length, 0)} questions in ${kanjiN5.levels.length} levels`);
  
  console.log('Parsing KANJI N4...');
  const kanjiN4Questions = parseKanji('8. KANJI MASTER N4 - @donihongo.txt');
  const kanjiN4 = organizeByLevel(kanjiN4Questions, 4);
  addOptionsToQuestions(kanjiN4);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'kanji-n4.json'), JSON.stringify(kanjiN4, null, 2));
  console.log(`  Found ${kanjiN4.levels.reduce((sum, l) => sum + l.questions.length, 0)} questions in ${kanjiN4.levels.length} levels`);
  
  console.log('Parsing BUNPOU N5...');
  const bunpouN5 = parseBunpou('4. BUNPOU MASTER N5 - @donihongo.txt');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'bunpou-n5.json'), JSON.stringify({ items: bunpouN5 }, null, 2));
  console.log(`  Found ${bunpouN5.length} grammar points`);
  
  console.log('Parsing BUNPOU N4...');
  const bunpouN4 = parseBunpou('7. BUNPOU MASTER N4 - @donihongo.txt');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'bunpou-n4.json'), JSON.stringify({ items: bunpouN4 }, null, 2));
  console.log(`  Found ${bunpouN4.length} grammar points`);
  
  console.log('\nDone! Files saved to:', OUTPUT_DIR);
}

main();
