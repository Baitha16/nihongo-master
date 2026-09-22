const fs = require("fs");
const path = require("path");
const OUT = "D:/Github/Belajar Jepang/data/database/bunpou-n5.json";
const FG = JSON.parse(fs.readFileSync("D:/Github/Belajar Jepang/DATABASE/furigana.json", "utf8"));

function furigana(text) {
  if (!text || !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)) return text;
  var keys = Object.keys(FG).sort(function(a,b){return b.length-a.length;});
  for (var i = 0; i < keys.length; i++) {
    var re = new RegExp(keys[i].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?!\\()","g");
    text = text.replace(re, keys[i]+"("+FG[keys[i]]+")");
  }
  return text;
}

var ex = JSON.parse(fs.readFileSync(OUT, "utf8"));

var b11 = ex.babs.find(function(b){return b.bab===11});
if (b11 && b11.content && !b11.points) {
  b11.points = [
    {num:1, title:"Menggunakan Satuan Penghitung (助数詞 - Josuushi)", body:"Satuan penghitung digunakan untuk menghitung benda, orang, atau hal tertentu.\nPola: [Jumlah] + [Satuan]", examples:[{jp:"家族(かぞく)は二人(ふたり)です。",translation:"(Kazoku wa futari desu.) \u2014 Keluarga saya terdiri dari dua orang."},{jp:"リンゴを一つ(ひとつ)食(た)べました。",translation:"(Ringo o hitotsu tabemashita.) \u2014 Saya makan satu apel."},{jp:"本(ほん)を一冊(いっさつ)借(か)りました。",translation:"(Hon o issatsu karimashita.) \u2014 Saya meminjam satu buku."},{jp:"車(くるま)を一台(いちだい)買(か)いました。",translation:"(Kuruma o ichidai kaimashita.) \u2014 Saya membeli satu mobil."}], pattern:"[Jumlah] + [Satuan]"},
    {num:2, title:"Satuan Penghitung untuk Buku/Majalah", body:"Buku dan majalah menggunakan satuan 冊(さつ).\n1冊=issatsu, 2冊=nisatsu, 3冊=sansatsu, 4冊=yonsatsu", examples:[{jp:"本(ほん)を一冊(いっさつ)借(か)りました。",translation:"(Hon o issatsu karimashita.) \u2014 Saya meminjam satu buku."}], pattern:"[Jumlah] + 冊"},
    {num:3, title:"Satuan Penghitung untuk Kendaraan/Benda Besar", body:"Kendaraan dan benda besar menggunakan satuan 台(だい).\n1台=ichidai, 2台=nidai, 3台=sandai, 4台=yondai", examples:[{jp:"車(くるま)を一台(いちだい)買(か)いました。",translation:"(Kuruma o ichidai kaimashita.) \u2014 Saya membeli satu mobil."}], pattern:"[Jumlah] + 台"},
    {num:4, title:"Satuan Penghitung untuk Benda Tipis (枚 - mai)", body:"Benda tipis seperti kertas, tiket, foto menggunakan satuan 枚(まい).\n1枚=ichimai, 2枚=nimai, 3枚=sanmai, 4枚=yonmai", examples:[], pattern:"[Jumlah] + 枚"},
    {num:5, title:"Satuan Penghitung untuk Benda Silinder (本 - hon)", body:"Benda silinder panjang seperti pensil, botol, payung menggunakan satuan 本(ほん).\n1本=ippon, 2本=nihon, 3本=sanbon, 4本=yonhon", examples:[], pattern:"[Jumlah] + 本"},
    {num:6, title:"Satuan Penghitung untuk Botol/Gelas (杯 - hai)", body:"Botol, gelas, mangkuk menggunakan satuan 杯(はい).\n1杯=ippai, 2杯=nihai, 3杯=sanpai, 4杯=yonpai", examples:[], pattern:"[Jumlah] + 杯"},
    {num:7, title:"Kata Kerja dengan Bentuk た + 時間/約束/用事", body:"Menyatakan aktivitas yang sudah atau belum dilakukan.", examples:[], pattern:"Verb ました / ませんでした"},
    {num:8, title:"Menyatakan Frekuensi dengan ～たり ～たり します", body:"Menyatakan beberapa aktivitas yang dilakukan secara bergantian.", examples:[], pattern:"Verb たり Verb たり します"},
    {num:9, title:"Ekspresi Jumlah dan Penghitungan", body:"Penggunaan angka dan satuan penghitung dalam konteks sehari-hari.", examples:[], pattern:"[Angka] + [Satuan] + [Kata Kerja]"}
  ];
  b11.points.forEach(function(p){p.examples.forEach(function(e){e.jp=furigana(e.jp);});});
  delete b11.content;
}

