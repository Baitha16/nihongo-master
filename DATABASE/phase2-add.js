const fs = require('fs');
const path = require('path');
const INPUT = path.join(__dirname, '..', 'data', 'database', 'bunpou-n5.json');
const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

const ALL_MAP = require('./all-map.json');

function isKanji(ch) {
  const c = ch.charCodeAt(0);
  return (c >= 0x4e00 && c <= 0x9fff);
}
function isHira(ch) {
  const c = ch.charCodeAt(0);
  return c >= 0x3040 && c <= 0x309f;
}
function hasKanji(s) { return /[\u4e00-\u9fff]/.test(s); }

// Find compound starting at position i
// Returns [word, reading] or null
function findMatch(text, i) {
  let j = i;
  while (j < text.length && isKanji(text[j])) j++;
  const kanji = text.substring(i, j);

  // Look ahead for hiragana
  let k = j;
  while (k < text.length && isHira(text[k])) k++;
  const full = text.substring(i, k);

  // Try match: longest first
  for (const [word, reading] of ALL_MAP) {
    if (word.length > full.length) continue;
    if (full.startsWith(word)) {
      return [word, reading];
    }
  }

  return null;
}

let count = 0;
for (const bab of data.babs) {
  for (const point of bab.points) {
    if (!point.examples) continue;
    for (const ex of point.examples) {
      const orig = ex.jp;
      if (!hasKanji(orig)) continue;

      let result = '';
      let i = 0;
      while (i < orig.length) {
        if (isKanji(orig[i])) {
          const match = findMatch(orig, i);
          if (match) {
            const [word, reading] = match;
            result += word + '(' + reading + ')';
            i += word.length;
          } else {
            result += orig[i];
            i++;
          }
        } else {
          result += orig[i];
          i++;
        }
      }

      if (result !== orig) {
        ex.jp = result;
        count++;
      }
    }
  }
}

fs.writeFileSync(INPUT, JSON.stringify(data, null, 2), 'utf-8');
console.log('Added furigana to', count, 'entries');
