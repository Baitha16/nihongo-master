const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'kerja_n4_extracted.txt');
const rawText = fs.readFileSync(inputPath, 'utf8');
const lines = rawText.split('\n').map(l => l.trim());

// Kanji mapping for verbs
const kanjiMap = {
  'ある': 'ある', 'いる': 'いる', 'おきる': '起きる', 'ねる': '寝る',
  'はたらく': '働く', 'やすむ': '休む', 'べんきょうする': '勉強する',
  'おわる': '終わる', 'いそぐ': '急ぐ', 'いれる': '入れる',
  'いう': '言う', 'いかす': '活かす', 'いはんする': '違反する',
  'いのる': '祈る', 'いためる': '痛める', 'いわう': '祝う',
  'いどうする': '移動する', 'うる': '売る', 'うごく': '動く',
  'うごかす': '動かす', 'えらぶ': '選ぶ', 'おくる': '送る',
  'おもう': '思う', 'およぐ': '泳ぐ', 'おりる': '下りる',
  'おろす': '下ろす', 'おくれる': '遅れる', 'おこなう': '行う',
  'おす': '押す', 'おとす': '落す', 'おこす': '起こす',
  'おどる': '踊る', 'かえる': '返す', 'かかる': 'かかる',
  'かう': '買う', 'かぶる': '被る', 'かんがえる': '考える',
  'かいてんする': '回転する', 'かんじる': '感じる', 'かわる': '変わる',
  'かわく': '乾く', 'かぞえる': '数える', 'かくれる': '隠れる',
  'かがやく': '輝く', 'かける': '掛ける', 'かんしゃする': '感謝する',
  'きく': '聞く', 'きこえる': '聞こえる', 'きる': '切る',
  'きずつく': '傷つく', 'きえる': '消える', 'きにいる': '気にいる',
  'きづく': '気づく', 'くみたてる': '組み立てる', 'くる': '来る',
  'けす': '消す', 'けっこんする': '結婚する', 'けっせきする': '欠席する',
  'こうかんする': '交換する', 'さく': '咲く', 'すすむ': '進む',
  'すむ': '済む', 'する': 'する', 'せめる': '攻める',
  'そうそうする': '早速する', 'たすける': '助ける', 'たたむ': '畳む',
  'たべる': '食べる', 'つける': '付ける', 'つうかする': '通過する',
  'つかまる': '捕まる', 'つむ': '紡む', 'てつだう': '手伝う',
  'とどける': '届ける', 'とまる': '止まる', 'とる': '取る',
  'なおす': '直す', 'なおる': '治る', 'ならぶ': '並ぶ',
  'ぬすむ': '盗む', 'のぼる': '登る', 'はいる': '入る',
  'はしる': '走る', 'はなす': '話す', 'はれる': '晴れる',
  'ひく': '引く', 'ふく': '吹く', 'まつ': '待つ', 'まもる': '守る',
  'むかう': '向かう', 'もつ': '持つ', 'もらう': 'もらう',
  'やく': '焼く', 'よぶ': '呼ぶ', 'わすれる': '忘れる',
  'わける': '分ける', 'わかる': '分かる', 'たのむ': '頼む',
  'たのしい': '楽しい', 'のむ': '飲む', 'いく': '行く',
  'みる': '見る', 'よむ': '読む', 'かく': '書く',
  'とる': '取る', 'あう': '会う', 'みえる': '見える',
  'きこえる': '聞こえる', 'あるく': '歩く', 'しゃべる': '喋る',
  'もらう': 'もらう', 'あげる': '上げる', 'けす': '消す',
  'ひらく': '開く', 'しめる': '閉める', 'つくる': '作る',
  'あらう': '洗う', 'すわる': '座る', 'たつ': '立つ',
  'きめる': '決める', 'でる': '出る', 'よぶ': '呼ぶ',
  'うける': '受ける', 'うたう': '歌う', 'おこす': '起こす',
  'おちる': '落ちる', 'やく': '焼く', 'ふる': '降る'
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
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'する': 'suru', 'い': 'i'
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
  return /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～]+$/.test(str);
}

function isNumber(str) {
  return /^\d+$/.test(str);
}

// Parse verbs - FIXED to get full meaning
const verbs = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  if (isNumber(line)) {
    let meaningParts = [];
    let japanese = '';
    let j = i + 1;

    // Get meaning parts until we hit Japanese
    while (j < lines.length && j < i + 15) {
      const nextLine = lines[j];
      
      // If we hit Japanese, stop collecting meaning
      if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
        japanese = nextLine;
        j++;
        break;
      }
      
      // Skip header lines and empty lines
      if (nextLine && nextLine.length > 0 && !isJapanese(nextLine) && !isNumber(nextLine)) {
        if (nextLine.includes('KATA KERJA') || nextLine.includes('INDONESIA') || 
            nextLine.includes('JEPANG') || nextLine.includes('KANJI') || 
            nextLine === 'NO' || nextLine === '-' || 
            nextLine.includes('NO.') || nextLine.includes('Bahasa')) {
          j++;
          continue;
        }
        meaningParts.push(nextLine);
      }
      j++;
    }

    // Get any remaining meaning parts after Japanese
    while (j < lines.length) {
      const nextLine = lines[j];
      if (isNumber(nextLine)) break;
      
      if (nextLine && nextLine.length > 0 && !isJapanese(nextLine)) {
        if (nextLine.includes('KATA KERJA') || nextLine.includes('INDONESIA') || 
            nextLine.includes('JEPANG') || nextLine.includes('KANJI') || 
            nextLine === 'NO' || nextLine === '-' || 
            nextLine.includes('NO.') || nextLine.includes('Bahasa')) {
          j++;
          continue;
        }
        meaningParts.push(nextLine);
      }
      j++;
    }

    if (meaningParts.length > 0 && japanese && japanese.length > 0) {
      let meaning = meaningParts.join(' ').replace(/\s+/g, ' ').trim();
      meaning = meaning.replace(/[,\s]+$/, '').trim();

      const kanji = kanjiMap[japanese] || japanese;
      const romaji = textToRomaji(japanese);

      verbs.push({
        japanese: japanese,
        kanji: kanji,
        romaji: romaji,
        meaning: meaning
      });
    }
  }
  i++;
}

console.log(`Total verbs extracted: ${verbs.length}`);
console.log('\nSample with full meanings:');
verbs.slice(0, 15).forEach(v => console.log(`  ${v.kanji} | ${v.japanese} | ${v.meaning}`));

// Generate questions
const allMeanings = verbs.map(v => v.meaning);

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

const questions = verbs.map((verb, idx) => ({
  id: idx + 1,
  kanji: verb.kanji,
  reading: verb.japanese,
  romaji: verb.romaji,
  meaning: verb.meaning,
  options: [],
  correctIndex: 0
}));

// Split into levels of 50
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
  category: "Kata Kerja",
  categoryJapanese: "動詞",
  categoryRomaji: "Doushi",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'verbs.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nBerhasil! ${questions.length} soal kata kerja dibagi menjadi ${levels.length} level.`);