var b12 = ex.babs.find(function(b){return b.bab===12});
if (b12 && b12.content && !b12.points) {
  b12.points = [
    {num:1, title:"Penggunaan Kata Sifat dalam Kalimat", body:"Pola: [Subjek] は [Kata Sifat] です\nい-adj: ubah い menjadi くないです\nな-adj: tambahkan じゃないです", examples:[{jp:"この部屋(へや)は暖(あたた)かいです。",translation:"(Kono heya wa atatakai desu.) \u2014 Ruangan ini hangat."},{jp:"この食(た)べ物(もの)は美味(おい)しくないです。",translation:"(Kono tabemono wa oishikunai desu.) \u2014 Makanan ini tidak enak."},{jp:"このホテルは綺麗(きれい)じゃないです。",translation:"(Kono hoteru wa kirei janai desu.) \u2014 Hotel ini tidak bersih."}], pattern:"Adj です / Adj くないです / Adj じゃないです"},
    {num:2, title:"Pola Perbandingan (比較 - Hikaku)", body:"Pola: A と B と どちらが [Kata Sifat] ですか\nJawaban: [Pilihan] のほうが [Kata Sifat] です", examples:[{jp:"海(うみ)と山(やま)とどちらが好(す)きですか。",translation:"(Umi to yama to dochira ga suki desu ka.) \u2014 Mana yang lebih kamu suka, laut atau gunung?"},{jp:"海(うみ)のほうが好(す)きです。",translation:"(Umi no hou ga suki desu.) \u2014 Saya lebih suka laut."}], pattern:"A と B と どちらが Adj ですか"},
    {num:3, title:"Pola Superlatif (最上級 - Saijoukyuu)", body:"Pola: [Kategori] の中(なか)で [Subjek] が一番(いちばん) [Kata Sifat] です", examples:[{jp:"世界(せか)で日本(にほん)が一番(いちばん)安全(あんぜん)です。",translation:"(Sekai de Nihon ga ichiban anzen desu.) \u2014 Jepang adalah negara paling aman di dunia."}], pattern:"[Kategori] の中で [Subjek] が一番 Adj です"},
    {num:4, title:"Penggunaan 「でも」", body:"「でも」digunakan untuk menyatakan \u201CNamun\u201D atau \u201CTapi\u201D sebagai penghubung antara dua kalimat.", examples:[{jp:"昨日(きのう)は天気(てんき)が良(よ)かったです。でも、今日(きょう)は雨(あめ)が降(ふ)っています。",translation:"(Kinou wa tenki ga yokatta desu. Demo, kyou wa ame ga futteimasu.) \u2014 Kemarin cuacanya bagus. Namun, hari ini hujan."}], pattern:"~ でも ~"},
    {num:5, title:"Ekspresi Terkait Cuaca dan Musim", body:"Pola: どんな [Kata Benda] が [Kata Sifat] ですか", examples:[{jp:"日本(にほん)の夏(なつ)はどんな季節(きせつ)ですか。",translation:"(Nihon no natsu wa donna kisetsu desu ka.) \u2014 Bagaimana musim panas di Jepang?"},{jp:"とても暑(あつ)いです。",translation:"(Totemo atsui desu.) \u2014 Sangat panas."}], pattern:"どんな + Kata Benda が Adj ですか"}
  ];
  b12.points.forEach(function(p){p.examples.forEach(function(e){e.jp=furigana(e.jp);});});
  delete b12.content;
}

