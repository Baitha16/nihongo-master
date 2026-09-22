const fs = require('fs');
const path = require('path');

// Common Japanese adjectives with meanings
const adjectives = [
  // I-Adjectives (Keiyoushi)
  { japanese: 'おおきい', reading: 'おおきい', meaning: 'Besar' },
  { japanese: 'ちいさい', reading: 'ちいさい', meaning: 'Kecil' },
  { japanese: 'あたらしい', reading: 'あたらしい', meaning: 'Baru' },
  { japanese: 'ふるい', reading: 'ふるい', meaning: 'Lama' },
  { japanese: 'いい', reading: 'いい', meaning: 'Bagus' },
  { japanese: 'わるい', reading: 'わるい', meaning: 'Jahat' },
  { japanese: 'たのしい', reading: 'たのしい', meaning: 'Menyenangkan' },
  { japanese: 'かなしい', reading: 'かなしい', meaning: 'Sedih' },
  { japanese: 'うれしい', reading: 'うれしい', meaning: 'Senang' },
  { japanese: 'おもしろい', reading: 'おもしろい', meaning: 'Menarik' },
  { japanese: 'つまらない', reading: 'つまらない', meaning: 'Membosankan' },
  { japanese: 'むずかしい', reading: 'むずかしい', meaning: 'Sulit' },
  { japanese: 'やさしい', reading: 'やさしい', meaning: 'Mudah/Ramah' },
  { japanese: 'あつい', reading: 'あつい', meaning: 'Panas' },
  { japanese: 'さむい', reading: 'さむい', meaning: 'Dingin' },
  { japanese: 'すずしい', reading: 'すずしい', meaning: 'Sejuk' },
  { japanese: 'あたたかい', reading: 'あたたかい', meaning: 'Hangat' },
  { japanese: 'ながい', reading: 'ながい', meaning: 'Panjang' },
  { japanese: 'みじかい', reading: 'みじかい', meaning: 'Pendek' },
  { japanese: 'ひろい', reading: 'ひろい', meaning: 'Luas' },
  { japanese: 'せまい', reading: 'せまい', meaning: 'Sempit' },
  { japanese: 'たかい', reading: 'たかい', meaning: 'Tinggi/Mahal' },
  { japanese: 'やすい', reading: 'やすい', meaning: 'Murah' },
  { japanese: 'おもい', reading: 'おもい', meaning: 'Berat' },
  { japanese: 'かるい', reading: 'かるい', meaning: 'Ringan' },
  { japanese: 'はやい', reading: 'はやい', meaning: 'Cepat' },
  { japanese: 'おそい', reading: 'おそい', meaning: 'Lambat' },
  { japanese: 'おどろい', reading: 'おどろい', meaning: 'Lurus' },
  { japanese: 'まがった', reading: 'まがった', meaning: 'Bengkok' },
  { japanese: 'つよい', reading: 'つよい', meaning: 'Kuat' },
  { japanese: 'よわい', reading: 'よわい', meaning: 'Lemah' },
  { japanese: 'すごい', reading: 'すごい', meaning: 'Hebat' },
  { japanese: 'げんき', reading: 'げんき', meaning: 'Sehat' },
  { japanese: 'びょうき', reading: 'びょうき', meaning: 'Sakit' },
  { japanese: 'しずか', reading: 'しずか', meaning: 'Tenang' },
  { japanese: 'にぎやか', reading: 'にぎやか', meaning: 'Ramai' },
  { japanese: 'きれい', reading: 'きれい', meaning: 'Indah/Bersih' },
  { japanese: 'きたない', reading: 'きたない', meaning: 'Kotor' },
  { japanese: 'あかるい', reading: 'あかるい', meaning: 'Terang' },
  { japanese: 'くらい', reading: 'くらい', meaning: 'Gelap' },
  { japanese: 'ひま', reading: 'ひま', meaning: 'Senggang' },
  { japanese: 'いそがしい', reading: 'いそがしい', meaning: 'Sibuk' },
  { japanese: 'ある', reading: 'ある', meaning: 'Ada' },
  { japanese: 'ない', reading: 'ない', meaning: 'Tidak ada' },
  { japanese: 'おなじ', reading: 'おなじ', meaning: 'Sama' },
  { japanese: 'ちがう', reading: 'ちがう', meaning: 'Beda' },
  { japanese: 'もっと', reading: 'もっと', meaning: 'Lebih' },
  { japanese: 'いちばん', reading: 'いちばん', meaning: 'Paling' },
  { japanese: 'すき', reading: 'すき', meaning: 'Suka' },
  { japanese: 'きらい', reading: 'きらい', meaning: 'Benci' },

  // Na-Adjectives (Keiyoudoushi)
  { japanese: 'しずか', reading: 'しずか', meaning: 'Tenang' },
  { japanese: 'にぎやか', reading: 'にぎやか', meaning: 'Ramai' },
  { japanese: 'きれい', reading: 'きれい', meaning: 'Indah' },
  { japanese: 'げんき', reading: 'げんき', meaning: 'Sehat' },
  { japanese: 'ひま', reading: 'ひま', meaning: 'Senggang' },
  { japanese: 'すき', reading: 'すき', meaning: 'Suka' },
  { japanese: 'きらい', reading: 'きらい', meaning: 'Benci' },
  { japanese: 'だいじ', reading: 'だいじ', meaning: 'Penting' },
  { japanese: 'だいすき', reading: 'だいすき', meaning: 'Sangat suka' },
  { japanese: 'ちょっと', reading: 'ちょっと', meaning: 'Sedikit' },
  { japanese: 'いろいろ', reading: 'いろいろ', meaning: 'Berbagai' },
  { japanese: 'ほしい', reading: 'ほしい', meaning: 'Inginkan' },
  { japanese: 'まっすぐ', reading: 'まっすぐ', meaning: 'Lurus' },
  { japanese: 'きれい', reading: 'きれい', meaning: 'Bersih' },
  { japanese: 'すき', reading: 'すき', meaning: 'Menyukai' },
  { japanese: 'きらい', reading: 'きらい', meaning: 'Tidak suka' },
  { japanese: 'げんき', reading: 'げんき', meaning: 'Bersemangat' },
  { japanese: 'ひま', reading: 'ひま', meaning: 'Tidak sibuk' },
  { japanese: 'いそがしい', reading: 'いそがしい', meaning: 'Sibuk' },
  { japanese: 'だいじょうぶ', reading: 'だいじょうぶ', meaning: 'Tidak apa-apa' },
  { japanese: 'ふべん', reading: 'ふべん', meaning: 'Tidak nyaman' },
  { japanese: 'べんり', reading: 'べんり', meaning: 'Nyaman' },
  { japanese: 'しずか', reading: 'しずか', meaning: 'Sunyi' },
  { japanese: 'にぎやか', reading: 'にぎやか', meaning: 'Hiruk-pikuk' },
  { japanese: 'ゆうめい', reading: 'ゆうめい', meaning: 'Terkenal' },
  { japanese: 'めいしょ', reading: 'めいしょ', meaning: 'Terkenal' },
  { japanese: 'ひみつ', reading: 'ひみつ', meaning: 'Rahasia' },
  { japanese: 'たいせつ', reading: 'たいせつ', meaning: 'Berharga' },
  { japanese: 'だいじ', reading: 'だいじ', meaning: 'Penting' },
  { japanese: 'ふだいじ', reading: 'ふだいじ', meaning: 'Tidak penting' }
];

