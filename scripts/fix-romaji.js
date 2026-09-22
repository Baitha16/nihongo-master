const fs = require('fs');

// Map from wrong romaji to correct romaji
const fixMap = {
  'sha': 'sya', 'shu': 'syu', 'sho': 'syo',
  'cha': 'tya', 'chu': 'tyu', 'cho': 'tyo',
  'ja': 'jya', 'ju': 'jyu', 'jo': 'jyo',
};

function fixFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fixed = 0;
  
  data.levels.forEach(level => {
    level.questions.forEach(q => {
      if (q.romaji && fixMap[q.romaji]) {
        const old = q.romaji;
        q.romaji = fixMap[q.romaji];
        fixed++;
        console.log(`  ${q.kanji}: ${old} -> ${q.romaji}`);
      }
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Fixed ${fixed} entries in ${filePath}\n`);
}

console.log('=== Fixing Hiragana ===');
fixFile('data/hiragana.json');

console.log('=== Fixing Katakana ===');
fixFile('data/katakana.json');