var b13 = ex.babs.find(function(b){return b.bab===13});
if (b13 && b13.content && !b13.points) {
  b13.points = [
    {num:1, title:"Ajakan dengan ～ませんか", body:"Digunakan untuk mengajak seseorang melakukan sesuatu secara sopan.\nPola: Verb ませんか", examples:[{jp:"映画(えいが)を見(み)に行(い)きませんか。",translation:"(Eiga o mi ni ikimasen ka.) \u2014 Maukah Anda menonton film?"}], pattern:"Verb ませんか"},
    {num:2, title:"Ajakan dengan ～ましょう", body:"Digunakan untuk menyarankan agar melakukan sesuatu bersama-sama.\nPola: Verb ましょう", examples:[{jp:"一緒(いっしょ)に映画(えいが)を見(み)ましょう。",translation:"(Issho ni eiga o mimashou.) \u2014 Mari kita menonton film bersama."}], pattern:"Verb ましょう"},
    {num:3, title:"Menyatakan Keinginan dengan ～たいです", body:"Menyatakan keinginan untuk melakukan sesuatu.\nPola: Verb ます → Verb たいです\nContoh: 食(た)べます → 食(た)べたいです", examples:[{jp:"日本(にほん)に行(い)きたいです。",translation:"(Nihon ni ikitai desu.) \u2014 Saya ingin pergi ke Jepang."},{jp:"寿司(すし)を食(た)べたいです。",translation:"(Sushi o tabetai desu.) \u2014 Saya ingin makan sushi."}], pattern:"Verb ます → Verb たいです"},
    {num:4, title:"Menyatakan Tujuan dengan ～に 行きます/来ます", body:"Menyatakan tujuan pergi atau datang ke suatu tempat.\nPola: [Tempat] に 行きます/来ます\nPola: [Kegiatan] に 行きます/来ます", examples:[{jp:"図書館(としょかん)に本(ほん)を借(か)りに行(い)きます。",translation:"(Toshokan ni hon o kari ni ikimasu.) \u2014 Saya pergi ke perpustakaan untuk meminjam buku."}], pattern:"[Tempat/Kegiatan] に 行きます/来ます"},
    {num:5, title:"Menyatakan Tujuan dengan ～ために", body:"Menyatakan tujuan atau alasan melakukan sesuatu.\nPola: Verb ます → Verb ます + ために", examples:[{jp:"健康(けんこう)のために入浴(にゅうよく)します。",translation:"(Kenkou no tame ni nyuuyoku shimasu.) \u2014 Saya mandi untuk kesehatan."}], pattern:"Verb ために"}
  ];
  b13.points.forEach(function(p){p.examples.forEach(function(e){e.jp=furigana(e.jp);});});
  delete b13.content;
}

var b14 = ex.babs.find(function(b){return b.bab===14});
if (b14 && b14.content && !b14.points) {
  b14.points = [
    {num:1, title:"Meminta dengan ～て ください", body:"Meminta seseorang melakukan sesuatu.\nPola: Verb て形 + ください", examples:[{jp:"すみません、窓(まど)を開(あ)けて ください。",translation:"(Sumimasen, mado o akete kudasai.) \u2014 Maaf, tolong buka jendela."}], pattern:"Verb て形 + ください"},
    {num:2, title:"Larangan dengan ～ないで ください", body:"Melarang seseorang melakukan sesuatu.\nPola: Verb ない形 + で ください", examples:[{jp:"ここで写真(しゃしん)を撮(と)らないで ください。",translation:"(Koko de shashin o toranaide kudasai.) \u2014 Tolong jangan ambil foto di sini."}], pattern:"Verb ない形 + で ください"},
    {num:3, title:"Progres Aktivitas dengan ～ている", body:"Menyatakan aktivitas yang sedang berlangsung atau keadaan.\nPola: Verb ます → Verb ています", examples:[{jp:"今(いま)、食(た)べています。",translation:"(Ima, tabete imasu.) \u2014 Sekarang sedang makan."}], pattern:"Verb ています"},
    {num:4, title:"Progres Aktivitas dengan ～ていきます / ～てきます", body:"Menyatakan perubahan yang terjadi seiring waktu.\nPola: Verb て形 + いきます/きます", examples:[{jp:"日本語(にほんご)が上手(じょうず)になってきました。",translation:"(Nihongo ga jouzu ni natte kimashita.) \u2014 Bahasa Jepang saya mulai membaik."}], pattern:"Verb て形 + いきます/きます"},
    {num:5, title:"Meminta Bantuan dengan ～て もらえますか", body:"Meminta bantuan dengan lebih sopan.\nPola: Verb て形 + もらえますか", examples:[{jp:"これを見(み)て もらえますか。",translation:"(Kore o mite moraemasu ka.) \u2014 Bisa tolong lihat ini?"}], pattern:"Verb て形 + もらえますか"}
  ];
  b14.points.forEach(function(p){p.examples.forEach(function(e){e.jp=furigana(e.jp);});});
  delete b14.content;
}

