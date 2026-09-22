const fs = require('fs');
const path = require('path');

// Common Kanji characters with readings and meanings
const kanjiData = [
  { kanji: '水', reading: 'みず', meaning: 'Air' },
  { kanji: '火', reading: 'ひ', meaning: 'Api' },
  { kanji: '木', reading: 'き', meaning: 'Pohon' },
  { kanji: '金', reading: 'かね', meaning: 'Uang/Emas' },
  { kanji: '土', reading: 'つち', meaning: 'Tanah' },
  { kanji: '日', reading: 'ひ', meaning: 'Hari/Matahari' },
  { kanji: '月', reading: 'つき', meaning: 'Bulan' },
  { kanji: '火', reading: 'か', meaning: 'Api' },
  { kanji: '水', reading: 'すい', meaning: 'Air' },
  { kanji: '木', reading: 'もく', meaning: 'Pohon' },
  { kanji: '金', reading: 'きん', meaning: 'Emas' },
  { kanji: '土', reading: 'ど', meaning: 'Tanah' },
  { kanji: '山', reading: 'やま', meaning: 'Gunung' },
  { kanji: '川', reading: 'かわ', meaning: 'Sungai' },
  { kanji: '海', reading: 'うみ', meaning: 'Laut' },
  { kanji: '空', reading: 'そら', meaning: 'Langit' },
  { kanji: '花', reading: 'はな', meaning: 'Bunga' },
  { kanji: '鳥', reading: 'とり', meaning: 'Burung' },
  { kanji: '魚', reading: 'さかな', meaning: 'Ikan' },
  { kanji: '犬', reading: 'いぬ', meaning: 'Anjing' },
  { kanji: '猫', reading: 'ねこ', meaning: 'Kucing' },
  { kanji: '人', reading: 'ひと', meaning: 'Orang' },
  { kanji: '男', reading: 'おとこ', meaning: 'Laki-laki' },
  { kanji: '女', reading: 'おんな', meaning: 'Perempuan' },
  { kanji: '子', reading: 'こ', meaning: 'Anak' },
  { kanji: '父', reading: 'ちち', meaning: 'Ayah' },
  { kanji: '母', reading: 'はは', meaning: 'Ibu' },
  { kanji: '兄', reading: 'あに', meaning: 'Kakak laki-laki' },
  { kanji: '姉', reading: 'あね', meaning: 'Kakak perempuan' },
  { kanji: '弟', reading: 'おとうと', meaning: 'Adik laki-laki' },
  { kanji: '妹', reading: 'いもうと', meaning: 'Adik perempuan' },
  { kanji: '友', reading: 'とも', meaning: 'Teman' },
  { kanji: '家', reading: 'いえ', meaning: 'Rumah' },
  { kanji: '学校', reading: 'がっこう', meaning: 'Sekolah' },
  { kanji: '会社', reading: 'かいしゃ', meaning: 'Perusahaan' },
  { kanji: '道', reading: 'みち', meaning: 'Jalan' },
  { kanji: '車', reading: 'くるま', meaning: 'Mobil' },
  { kanji: '電車', reading: 'でんしゃ', meaning: 'Kereta api' },
  { kanji: '時間', reading: 'じかん', meaning: 'Waktu' },
  { kanji: '今日', reading: 'きょう', meaning: 'Hari ini' },
  { kanji: '明日', reading: 'あした', meaning: 'Besok' },
  { kanji: '昨日', reading: 'きのう', meaning: 'Kemarin' },
  { kanji: '天気', reading: 'てんき', meaning: 'Cuaca' },
  { kanji: '雨', reading: 'あめ', meaning: 'Hujan' },
  { kanji: '雪', reading: 'ゆき', meaning: 'Salju' },
  { kanji: '風', reading: 'かぜ', meaning: 'Angin' },
  { kanji: '春', reading: 'はる', meaning: 'Musim semi' },
  { kanji: '夏', reading: 'なつ', meaning: 'Musim panas' },
  { kanji: '秋', reading: 'あき', meaning: 'Musim gugur' },
  { kanji: '冬', reading: 'ふゆ', meaning: 'Musim dingin' },
  { kanji: '朝', reading: 'あさ', meaning: 'Pagi' },
  { kanji: '昼', reading: 'ひる', meaning: 'Siang' },
  { kanji: '夜', reading: 'よる', meaning: 'Malam' },
  { kanji: '年', reading: 'とし', meaning: 'Tahun' },
  { kanji: '月', reading: 'げつ', meaning: 'Bulan' },
  { kanji: '火曜日', reading: 'かようび', meaning: 'Selasa' },
  { kanji: '水曜日', reading: 'すいようび', meaning: 'Rabu' },
  { kanji: '木曜日', reading: 'もくようび', meaning: 'Kamis' },
  { kanji: '金曜日', reading: 'きんようび', meaning: 'Jumat' },
  { kanji: '土曜日', reading: 'どようび', meaning: 'Sabtu' },
  { kanji: '日本', reading: 'にほん', meaning: 'Jepang' },
  { kanji: '中国', reading: 'ちゅうごく', meaning: 'China' },
  { kanji: '韩国', reading: 'かんこく', meaning: 'Korea' },
  { kanji: '美国', reading: 'アメリカ', meaning: 'Amerika' },
  { kanji: '食物', reading: 'たべもの', meaning: 'Makanan' },
  { kanji: '飲み物', reading: 'のみもの', meaning: 'Minuman' },
  { kanji: '動物', reading: 'どうぶつ', meaning: 'Hewan' },
  { kanji: '植物', reading: 'しょくぶつ', meaning: 'Tumbuhan' },
  { kanji: '数字', reading: 'すうじ', meaning: 'Angka' },
  { kanji: '名前', reading: 'なまえ', meaning: 'Nama' },
  { kanji: '言葉', reading: 'ことば', meaning: 'Kata' },
  { kanji: '声', reading: 'こえ', meaning: 'Suara' },
  { kanji: '手', reading: 'て', meaning: 'Tangan' },
  { kanji: '足', reading: 'あし', meaning: 'Kaki' },
  { kanji: '目', reading: 'め', meaning: 'Mata' },
  { kanji: '耳', reading: 'みみ', meaning: 'Telinga' },
  { kanji: '口', reading: 'くち', meaning: 'Mulut' },
  { kanji: '顔', reading: 'かお', meaning: 'Wajah' },
  { kanji: '頭', reading: 'あたま', meaning: 'Kepala' },
  { kanji: '心', reading: 'こころ', meaning: 'Hati' },
  { kanji: '力', reading: 'ちから', meaning: 'Kekuatan' },
  { kanji: '元気', reading: 'げんき', meaning: 'Sehat' },
  { kanji: '病気', reading: 'びょうき', meaning: 'Sakit' },
  { kanji: '薬', reading: 'くすり', meaning: 'Obat' },
  { kanji: '医者', reading: 'いしゃ', meaning: 'Dokter' },
  { kanji: '飛行機', reading: 'ひこうき', meaning: 'Pesawat' },
  { kanji: '船', reading: 'ふね', meaning: 'Kapal' },
  { kanji: '大学', reading: 'だいがく', meaning: 'Universitas' },
  { kanji: '先生', reading: 'せんせい', meaning: 'Guru' },
  { kanji: '学生', reading: 'がくせい', meaning: 'Mahasiswa' },
  { kanji: '仕事', reading: 'しごと', meaning: 'Pekerjaan' },
  { kanji: '買物', reading: 'かいもの', meaning: 'Belanja' },
  { kanji: '料理', reading: 'りょうり', meaning: 'Memasak' },
  { kanji: '電話', reading: 'でんわ', meaning: 'Telepon' },
  { kanji: '手紙', reading: 'てがみ', meaning: 'Surat' },
  { kanji: '地図', reading: 'ちず', meaning: 'Peta' },
  { kanji: '鍵', reading: 'かぎ', meaning: 'Kunci' },
  { kanji: '窓', reading: 'まど', meaning: 'Jendela' },
  { kanji: '扉', reading: 'とびら', meaning: 'Pintu' },
  { kanji: '椅子', reading: 'いす', meaning: 'Kursi' },
  { kanji: '机', reading: 'つくえ', meaning: 'Meja' },
  { kanji: '本', reading: 'ほん', meaning: 'Buku' },
  { kanji: '紙', reading: 'かみ', meaning: 'Kertas' },
  { kanji: '笔', reading: 'ふで', meaning: 'Pena' },
  { kanji: '黒', reading: 'くろ', meaning: 'Hitam' },
  { kanji: '白', reading: 'しろ', meaning: 'Putih' },
  { kanji: '赤', reading: 'あか', meaning: 'Merah' },
  { kanji: '青', reading: 'あお', meaning: 'Biru' },
  { kanji: '黄色', reading: 'きいろ', meaning: 'Kuning' },
  { kanji: '緑', reading: 'みどり', meaning: 'Hijau' },
  { kanji: '茶色', reading: 'ちゃいろ', meaning: 'Cokelat' },
  { kanji: '紫', reading: 'むらさき', meaning: 'Ungu' },
  { kanji: '一', reading: 'いち', meaning: 'Satu' },
  { kanji: '二', reading: 'に', meaning: 'Dua' },
  { kanji: '三', reading: 'さん', meaning: 'Tiga' },
  { kanji: '四', reading: 'し/よん', meaning: 'Empat' },
  { kanji: '五', reading: 'ご', meaning: 'Lima' },
  { kanji: '六', reading: 'ろく', meaning: 'Enam' },
  { kanji: '七', reading: 'しち/なな', meaning: 'Tujuh' },
  { kanji: '八', reading: 'はち', meaning: 'Delapan' },
  { kanji: '九', reading: 'きゅう/く', meaning: 'Sembilan' },
  { kanji: '十', reading: 'じゅう', meaning: 'Sepuluh' },
  { kanji: '百', reading: 'ひゃく', meaning: 'Ratus' },
  { kanji: '千', reading: 'せん', meaning: 'Ribu' },
  { kanji: '万', reading: 'まん', meaning: 'Puluh ribu' },
  { kanji: '円', reading: 'えん', meaning: 'Yen' },
  { kanji: '大', reading: 'おお', meaning: 'Besar' },
  { kanji: '小', reading: 'ちい/こ', meaning: 'Kecil' },
  { kanji: '中', reading: 'なか', meaning: 'Tengah' },
  { kanji: '上', reading: 'うえ', meaning: 'Atas' },
  { kanji: '下', reading: 'した', meaning: 'Bawah' },
  { kanji: '左', reading: 'ひだり', meaning: 'Kiri' },
  { kanji: '右', reading: 'みぎ', meaning: 'Kanan' },
  { kanji: '前', reading: 'まえ', meaning: 'Depan' },
  { kanji: '後', reading: 'うしろ', meaning: 'Belakang' },
  { kanji: '外', reading: 'そと', meaning: 'Luar' },
  { kanji: '内', reading: 'うち', meaning: 'Dalam' },
  { kanji: '近', reading: 'ちか', meaning: 'Dekat' },
  { kanji: '遠', reading: 'とお', meaning: 'Jauh' },
  { kanji: '高', reading: 'たか', meaning: 'Tinggi' },
  { kanji: '安', reading: 'やす', meaning: 'Murah' },
  { kanji: '新', reading: 'あたら', meaning: 'Baru' },
  { kanji: '古', reading: 'ふる', meaning: 'Lama' },
  { kanji: '長', reading: 'なが', meaning: 'Panjang' },
  { kanji: '短', reading: 'みじか', meaning: 'Pendek' },
  { kanji: '早', reading: 'はや', meaning: 'Cepat' },
  { kanji: '遅', reading: 'おそ', meaning: 'Lambat' }
];

