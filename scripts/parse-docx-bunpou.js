const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const DATABASE_DIR = path.join(__dirname, '..', 'DATABASE');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'database');

async function main() {
  const file = '4. BUNPOU MASTER N5 - donihongo_removed.docx';
  console.log('Extracting:', file);
  
  const filePath = path.join(DATABASE_DIR, file);
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;
  
  const lines = text.split('\n').map(l => l.trim());
  const babs = {};
  let currentLevel = 1;
  let id = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track bab
    const babMatch = line.match(/^[Bb]ab\s+(\d+)/);
    if (babMatch) {
      currentLevel = parseInt(babMatch[1]);
      if (!babs[currentLevel]) {
        babs[currentLevel] = [];
      }
      continue;
    }
    
    // Find "Arti:" lines
    if (line.startsWith('Arti:')) {
      // Extract meaning - try various quote styles
      let meaning = '';
      const m1 = line.match(/^Arti:\s*["""'](.+?)["""']/);
      const m2 = line.match(/^Arti:\s*"(.+?)"/);
      const m3 = line.match(/^Arti:\s*(.+?)$/);
      
      if (m1) {
        meaning = m1[1].trim();
      } else if (m2) {
        meaning = m2[1].trim();
      } else if (m3) {
        meaning = m3[1].trim().replace(/["""]/g, '');
      }
      
      if (!meaning || meaning.length < 2) continue;
      
      // Look backwards for the pattern
      let pattern = '';
      for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
        const prevLine = lines[j];
        if (prevLine && 
            prevLine !== '' && 
            !prevLine.startsWith('Arti:') && 
            !prevLine.startsWith('Contoh') &&
            !prevLine.startsWith('Contoh:') &&
            !prevLine.match(/^\(/) &&
            !prevLine.match(/^Gunakan/) &&
            !prevLine.match(/^Digunakan/) &&
            !prevLine.match(/^Pola/) &&
            !prevLine.match(/^Rangkuman/) &&
            !prevLine.match(/^Menyatakan/) &&
            !prevLine.match(/^Menyebutkan/) &&
            !prevLine.match(/^Menunjukkan/) &&
            !prevLine.match(/^[Bb]ab\s+/) &&
            prevLine.length > 2) {
          pattern = prevLine;
          break;
        }
      }
      
      if (pattern && meaning) {
        if (!babs[currentLevel]) {
          babs[currentLevel] = [];
        }
        id++;
        babs[currentLevel].push({
          id: id,
          pattern: pattern,
          meaning: meaning
        });
      }
    }
  }
  
  console.log('\nBUNPOU bab distribution:');
  const sortedBabs = Object.keys(babs).map(Number).sort((a, b) => a - b);
  sortedBabs.forEach(b => {
    console.log('  Bab', b + ':', babs[b].length, 'items');
    babs[b].forEach(item => {
      console.log('    ', item.pattern.substring(0, 50), '|', item.meaning.substring(0, 50));
    });
  });
  
  // Generate options and build output
  const allMeanings = Object.values(babs).flat().map(q => q.meaning);
  
  const levels = sortedBabs.map(bab => ({
    level: bab,
    questions: babs[bab].map((item, idx) => {
      const others = allMeanings.filter(m => m !== item.meaning);
      const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
      shuffled.push(item.meaning);
      shuffled.sort(() => Math.random() - 0.5);
      
      return {
        id: idx + 1,
        kanji: item.pattern,
        reading: '',
        romaji: '',
        meaning: item.meaning,
        options: shuffled,
        correctIndex: shuffled.indexOf(item.meaning)
      };
    })
  }));
  
  const bunpouN5 = {
    category: 'Tata Bahasa JLPT N5',
    categoryJapanese: '文法 N5',
    categoryRomaji: 'Bunpou N5',
    levels: levels
  };
  
  console.log('\nTotal levels:', levels.length);
  console.log('Total questions:', levels.reduce((s, l) => s + l.questions.length, 0));
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'bunpou-n5.json'),
    JSON.stringify(bunpouN5, null, 2)
  );
  console.log('\nSaved to bunpou-n5.json');
}

main();