var b15 = ex.babs.find(function(b){return b.bab===15});
if (b15 && b15.content && !b15.points) {
  b15.points = [
    {num:1, title:"Bentuk て untuk Kebiasaan", body:"Menggunakan bentuk て untuk menyatakan kebiasaan atau rutinitas.\nPola: Verb て形 + います (kebiasaan)", examples:[{jp:"毎朝(まいあさ)ジョギングをしています。",translation:"(Maiasa jogingu o shite imasu.) \u2014 Setiap pagi saya berolahraga lari."}], pattern:"Verb ています (kebiasaan)"},
    {num:2, title:"Bentuk て untuk Durasi Waktu", body:"Menyatakan durasi waktu suatu aktivitas.\nPola: [Waktu] + Verb て形 + います", examples:[{jp:"30分(さんじゅっぷん)泳(およ)いでいます。",translation:"(Sanjuppun oyoide imasu.) \u2014 Sudah berenang selama 30 menit."}], pattern:"[Waktu] + Verb ています"},
    {num:3, title:"Bentuk て untuk Urutan Kejadian", body:"Menyatakan urutan beberapa kejadian atau aktivitas.\nPola: Verb1 て形、Verb2", examples:[{jp:"朝(あさ)起(お)きて、顔(かお)を洗(あら)って、歯(は)を磨(みが)きます。",translation:"(Asa okite, kao o aratte, ha o migakimasu.) \u2014 Setelah bangun, cuci muka, lalu gosok gigi."}], pattern:"Verb1 て形、Verb2"},
    {num:4, title:"Bentuk て untuk Alasan", body:"Menyatakan alasan atau sebab dari suatu kondisi.\nPola: Verb て形 + いる (kondisi)", examples:[{jp:"疲(つか)れていて、寝(ね)たいです。",translation:"(Tsukareteite, netai desu.) \u2014 Saya lelah dan ingin tidur."}], pattern:"Verb て形 + いる (kondisi)"},
    {num:5, title:"Bentuk て untuk Permintaan Sopan", body:"Meminta seseorang melakukan sesuatu dengan lebih sopan.\nPola: Verb て形 + もらえますか / Verb て形 + いただけますか", examples:[{jp:"すみません、これを見(み)て いただけますか。",translation:"(Sumimasen, kore o mite itadakemasu ka.) \u2014 Maaf, bisa tolong lihat ini?"}], pattern:"Verb て形 + もらえますか / いただけますか"}
  ];
  b15.points.forEach(function(p){p.examples.forEach(function(e){e.jp=furigana(e.jp);});});
  delete b15.content;
}

ex.babs.forEach(function(b) {
  if (b.points) {
    b.points.forEach(function(p) {
      p.examples.forEach(function(e) {
        e.jp = furigana(e.jp);
      });
      p.pattern = furigana(p.pattern || "");
    });
  }
});

fs.writeFileSync(OUT, JSON.stringify(ex, null, 2), "utf8");
console.log("Done! Restructured babs 11-15.");
[11,12,13,14,15].forEach(function(n) {
  var b = ex.babs.find(function(x){return x.bab===n;});
  if (b) console.log("BAB "+b.bab+": "+b.points.length+" points");
});