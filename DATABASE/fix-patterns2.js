const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/Github/Belajar Jepang/data/database/bunpou-n5.json','utf8'));

// Fix all remaining broken patterns with correct text
const fixes = [
  { bab: 7, pt: 3, pattern: "～が + ～ (Tetapi) = ...tetapi..." },
  { bab: 11, pt: 3, pattern: "A + と + B + と + どちらが + Kata Sifat = ...atau...yang lebih...?" },
  { bab: 12, pt: 1, pattern: "Kata Kerja (Bentuk ます) + たいです = Saya ingin...lakukan" },
  { bab: 16, pt: 0, pattern: "Kata Kerja (Bentuk ない) = Tidak...lakukan" },
  { bab: 16, pt: 2, pattern: "Kata Kerja + なければ なりません = Harus..." },
  { bab: 18, pt: 0, pattern: "Kata Kerja (Bentuk た形) = Bentuk lampau" },
  { bab: 20, pt: 6, pattern: "Kata Kerja (Bentuk ない) + ないと…… = Harus...!" },
  { bab: 21, pt: 0, pattern: "Kata Kerja (Bentuk た) + 人 / 物 / 場所 = ...yang..." },
  { bab: 21, pt: 2, pattern: "Kata Kerja (Bentuk て) + いる = Sedang.../ ...sudah..." },
  { bab: 1, pt: 0, pattern: "Kata Benda + です = ...adalah" },
  { bab: 1, pt: 1, pattern: "Kata Benda₁ + は + Kata Benda₂ + じゃ (では) ありません = ...bukan" },
  { bab: 1, pt: 3, pattern: "～か + ～か = ...atau...?" },
  { bab: 1, pt: 5, pattern: "Kata Benda + の (pengganti) = ...punya" },
  { bab: 2, pt: 0, pattern: "ここ / そこ / あそこ + は + ～です = Di sini/Di sana..." },
  { bab: 4, pt: 2, pattern: "Kata Benda (Kendaraan) + で + Kata Kerja = Dengan...,...lakukan" },
];

fixes.forEach(f => {
  data.babs[f.bab].points[f.pt].pattern = f.pattern;
});

fs.writeFileSync('D:/Github/Belajar Jepang/data/database/bunpou-n5.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed!');

// Final verify
let issues = 0;
data.babs.forEach(b => {
  b.points.forEach(p => {
    const bad = ['ケロムド','てとも','形にます','形ない','形た形','形た)','形て)','PrintWriter','どっちらが'];
    if (bad.some(w => p.pattern.includes(w))) {
      console.log('STILL BAD: Bab' + b.bab + ' P' + p.num + ': ' + p.pattern);
      issues++;
    }
  });
});
if (!issues) console.log('All patterns clean!');
