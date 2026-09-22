const fs = require('fs');
const path = require('path');
const INPUT = path.join(__dirname, '..', 'data', 'database', 'bunpou-n5.json');
const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

let count = 0;

for (const bab of data.babs) {
  for (const point of bab.points) {
    if (!point.examples) continue;
    for (const ex of point.examples) {
      let jp = ex.jp;
      const orig = jp;

      // Fix 1: Remove duplicate readings: word(r)(r) -> word(r)
      jp = jp.replace(/\(([^)]+)\)\(\1\)/g, '($1)');

      // Fix 2: Remove duplicate readings with same content: word(rl)(rl) -> word(rl)
      jp = jp.replace(/\(([^)]+)\)\(\1\)/g, '($1)');

      // Fix 3: word(r)reading -> word(reading) (embedded reading after furigana)
      jp = jp.replace(/趣味\(しゅみ\)しゅみ/g, '趣味(しゅみ)');
      jp = jp.replace(/音楽\(おんがく\)おんがく/g, '音楽(おんがく)');
      jp = jp.replace(/仕事\(しごと\)しごと/g, '仕事(しごと)');
      jp = jp.replace(/友達\(ともだち\)ともだち/g, '友達(ともだち)');
      jp = jp.replace(/約束\(やくそく\)やくそく/g, '約束(やくそく)');
      jp = jp.replace(/荷物\(にもつ\)にもつ/g, '荷物(にもつ)');
      jp = jp.replace(/空港\(くうこう\)くうこう/g, '空港(くうこう)');
      jp = jp.replace(/北海道\(ほっかいどう\)ほっかいどう/g, '北海道(ほっかいどう)');
      jp = jp.replace(/昼\(ひる\)ひるごはん/g, '昼ご飯(ひるごはん)');

      // Fix 4: Fix split compound words
      jp = jp.replace(/食\(た\)べる\(たべる\)べました/g, '食べました(たべました)');
      jp = jp.replace(/食\(た\)べる\(たべる\)べます/g, '食べます(たべます)');
      jp = jp.replace(/食\(た\)べ物\(もの\)/g, '食べ物(たべもの)');
      jp = jp.replace(/食\(た\)べて/g, '食べて(たべて)');
      jp = jp.replace(/食\(た\)べた/g, '食べた(たべた)');
      jp = jp.replace(/食\(た\)べません/g, '食べません(たべません)');
      jp = jp.replace(/食\(た\)べました/g, '食べました(たべました)');
      jp = jp.replace(/食\(た\)べましたか/g, '食べましたか(たべましたか)');

      jp = jp.replace(/寝\(ね\)る/g, '寝る(ねる)');
      jp = jp.replace(/起\(お\)きて/g, '起きて(おきて)');
      jp = jp.replace(/洗\(あら\)って/g, '洗って(あらって)');
      jp = jp.replace(/磨\(みが\)きます/g, '磨きます(みがきます)');
      jp = jp.replace(/開\(あ\)けて/g, '開けて(あけて)');
      jp = jp.replace(/貸\(か\)しました/g, '貸しました(かしました)');
      jp = jp.replace(/借\(かり\)りました/g, '借りました(かりました)');

      jp = jp.replace(/使\(つか\)いません/g, '使いません(つかいません)');
      jp = jp.replace(/使\(つか\)います/g, '使います(つかいます)');

      jp = jp.replace(/思\(おも\)います/g, '思います(おもいます)');
      jp = jp.replace(/思\(おも\)いますか/g, '思いますか(おもいますか)');

      jp = jp.replace(/聞\(き\)いて/g, '聞いて(きいて)');

      jp = jp.replace(/暮\(くら\)れます/g, '暮れます(くれます)');

      jp = jp.replace(/暮\(くら\)し/g, '暮らし(くらし)');

      jp = jp.replace(/知\(し\)っています/g, '知っています(しっています)');

      // Fix 5: Remove trailing bare reading text after furigana
      // Pattern: 飲みます(のみます)く -> 飲みます(いきます) is wrong, just clean trailing
      jp = jp.replace(/行きます\(いきます\)く/g, '行きます(いきます)');

      if (jp !== orig) {
        ex.jp = jp;
        count++;
      }
    }
  }
}

fs.writeFileSync(INPUT, JSON.stringify(data, null, 2), 'utf-8');
console.log('Cleaned up', count, 'entries');
