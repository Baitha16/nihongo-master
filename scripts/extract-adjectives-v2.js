const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'sifat_extracted.txt');
const rawText = fs.readFileSync(inputPath, 'utf8');
const lines = rawText.split('\n').map(l => l.trim());

// Kanji mapping for adjectives
const kanjiMap = {
  'きれい': '綺麗', 'ハンサム': 'ハンサム', 'しんせつ': '親切',
  'げんき': '元気', 'ゆうめい': '有名', 'にぎやか': '賑やか',
  'しずか': '静か', 'かんたんな': '簡単', 'ふくざつ': '複雑',
  'すき': '好き', 'きらい': '嫌い', 'だいすき': '大好き',
  'だいきらい': '大嫌い', 'ばか': '馬鹿', 'あほ': '阿呆',
  'ひま': '暇', 'だいじ': '大事', 'べんり': '便利',
  'ふべん': '不便', 'しゅう': '中', 'せいかつ': '生活',
  'おもい': '重い', 'かるい': '軽い', 'つよい': '強い',
  'よわい': '弱い', 'おおきい': '大きい', 'ちいさい': '小さい',
  'あたらしい': '新しい', 'ふるい': '古い', 'いい': '良い',
  'わるい': '悪い', 'たのしい': '楽しい', 'かなしい': '悲しい',
  'うれしい': '嬉しい', 'おもしろい': '面白い', 'つまらない': 'つまらない',
  'むずかしい': '難しい', 'やさしい': '易しい', 'あつい': '暑い',
  'さむい': '寒い', 'すずしい': '涼しい', 'あたたかい': '温かい',
  'ながい': '長い', 'みじかい': '短い', 'ひろい': '広い',
  'せまい': '狭い', 'たかい': '高い', 'やすい': '安い',
  'はやい': '速い', 'おそい': '遅い', 'すごい': 'すごい',
  'おどろく': '驚く', 'およぐ': '泳ぐ', 'あるく': '歩く',
  'はしる': '走る', 'たべる': '食べる', 'のむ': '飲む',
  'いく': '行く', 'くる': '来る', 'みる': '見る', 'きく': '聞く',
  'よむ': '読む', 'かく': '書く', 'かう': '買う', 'とる': '取る',
  'する': 'する', 'あう': '会う', 'ある': 'ある', 'いる': 'いる',
  'なる': 'なる', 'みえる': '見える', 'きこえる': '聞こえる',
  'しゃべる': '喋る', 'おくる': '送る', 'もらう': 'もらう',
  'あげる': '上げる', 'つける': '付ける', 'けす': '消す',
  'ひらく': '開く', 'しめる': '閉める', 'つくる': '作る',
  'なおす': '直す', 'あらう': '洗う', 'うごく': '動く',
  'とまる': '止まる', 'すわる': '座る', 'たつ': '立つ',
  'きめる': '決める', 'はいる': '入る', 'でる': '出る',
  'もつ': '持つ', 'おく': '置く', 'かえす': '返す',
  'かえる': '帰る', 'すすむ': '進む', 'もどる': '戻る',
  'よぶ': '呼ぶ', 'まつ': '待つ', 'うける': '受ける',
  'うたう': '歌う', 'おどる': '踊る', 'おこす': '起こす',
  'おちる': '落ちる', 'やく': '焼く', 'はれる': '晴れる',
  'ふる': '降る',
  'しずか': '静か', 'にぎやか': '賑やか', 'きれい': '綺麗',
  'すき': '好き', 'きらい': '嫌い', 'だいじ': '大事',
  'べんり': '便利', 'ふべん': '不便'
};

// Romaji mapping
const romajiMap = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo'
};

function textToRomaji(text) {
  if (/^[a-zA-Z\s]+$/.test(text)) return text;
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (i + 1 < text.length) {
      const combo = text.substring(i, i + 2);
      if (romajiMap[combo]) {
        result += romajiMap[combo];
        i += 2;
        continue;
      }
    }
    const char = text[i];
    result += romajiMap[char] || char;
    i++;
  }
  return result;
}

function isJapanese(str) {
  return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～（）\-]+$/.test(str);
}

function isNumber(str) {
  return /^\d+$/.test(str);
}

// Parse adjectives
const adjectives = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  if (isNumber(line)) {
    let meaning = '';
    let japanese = '';
    let j = i + 1;

    // Get meaning
    while (j < lines.length && j < i + 6) {
      const nextLine = lines[j];
      if (nextLine && !isJapanese(nextLine) && !isNumber(nextLine) && nextLine !== '' &&
          !nextLine.includes('KATA SIFAT') && !nextLine.includes('INDONESIA') && !nextLine.includes('KANJI') && !nextLine.includes('NO')) {
        meaning = nextLine;
        j++;
        break;
      }
      j++;
    }

    // Get Japanese
    while (j < lines.length && j < i + 10) {
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
      meaning = meaning.replace(/\(.*?\)/g, '').trim();

      const kanji = kanjiMap[japanese] || japanese;
      const romaji = textToRomaji(japanese);

      adjectives.push({
        japanese: japanese,
        kanji: kanji,
        romaji: romaji,
        meaning: meaning
      });
    }
  }
  i++;
}

console.log(`Total adjectives extracted: ${adjectives.length}`);
console.log('Sample:');
adjectives.slice(0, 10).forEach(a => console.log(`  ${a.kanji} | ${a.japanese} | ${a.romaji} | ${a.meaning}`));

// Generate questions
const allMeanings = adjectives.map(a => a.meaning);

function generateOptions(correctMeaning, levelMeanings) {
  const wrongOptions = [];
  const otherMeanings = levelMeanings.filter(m => m !== correctMeaning);
  const shuffled = otherMeanings.sort(() => 0.5 - Math.random());

  for (const m of shuffled) {
    if (wrongOptions.length >= 3) break;
    if (!wrongOptions.includes(m)) {
      wrongOptions.push(m);
    }
  }

  if (wrongOptions.length < 3) {
    const allOther = allMeanings.filter(m => m !== correctMeaning && !wrongOptions.includes(m));
    const shuffledAll = allOther.sort(() => 0.5 - Math.random());
    for (const m of shuffledAll) {
      if (wrongOptions.length >= 3) break;
      wrongOptions.push(m);
    }
  }

  return wrongOptions.slice(0, 3);
}

const questions = adjectives.map((adj, idx) => ({
  id: idx + 1,
  kanji: adj.kanji,
  reading: adj.japanese,
  romaji: adj.romaji,
  meaning: adj.meaning,
  options: [],
  correctIndex: 0
}));

// Split into levels of 50 (but since we have ~109, use 50 per level)
const levels = [];
for (let i = 0; i < questions.length; i += 50) {
  const levelQuestions = questions.slice(i, i + 50);
  const levelMeanings = levelQuestions.map(q => q.meaning);

  levelQuestions.forEach(q => {
    const wrongOptions = generateOptions(q.meaning, levelMeanings);
    const options = [...wrongOptions];
    const correctIndex = Math.floor(Math.random() * 4);
    options.splice(correctIndex, 0, q.meaning);
    q.options = options;
    q.correctIndex = correctIndex;
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
console.log(`\nBerhasil! ${questions.length} soal kata sifat dibagi menjadi ${levels.length} level.`);
