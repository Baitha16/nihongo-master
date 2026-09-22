const fs = require('fs');
const path = require('path');

// Clean adjectives data
const adjectivesPath = path.join(__dirname, '..', 'data', 'adjectives.json');
const adjectives = JSON.parse(fs.readFileSync(adjectivesPath, 'utf8'));

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
adjectives.levels.forEach(level => {
  level.questions.forEach(q => {
    q.meaning = cleanMeaning(q.meaning);
    q.options = q.options.map(opt => cleanMeaning(opt));
  });
});

// Write back
fs.writeFileSync(adjectivesPath, JSON.stringify(adjectives, null, 2), 'utf8');
console.log('Adjectives data cleaned!');

// Verify
console.log('\nSample cleaned meanings:');
adjectives.levels[0].questions.slice(0, 10).forEach(q => {
  console.log(`  ${q.kanji}: ${q.meaning}`);
});
