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

function cleanHtml(text) {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseHtmlTables(html) {
  const allQuestions = [];
  
  const tableRegex = /<table>([\s\S]*?)<\/table>/g;
  let tableMatch;
  
  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableContent = tableMatch[1];
    const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
    let rowMatch;
    let isHeader = true;
    
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      if (isHeader) {
        isHeader = false;
        continue;
      }
      
      const cellRegex = /<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/g;
      const cells = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        const cellText = cellMatch[1].replace(/<[^>]+>/g, '').trim();
        cells.push(cellText);
      }
      
      if (cells.length >= 5) {
        const no = cells[0];
        const hiragana = cells[1];
        const kanji = cells[2];
        const romaji = cells[3];
        const arti = cells[4];
        
        if (no && hiragana && arti) {
          allQuestions.push({
            no: parseInt(no) || allQuestions.length + 1,
            hiragana: hiragana,
            kanji: kanji || '',
            romaji: romaji || '',
            meaning: arti
          });
        }
      }
    }
  }
  
  return allQuestions;
}

function parseNonTableData(html) {
  const text = cleanHtml(html);
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const questions = [];
  let i = 0;
  
  // Skip preamble
  while (i < lines.length && !lines[i].startsWith('No')) {
    i++;
  }
  
  while (i < lines.length) {
    // Find "No" section
    if (lines[i] === 'No') {
      i++;
      
      // Collect numbers
      const numbers = [];
      while (i < lines.length && /^\d+$/.test(lines[i])) {
        numbers.push(parseInt(lines[i]));
        i++;
      }
      
      // Find "Hiragana" section
      while (i < lines.length && lines[i] !== 'Hiragana') {
        i++;
      }
      if (i >= lines.length) break;
      i++;
      
      // Collect hiragana entries
      const hiraganaEntries = [];
      while (i < lines.length && lines[i] !== 'Kanji') {
        if (lines[i]) {
          hiraganaEntries.push(lines[i]);
        }
        i++;
      }
      
      // Find "Kanji" section
      if (i >= lines.length) break;
      while (i < lines.length && lines[i] !== 'Kanji') {
        i++;
      }
      if (i >= lines.length) break;
      i++;
      
      // Collect kanji entries
      const kanjiEntries = [];
      while (i < lines.length && lines[i] !== 'Romaji') {
        kanjiEntries.push(lines[i]);
        i++;
      }
      
      // Find "Romaji" section
      if (i >= lines.length) break;
      while (i < lines.length && lines[i] !== 'Romaji') {
        i++;
      }
      if (i >= lines.length) break;
      i++;
      
      // Collect romaji entries
      const romajiEntries = [];
      while (i < lines.length && lines[i] !== 'Arti') {
        if (lines[i]) {
          romajiEntries.push(lines[i]);
        }
        i++;
      }
      
      // Find "Arti" section
      if (i >= lines.length) break;
      while (i < lines.length && lines[i] !== 'Arti') {
        i++;
      }
      if (i >= lines.length) break;
      i++;
      
      // Collect arti entries
      const artiEntries = [];
      while (i < lines.length && lines[i] !== 'No' && lines[i] !== 'BAB') {
        if (lines[i]) {
          artiEntries.push(lines[i]);
        }
        i++;
      }
      
      // Match entries
      const count = Math.min(numbers.length, hiraganaEntries.length, artiEntries.length);
      for (let j = 0; j < count; j++) {
        questions.push({
          no: numbers[j],
          hiragana: hiraganaEntries[j] || '',
          kanji: kanjiEntries[j] || '',
          romaji: romajiEntries[j] || '',
          meaning: artiEntries[j] || ''
        });
      }
    } else {
      i++;
    }
  }
  
  return questions;
}

function main() {
  const file = '3. KOTOBA MASTER N5 (Updated) - donihongo_removed.docx';
  console.log(`Extracting: ${file}`);
  
  extractDocxHtml(file).then(html => {
    // Parse tables
    console.log('\n=== Parsing Tables ===');
    const tableQuestions = parseHtmlTables(html);
    console.log(`Found ${tableQuestions.length} questions from tables`);
    
    // Parse non-table sections
    console.log('\n=== Parsing Non-Table Sections ===');
    const nonTableQuestions = parseNonTableData(html);
    console.log(`Found ${nonTableQuestions.length} questions from non-table sections`);
    
    // Combine and deduplicate
    const allQuestions = [];
    const seen = new Set();
    let id = 1;
    
    // Add table questions first (higher quality)
    for (const q of tableQuestions) {
      const key = `${q.hiragana}|${q.meaning}`;
      if (!seen.has(key)) {
        seen.add(key);
        allQuestions.push({
          id: id++,
          kanji: q.kanji || q.hiragana,
          reading: q.hiragana,
          romaji: q.romaji,
          meaning: q.meaning
        });
      }
    }
    
    // Add non-table questions
    for (const q of nonTableQuestions) {
      const key = `${q.hiragana}|${q.meaning}`;
      if (!seen.has(key) && q.hiragana && q.meaning) {
        seen.add(key);
        allQuestions.push({
          id: id++,
          kanji: q.kanji || q.hiragana,
          reading: q.hiragana,
          romaji: q.romaji,
          meaning: q.meaning
        });
      }
    }
    
    console.log(`\nTotal unique questions: ${allQuestions.length}`);
    
    // Show first 20
    console.log('\nFirst 20 questions:');
    allQuestions.slice(0, 20).forEach((q, i) => {
      console.log(`${i+1}. ${q.kanji} | ${q.reading} | ${q.romaji} | ${q.meaning}`);
    });
    
    // Group into levels
    const questionsPerLevel = 20;
    const levels = {};
    
    allQuestions.forEach((q, index) => {
      const level = Math.floor(index / questionsPerLevel) + 1;
      if (!levels[level]) {
        levels[level] = [];
      }
      q.id = levels[level].length + 1;
      levels[level].push(q);
    });
    
    const kotobaN5 = {
      category: 'Kosakata JLPT N5',
      categoryJapanese: '語彙 N5',
      categoryRomaji: 'Kotoba N5',
      levels: Object.entries(levels).map(([level, questions]) => ({
        level: parseInt(level),
        questions: questions
      }))
    };
    
    // Generate options
    const allMeanings = allQuestions.map(q => q.meaning);
    kotobaN5.levels.forEach(level => {
      level.questions.forEach(q => {
        const others = allMeanings.filter(m => m !== q.meaning);
        const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
        shuffled.push(q.meaning);
        shuffled.sort(() => Math.random() - 0.5);
        q.options = shuffled;
        q.correctIndex = shuffled.indexOf(q.meaning);
      });
    });
    
    console.log(`\nLevels: ${kotobaN5.levels.length}`);
    kotobaN5.levels.forEach(l => {
      console.log(`  Level ${l.level}: ${l.questions.length} questions`);
    });
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'kotoba-n5.json'),
      JSON.stringify(kotobaN5, null, 2)
    );
    console.log('\nSaved to kotoba-n5.json');
  });
}

main();
