const fs = require('fs');
const path = require('path');

// Common Japanese to Romaji mapping
const romajiMap = {
  // Basic chars
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
  // Dakuten
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  // Handakuten
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  // Combo
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
  // Katakana
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
  'ダ': 'da', 'ヂ': 'di', 'ヅ': 'du', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  // Common words
  'わたし': 'watashi', 'わたくし': 'watakushi', 'ぼく': 'boku', 'おれ': 'ore',
  'あなた': 'anata', 'きみ': 'kimi', 'あのかた': 'anokata',
  'みなさん': 'minasan', 'みなさん': 'minasan',
  'せんせい': 'sensei', 'きょうし': 'kyoushi', 'がくせい': 'gakusei',
  'けんきゅうしゃ': 'kenkyuusha', 'かいしゃいん': 'kashaIn',
  'ぎんこういん': 'ginkouin', 'いしゃ': 'isha',
  'だいがく': 'daigaku', 'びょういん': 'byouin',
  'でんわ': 'denwa', 'としょかん': 'toshokan',
  'あなたの': 'anata no', 'ひと': 'hito',
  'ともだち': 'tomodachi', 'かれ': 'kare', 'かのじょ': 'kanojo',
  'かぞく': 'kazoku', 'いえ': 'ie', 'みせ': 'mise',
  'がっこう': 'gakkou', 'しょくどう': 'shokudou',
  'かいしゃ': 'kaisha', 'きょうしつ': 'kyoushitsu',
  'わすれもの': 'wasuremono', 'めも': 'memo',
  'めいく': 'meiku', 'かぎ': 'kagi', 'とけい': 'tokei',
  'かさ': 'kasa', 'かばん': 'kaban',
  'テレビ': 'terebi', 'ラジオ': 'rajio', 'カメラ': 'kamera',
  'コンピューター': 'konpyuutaa', 'じどうしゃ': 'jidousha',
  'つくえ': 'tsukue', 'いす': 'isu',
  'えigo': 'eigo', 'にほんご': 'nihongo', 'ことば': 'kotoba',
  'きょうしつ': 'kyoushitsu', 'しょくどう': 'shokudou',
  'やくそく': 'yakusoku', 'ひま': 'hima',
  'れんしゅう': 'renshuu', 'べんきょう': 'benkyou',
  'しごと': 'shigoto', 'かいもの': 'kaimono',
  'りょうり': 'ryouri', 'でんわ': 'denwa',
  'てがみ': 'tegami', 'ちず': 'chizu', 'かぎ': 'kagi',
  'まど': 'mado', 'とびら': 'tobira', 'つくえ': 'tsukue',
  'ほん': 'hon', 'かみ': 'kami', 'ふで': 'fude',
  'くろ': 'kuro', 'しろ': 'shiro', 'あか': 'aka', 'あお': 'ao',
  'きいろ': 'kiiro', 'みどり': 'midori', 'ちゃいろ': 'chairo',
  'むらさき': 'murasaki',
  'いち': 'ichi', 'に': 'ni', 'さん': 'san', 'し': 'shi', 'よん': 'yon',
  'ご': 'go', 'ろく': 'roku', 'しち': 'shichi', 'なな': 'nana',
  'はち': 'hachi', 'きゅう': 'kyuu', 'く': 'ku', 'じゅう': 'juu',
  'ひゃく': 'hyaku', 'せん': 'sen', 'まん': 'man',
  'えん': 'yen',
  'おおきい': 'ookii', 'ちいさい': 'chiisai', 'あたらしい': 'atarashii',
  'ふるい': 'furui', 'いい': 'ii', 'わるい': 'warui',
  'たのしい': 'tanoshii', 'かなしい': 'kanashii', 'うれしい': 'ureshii',
  'おもしろい': 'omoshiroi', 'つまらない': 'tsumaranai',
  'むずかしい': 'muzukashii', 'やさしい': 'yasashii',
  'あつい': 'atsui', 'さむい': 'samui', 'すずしい': 'suzushii',
  'あたたかい': 'atatakai', 'ながい': 'nagai', 'みじかい': 'mijikai',
  'ひろい': 'hiroi', 'せまい': 'semai', 'たかい': 'takai',
  'やすい': 'yasui', 'おもい': 'omoi', 'かるい': 'karui',
  'はやい': 'hayai', 'おそい': 'osoi', 'つよい': 'tsuyoi',
  'よわい': 'yowai', 'すごい': 'sugoi', 'げんき': 'genki',
  'しずか': 'shizuka', 'にぎやか': 'nigiyaka', 'きれい': 'kirei',
  'きたい': 'kitai', 'ひま': 'hima', 'いそがしい': 'isogashii',
  'すき': 'suki', 'きらい': 'kirai', 'だいじ': 'daiji',
  'べんり': 'benri', 'ふべん': 'fuben',
  // Common verbs
  'たべる': 'taberu', 'のむ': 'nomu', 'いく': 'iku', 'くる': 'kuru',
  'みる': 'miru', 'きく': 'kiku', 'よむ': 'yomu', 'かく': 'kaku',
  'かう': 'kau', 'とる': 'toru', 'する': 'suru', 'あう': 'au',
  'ある': 'aru', 'いる': 'iru', 'なる': 'naru', 'みえる': 'mieru',
  'きこえる': 'kikoeru', 'およぐ': 'oyogu', 'あるく': 'aruku',
  'はしる': 'hashiru', 'たたむ': 'tatamu', 'おもう': 'omou',
  'しゃべる': 'shaberu', 'おくる': 'okuru', 'もらう': 'morau',
  'あげる': 'ageru', 'つける': 'tsukeru', 'けす': 'kesu',
  'ひらく': 'hiraku', 'しめる': 'shimeru', 'つくる': 'tsukuru',
  'なおす': 'naosu', 'あらう': 'arau', 'ふく': 'fuku',
  'うごく': 'ugoku', 'とまる': 'tomaru', 'すわる': 'suwaru',
  'たつ': 'tatsu', 'きまる': 'kimaru', 'きめる': 'kimeru',
  'はいる': 'hairu', 'でる': 'deru', 'もつ': 'motsu',
  'おく': 'oku', 'おろす': 'orosu', 'かえす': 'kaesu',
  'かえる': 'kaeru', 'すすむ': 'susumu', 'もどる': 'modoru',
  'よぶ': 'yobu', 'よける': 'yokeru', 'まつ': 'matsu',
  'うける': 'ukeru', 'うたう': 'utau', 'おどる': 'odoru',
  'おこす': 'okosu', 'おちる': 'ochiru', 'おれる': 'oreru',
  'やく': 'yaku', 'よる': 'yoru', 'くもる': 'kumoru',
  'はれる': 'hareru', 'ふる': 'furu', ' Gleaming': 'gleaming',
  // Common nouns
  'やま': 'yama', 'かわ': 'kawa', 'うみ': 'umi', 'そら': 'sora',
  'はな': 'hana', 'とり': 'tori', 'さかな': 'sakana', 'いぬ': 'inu',
  'ねこ': 'neko', 'おとこ': 'otoko', 'おんな': 'onna', 'こ': 'ko',
  'ちち': 'chichi', 'はは': 'haha', 'あに': 'ani', 'あね': 'ane',
  'おとうと': 'otouto', 'いもうと': 'imouto', 'とも': 'tomo',
  'いえ': 'ie', 'がっこう': 'gakkou', 'かいしゃ': 'kaisha',
  'みち': 'michi', 'くるま': 'kuruma', 'でんしゃ': 'densha',
  'じかん': 'jikan', 'きょう': 'kyou', 'あした': 'ashita',
  'きのう': 'kinou', 'てんき': 'tenki', 'あめ': 'ame', 'ゆき': 'yuki',
  'かぜ': 'kaze', 'はる': 'haru', 'なつ': 'natsu', 'あき': 'aki',
  'ふゆ': 'fuyu', 'あさ': 'asa', 'ひる': 'hiru', 'よる': 'yoru',
  'とし': 'toshi', 'げつ': 'getsu', 'かようび': 'kayoubi',
  'すいようび': 'suiyoubi', 'もくようび': 'mokuyoubi',
  'きんようび': 'kinyoubi', 'どようび': 'doyoubi',
  'にちようび': 'nichiyoubi',
  'にほん': 'nihon', 'ちゅうごく': 'chuugoku',
  'かんこく': 'kankoku', 'アメリカ': 'amerika',
  'たべもの': 'tabemono', 'のみもの': 'nomimono',
  'どうぶつ': 'doubutsu', 'しょくぶつ': 'shokubutsu',
  'すうじ': 'suuji', 'なまえ': 'namae', 'ことば': 'kotoba',
  'こえ': 'koe', 'て': 'te', 'あし': 'ashi', 'め': 'me',
  'みみ': 'mimi', 'くち': 'kuchi', 'かお': 'kao', 'あたま': 'atama',
  'こころ': 'kokoro', 'ちから': 'chikara',
  'びょうき': 'byoukin', 'くすり': 'kusuri',
  'ひこうき': 'hikouki', 'ふね': 'fune',
  'だいがく': 'daigaku', 'せんせい': 'sensei', 'がくせい': 'gakusei',
  'しごと': 'shigoto', 'かいもの': 'kaimono', 'りょうり': 'ryouri',
  'でんわ': 'denwa', 'てがみ': 'tegami', 'ちず': 'chizu',
  'かぎ': 'kagi', 'まど': 'mado', 'とびら': 'tobira',
  'いす': 'isu', 'つくえ': 'tsukue', 'ほん': 'hon', 'かみ': 'kami',
  'ふで': 'fude', 'くろ': 'kuro', 'しろ': 'shiro',
  'あか': 'aka', 'あお': 'ao', 'きいろ': 'kiiro', 'みどり': 'midori',
  'いち': 'ichi', 'ろく': 'roku', 'しち': 'shichi', 'なな': 'nana',
  'はち': 'hachi', 'きゅう': 'kyuu', 'く': 'ku', 'じゅう': 'juu',
  'ひゃく': 'hyaku', 'せん': 'sen', 'まん': 'man', 'えん': 'en',
  // Greetings & common phrases
  'おはよう': 'ohayou', 'こんにちは': 'konnichiwa', 'こんばんは': 'konbanwa',
  'さようなら': 'sayounara', 'ありがとう': 'arigatou', 'すみません': 'sumimasen',
  'ごめん': 'gomen', 'はい': 'hai', 'いいえ': 'iie',
  'おねがい': 'onegai', 'ちょっと': 'chotto', 'だいじょうぶ': 'daijoubu',
  'がんばれ': 'ganbare', 'むり': 'muri', 'じょうず': 'jouzu',
  'へた': 'heta', 'おおきい': 'ookii', 'ちいさい': 'chiisai'
};

