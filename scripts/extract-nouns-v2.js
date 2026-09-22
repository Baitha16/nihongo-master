const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp', 'opencode', 'minna_extracted.txt');
const rawText = fs.readFileSync(inputPath, 'utf8');
const lines = rawText.split('\n').map(l => l.trim());

// Kanji mapping
const kanjiMap = {
  'わたし': '私', 'わたしたち': '私たち', 'あなた': 'あなた',
  'あのひと': 'あの人', 'そのひと': 'その人', 'みなさん': '皆さん',
  'さん': 'さん', 'ちゃん': 'ちゃん', 'くん': 'くん',
  'せんせい': '先生', 'きょうし': '教師', 'がくせい': '学生',
  'けんきゅうしゃ': '研究者', 'かいしゃいん': '社員',
  'ぎんこういん': '銀行員', 'いしゃ': '医者',
  'だいがく': '大学', 'びょういん': '病院',
  'でんわ': '電話', 'としょかん': '図書館',
  'ひと': '人', 'ともだち': '友達', 'かれ': '彼', 'かのじょ': '彼女',
  'かぞく': '家族', 'いえ': '家', 'みせ': '店',
  'がっこう': '学校', 'しょくどう': '食堂',
  'かいしゃ': '会社', 'きょうしつ': '教室',
  'めも': 'メモ', 'かぎ': '鍵', 'とけい': '時計',
  'かさ': '傘', 'かばん': '鞄',
  'テレビ': 'テレビ', 'ラジオ': 'ラジオ', 'カメラ': 'カメラ',
  'コンピューター': 'コンピューター', 'じどうしゃ': '自動車',
  'つくえ': '机', 'いす': '椅子',
  'えいご': '英語', 'にほんご': '日本語', 'ことば': '言葉',
  'れんしゅう': '練習', 'べんきょう': '勉強',
  'しごと': '仕事', 'かいもの': '買い物',
  'りょうり': '料理', 'てがみ': '手紙', 'ちず': '地図',
  'まど': '窓', 'とびら': '扉',
  'ほん': '本', 'かみ': '紙', 'ふで': '筆',
  'くろ': '黒', 'しろ': '白', 'あか': '赤', 'あお': '青',
  'きいろ': '黄色', 'みどり': '緑', 'ちゃいろ': '茶色', 'むらさき': '紫',
  'いち': '一', 'に': '二', 'さん': '三', 'し': '四', 'よん': '四',
  'ご': '五', 'ろく': '六', 'しち': '七', 'なな': '七',
  'はち': '八', 'きゅう': '九', 'く': '九', 'じゅう': '十',
  'ひゃく': '百', 'せん': '千', 'まん': '万', 'えん': '円',
  'やま': '山', 'かわ': '川', 'うみ': '海', 'そら': '空',
  'はな': '花', 'とり': '鳥', 'さかな': '魚', 'いぬ': '犬', 'ねこ': '猫',
  'おとこ': '男', 'おんな': '女', 'こ': '子',
  'ちち': '父', 'はは': '母', 'あに': '兄', 'あね': '姉',
  'おとうと': '弟', 'いもうと': '妹',
  'て': '手', 'あし': '足', 'め': '目', 'みみ': '耳',
  'くち': '口', 'かお': '顔', 'あたま': '頭', 'こころ': '心',
  'じかん': '時間', 'きょう': '今日', 'あした': '明日', 'きのう': '昨日',
  'あさ': '朝', 'ひる': '昼', 'よる': '夜',
  'とし': '年', 'げつ': '月', 'ひ': '日',
  'てんき': '天気', 'あめ': '雨', 'ゆき': '雪', 'かぜ': '風',
  'はる': '春', 'なつ': '夏', 'あき': '秋', 'ふゆ': '冬',
  'にほん': '日本', 'ちゅうごく': '中国', 'かんこく': '韓国',
  'でんしゃ': '電車', 'ひこうき': '飛行機', 'ふね': '船',
  'くるま': '車', 'じてんしゃ': '自転車',
  'えき': '駅', 'くうこう': '空港',
  'たべもの': '食べ物', 'のみもの': '飲み物',
  'ごはん': 'ご飯', 'たまご': '卵',
  'にく': '肉', 'やさい': '野菜', 'くだもの': '果物',
  'みず': '水', 'おちゃ': 'お茶', 'こうちゃ': '紅茶',
  'ぎゅうにゅう': '牛乳', 'ジュース': 'ジュース',
  'ビール': 'ビール', 'さけ': '酒',
  'ふく': '服', 'くつ': '靴', 'ネクタイ': 'ネクタイ',
  'ちから': '力', 'げんき': '元気', 'びょうき': '病気',
  'くすり': '薬', 'ゆうめい': '有名',
  'おもう': '思う', 'しゃべる': '喋る',
  'おくる': '送る', 'もらう': 'もらう', 'あげる': '上げる',
  'つける': '付ける', 'けす': '消す', 'ひらく': '開く',
  'しめる': '閉める', 'つくる': '作る', 'なおす': '直す',
  'あらう': '洗う', 'うごく': '動く',
  'とまる': '止まる', 'すわる': '座る', 'たつ': '立つ',
  'きめる': '決める', 'はいる': '入る', 'でる': '出る',
  'もつ': '持つ', 'おく': '置く', 'かえす': '返す',
  'かえる': '帰る', 'すすむ': '進む', 'もどる': '戻る',
  'よぶ': '呼ぶ', 'まつ': '待つ',
  'うける': '受ける', 'うたう': '歌う', 'おどる': '踊る',
  'おこす': '起こす', 'おちる': '落ちる',
  'やく': '焼く', 'はれる': '晴れる', 'ふる': '降る',
  'たべる': '食べる', 'のむ': '飲む', 'いく': '行く', 'くる': '来る',
  'みる': '見る', 'きく': '聞く', 'よむ': '読む', 'かく': '書く',
  'かう': '買う', 'とる': '取る', 'する': 'する', 'あう': '会う',
  'ある': 'ある', 'いる': 'いる', 'なる': 'なる',
  'およぐ': '泳ぐ', 'あるく': '歩く', 'はしる': '走る',
  'おおきい': '大きい', 'ちいさい': '小さい', 'あたらしい': '新しい',
  'ふるい': '古い', 'いい': '良い', 'わるい': '悪い',
  'たのしい': '楽しい', 'かなしい': '悲しい', 'うれしい': '嬉しい',
  'おもしろい': '面白い', 'つまらない': 'つまらない',
  'むずかしい': '難しい', 'やさしい': '易しい',
  'あつい': '暑い', 'さむい': '寒い', 'すずしい': '涼しい',
  'あたたかい': '温かい', 'ながい': '長い', 'みじかい': '短い',
  'ひろい': '広い', 'せまい': '狭い', 'たかい': '高い',
  'やすい': '安い', 'おもい': '重い', 'かるい': '軽い',
  'はやい': '速い', 'おそい': '遅い', 'つよい': '強い',
  'よわい': '弱い',
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
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
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

// Parse vocabulary
const words = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  if (isNumber(line)) {
    let japanese = '';
    let meaning = '';
    let j = i + 1;

    // Get Japanese
    while (j < lines.length && j < i + 5) {
      const nextLine = lines[j];
      if (nextLine && isJapanese(nextLine) && nextLine.length > 0) {
        japanese = nextLine;
        j++;
        break;
      }
      j++;
    }

    // Get meaning (might span multiple lines)
    while (j < lines.length && j < i + 10) {
      const nextLine = lines[j];
      if (nextLine && !isJapanese(nextLine) && !isNumber(nextLine) && nextLine !== '' &&
          !nextLine.includes('Kelompok') && !nextLine.includes('Minna') &&
          !nextLine.includes('Daftar') && !nextLine.includes('Bahasa') &&
          !nextLine.includes('Arti') && nextLine.length > 0) {
        meaning = nextLine;
        j++;

        // Check if meaning continues on next line (multi-word meanings)
        while (j < lines.length && j < i + 15) {
          const contLine = lines[j];
          // If next line is also Indonesian text (not Japanese, not number, not header)
          if (contLine && !isJapanese(contLine) && !isNumber(contLine) && contLine !== '' &&
              !contLine.includes('Kelompok') && !contLine.includes('Minna') &&
              !contLine.includes('Daftar') && !contLine.includes('Bahasa') &&
              !contLine.includes('Arti') && contLine.length > 0 &&
              // Check if it's likely a continuation (not a new entry)
              !contLine.match(/^\d+$/)) {
            meaning += ' ' + contLine;
            j++;
          } else {
            break;
          }
        }
        break;
      }
      j++;
    }

    if (japanese && meaning && japanese.length > 0) {
      const cleanMeaning = meaning.replace(/\s+/g, ' ').trim();
      const kanji = kanjiMap[japanese] || japanese;
      const romaji = textToRomaji(japanese);

      words.push({
        japanese: japanese,
        kanji: kanji,
        romaji: romaji,
        meaning: cleanMeaning
      });
    }
  }
  i++;
}

console.log(`Total words extracted: ${words.length}`);
console.log('Sample:');
words.slice(0, 10).forEach(w => console.log(`  ${w.kanji} | ${w.japanese} | ${w.romaji} | ${w.meaning}`));

// Generate questions
const allMeanings = words.map(w => w.meaning);

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

  // If not enough, add from all meanings
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

// Create questions
const questions = words.map((word, idx) => ({
  id: idx + 1,
  kanji: word.kanji,
  reading: word.japanese,
  romaji: word.romaji,
  meaning: word.meaning,
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
  category: "Kata Benda",
  categoryJapanese: "名詞",
  categoryRomaji: "Meishi",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'nouns.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nBerhasil! ${questions.length} soal kata benda dibagi menjadi ${levels.length} level.`);
