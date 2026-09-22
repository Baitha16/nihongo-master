const fs = require('fs');
const path = require('path');

// Clean verbs data
const verbsPath = path.join(__dirname, '..', 'data', 'verbs.json');
const verbs = JSON.parse(fs.readFileSync(verbsPath, 'utf8'));

function cleanMeaning(meaning) {
  // Remove artifacts like "( ) —", "( ) ( )", etc.
  let cleaned = meaning
    .replace(/\s*\(\s*\)\s*/g, ' ')  // Remove ( )
    .replace(/\s*—\s*/g, ' ')        // Remove —
    .replace(/\s*-\s*/g, ' ')        // Remove -
    .replace(/\s+/g, ' ')            // Collapse multiple spaces
    .replace(/[,\s]+$/, '')          // Remove trailing commas and spaces
    .trim();
  
  return cleaned;
}

// Clean all levels
verbs.levels.forEach(level => {
  level.questions.forEach(q => {
    q.meaning = cleanMeaning(q.meaning);
    q.options = q.options.map(opt => cleanMeaning(opt));
  });
});

// Write back
fs.writeFileSync(verbsPath, JSON.stringify(verbs, null, 2), 'utf8');
console.log('Verbs data cleaned!');

// Verify
console.log('\nSample cleaned meanings:');
verbs.levels[0].questions.slice(0, 10).forEach(q => {
  console.log(`  ${q.kanji}: ${q.meaning}`);
});
