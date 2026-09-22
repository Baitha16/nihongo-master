const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const DATABASE_DIR = path.join(__dirname, '..', 'DATABASE');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'database');

async function extractDocxHtml(filename) {
  const filePath = path.join(DATABASE_DIR, filename);
  const result = await mammoth.convertToHtml({ path: filePath });
  return result.value;
}

function cleanHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\t/g, ' ')
    .trim();
}

function isKanjiChar(ch) {
  const code = ch.codePointAt(0);
  return (code >= 0x4E00 && code <= 0x9FFF) ||
         (code >= 0x3400 && code <= 0x4DBF) ||
         (code >= 0x2F00 && code <= 0x2FDF) ||
         (code >= 0x2E80 && code <= 0x2EFF) ||
         (code >= 0xF900 && code <= 0xFAFF);
}

function parseKanjiFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const kanjiEntries = [];
  
  let i = 0;
  
  // Skip preamble
  while (i < lines.length && !lines[i].includes('@DONIHONGO')) {
    i++;
  }
  
  // Skip first @DONIHONGO section
  while (i < lines.length && i < lines.indexOf('Bab 1')) {
    i++;
  }
  
  // Find detailed kanji entries
  while (i < lines.length) {
    const line = lines[i];
    
    // Look for "Meaning = Reading" pattern
    const meaningMatch = line.match(/^(.+?)\s*=\s*(.+)$/);
    if (meaningMatch) {
      const meaning = meaningMatch[1].trim();
      const kunyomi = meaningMatch[2].trim();
      
      // Look FORWARD for kanji character (after onyomi)
      let kanji = '';
      let onyomi = '';
      
      // Pattern: Meaning = Kunyomi -> Kunyomi -> \ -> Onyomi -> Kanji
      for (let j = i + 1; j < Math.min(lines.length, i + 15); j++) {
        const nextLine = lines[j];
        
        // Find kunyomi repetition
        if (nextLine === kunyomi || nextLine.startsWith(kunyomi)) {
          continue;
        }
        
        // Find separator
        if (nextLine === '\\') {
          continue;
        }
        
        // Find onyomi (katakana)
        if (/^[ァ-ヶー]+$/.test(nextLine)) {
          onyomi = nextLine;
          continue;
        }
        
        // Find kanji character
        if (nextLine.length === 1 && isKanjiChar(nextLine)) {
          kanji = nextLine;
          break;
        }
        
        // If we hit another "Meaning = Reading", stop
        if (nextLine.match(/^.+\s*=\s+.+$/)) {
          break;
        }
        
        // If we hit "BAB" or "Part", stop
        if (nextLine.startsWith('BAB') || nextLine.startsWith('Part')) {
          break;
        }
      }
      
      if (kunyomi && meaning) {
        kanjiEntries.push({
          kanji: kanji,
          meaning: meaning,
          kunyomi: kunyomi,
          onyomi: onyomi
        });
      }
    }
    
    i++;
  }
  
  return kanjiEntries;
}

function main() {
  const file = '5. KANJI MASTER N5  - donihongo.docx';
  console.log(`Extracting: ${file}`);
  
  extractDocxHtml(file).then(html => {
    const text = cleanHtml(html);
    
    console.log('\nParsing kanji entries...');
    const entries = parseKanjiFromText(text);
    console.log(`Found ${entries.length} kanji entries`);
    
    // Show first 30
    console.log('\nFirst 30 entries:');
    entries.slice(0, 30).forEach((e, i) => {
      console.log(`${i+1}. ${e.kanji || '?'} | ${e.meaning} | ${e.kunyomi} | ${e.onyomi}`);
    });
    
    // Show last 10
    console.log('\nLast 10 entries:');
    entries.slice(-10).forEach((e, i) => {
      console.log(`${entries.length - 9 + i}. ${e.kanji || '?'} | ${e.meaning} | ${e.kunyomi} | ${e.onyomi}`);
    });
    
    // Group into levels (10 per level)
    const questionsPerLevel = 10;
    const levels = {};
    
    entries.forEach((entry, index) => {
      const level = Math.floor(index / questionsPerLevel) + 1;
      if (!levels[level]) {
        levels[level] = [];
      }
      
      levels[level].push({
        id: levels[level].length + 1,
        kanji: entry.kanji || entry.meaning.charAt(0),
        reading: entry.kunyomi,
        meaning: entry.meaning,
        onyomi: entry.onyomi
      });
    });
    
    const kanjiN5 = {
      category: 'Kanji JLPT N5',
      categoryJapanese: '漢字 N5',
      categoryRomaji: 'Kanji N5',
      levels: Object.entries(levels).map(([level, questions]) => ({
        level: parseInt(level),
        questions: questions
      }))
    };
    
    // Generate options
    const allMeanings = entries.map(e => e.meaning);
    kanjiN5.levels.forEach(level => {
      level.questions.forEach(q => {
        const others = allMeanings.filter(m => m !== q.meaning);
        const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
        shuffled.push(q.meaning);
        shuffled.sort(() => Math.random() - 0.5);
        q.options = shuffled;
        q.correctIndex = shuffled.indexOf(q.meaning);
      });
    });
    
    console.log(`\nLevels: ${kanjiN5.levels.length}`);
    kanjiN5.levels.forEach(l => {
      console.log(`  Level ${l.level}: ${l.questions.length} questions`);
    });
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'kanji-n5.json'),
      JSON.stringify(kanjiN5, null, 2)
    );
    console.log('\nSaved to kanji-n5.json');
  });
}

main();