// Remove duplicates based on kanji
const uniqueMap = new Map();
kanjiData.forEach(item => {
  if (!uniqueMap.has(item.kanji)) {
    uniqueMap.set(item.kanji, item);
  }
});
const uniqueKanji = Array.from(uniqueMap.values());

// Generate questions
const allMeanings = uniqueKanji.map(k => k.meaning);

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

  const generic = ['Makan', 'Minum', 'Tidur', 'Jalan', 'Lari', 'Baca', 'Tulis', 'Duduk', 'Berdiri'];
  for (const g of generic) {
    if (wrongOptions.length >= 3) break;
    if (g !== correctMeaning && !wrongOptions.includes(g)) {
      wrongOptions.push(g);
    }
  }

  return wrongOptions.slice(0, 3);
}

const questions = uniqueKanji.map((item, idx) => {
  const wrongOptions = generateOptions(item.meaning);
  const options = [...wrongOptions];
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, item.meaning);

  return {
    id: idx + 1,
    kanji: item.kanji,
    reading: item.reading,
    meaning: item.meaning,
    options: options,
    correctIndex: correctIndex
  };
});

// Split into levels
const levels = [];
for (let i = 0; i < questions.length; i += 50) {
  const levelQuestions = questions.slice(i, i + 50);

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
  category: "Kuis Khusus Kanji",
  categoryJapanese: "漢字",
  categoryRomaji: "Kanji",
  levels: levels
};

const outputPath = path.join(__dirname, '..', 'data', 'kanji.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Berhasil! ${questions.length} soal kanji dibagi menjadi ${levels.length} level.`);
console.log(`File disimpan di: ${outputPath}`);