function textToRomaji(text) {
  // If already romaji, return as is
  if (/^[a-zA-Z\s]+$/.test(text)) {
    return text;
  }

  let result = '';
  let i = 0;

  while (i < text.length) {
    // Check for combo chars first (2 chars)
    if (i + 1 < text.length) {
      const combo = text.substring(i, i + 2);
      if (romajiMap[combo]) {
        result += romajiMap[combo];
        i += 2;
        continue;
      }
    }

    const char = text[i];
    if (romajiMap[char]) {
      result += romajiMap[char];
    } else if (char >= '\u4E00' && char <= '\u9FFF') {
      // Kanji - try to find in map or skip
      result += char;
    } else {
      result += char;
    }
    i++;
  }

  return result;
}

// Process nouns
function processFile(inputPath, outputPath, category, jpCategory, romajiCategory) {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  data.levels.forEach(level => {
    level.questions.forEach(q => {
      // Add romaji if not present
      if (!q.romaji) {
        q.romaji = textToRomaji(q.reading || q.kanji);
      }
    });
  });

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Processed ${category}: ${data.levels.reduce((acc, l) => acc + l.questions.length, 0)} questions`);
}

const dataDir = path.join(__dirname, '..', 'data');

// Process all files
processFile(
  path.join(dataDir, 'nouns.json'),
  path.join(dataDir, 'nouns.json'),
  'Nouns', '名詞', 'Meishi'
);

processFile(
  path.join(dataDir, 'verbs.json'),
  path.join(dataDir, 'verbs.json'),
  'Verbs', '動詞', 'Doushi'
);

processFile(
  path.join(dataDir, 'adjectives.json'),
  path.join(dataDir, 'adjectives.json'),
  'Adjectives', '形容詞', 'Keiyoushi'
);

processFile(
  path.join(dataDir, 'kanji.json'),
  path.join(dataDir, 'kanji.json'),
  'Kanji', '漢字', 'Kanji'
);

console.log('All files processed with romaji!');