// Remove duplicates based on meaning
const uniqueMeanings = new Map();
adjectives.forEach(adj => {
  if (!uniqueMeanings.has(adj.meaning)) {
    uniqueMeanings.set(adj.meaning, adj);
  }
});
const uniqueAdjectives = Array.from(uniqueMeanings.values());

// Generate questions with options
const allMeanings = uniqueAdjectives.map(a => a.meaning);

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

  // Fill with generic if needed
  const generic = ['Makan', 'Minum', 'Tidur', 'Jalan', 'Lari', 'Baca', 'Tulis'];
  for (const g of generic) {
    if (wrongOptions.length >= 3) break;
    if (g !== correctMeaning && !wrongOptions.includes(g)) {
      wrongOptions.push(g);
    }
  }

  return wrongOptions.slice(0, 3);
}

const questions = uniqueAdjectives.map((adj, idx) => {
  const wrongOptions = generateOptions(adj.meaning);
  const options = [...wrongOptions];
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, adj.meaning);

  return {
    id: idx + 1,
    kanji: adj.japanese,
    reading: adj.reading,
    meaning: adj.meaning,
    options: options,
    correctIndex: correctIndex
  };
});

// Split into levels
const levels = [];
for (let i = 0; i < questions.length; i += 50) {
  const levelQuestions = questions.slice(i, i + 50);

  // Regenerate options
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
  category: "Kata Sifat",
  categoryJapanese: "形容詞",
  categoryRomaji: "Keiyoushi",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'adjectives.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Berhasil! ${questions.length} soal kata sifat dibagi menjadi ${levels.length} level.`);
console.log(`File disimpan di: ${outputPath}`);
