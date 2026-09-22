const fs = require('fs');
const path = require('path');
const INPUT = path.join(__dirname, '..', 'data', 'database', 'bunpou-n5.json');
const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

function fix(text) {
  // Fix wrong readings
  text = text.replace(/アメリカ人\(ひと\)/g, 'アメリカ人(あめりかじん)');
  // Fix bad splits from previous run: kanji(r) -> word(r)
  text = text.replace(/行\(こう\)きます\(いきます\)/g, '行きます(いきます)');
  text = text.replace(/行\(こう\)きます/g, '行きます(いきます)');
  text = text.replace(/来\(らい\)ました/g, '来ました(きました)');
  text = text.replace(/日\(ひ\)本\(にほん\)/g, '日本(にほん)');
  text = text.replace(/日\(ひ\)米\(こめ\)/g, '日米(にちべい)');
  text = text.replace(/電\(でん\)気\(き\)/g, '電気(でんき)');
  text = text.replace(/甲\(こう\)子\(こ\)園/g, '甲子園(こうしえん)');
  text = text.replace(/普\(ふ\)通\(つう\)/g, '普通(ふつう)');
  text = text.replace(/何\(なん\)時\(なんじ\)/g, '何時(なんじ)');
  text = text.replace(/日\(ひ\)曜日\(にちようび\)/g, '日曜日(にちようび)');
  text = text.replace(/月\(つき\)曜日\(げつようび\)/g, '月曜日(げつようび)');
  text = text.replace(/土\(つち\)曜日\(どようび\)/g, '土曜日(どようび)');
  text = text.replace(/大\(おお\)阪\(おおさか\)/g, '大阪(おおさか)');
  text = text.replace(/山\(やま\)田\(やまだ\)/g, '山田(やまだ)');
  text = text.replace(/北海\(うみ\)道\(ほっかいどう\)/g, '北海道(ほっかいどう)');
  text = text.replace(/大\(おお\)変\(たいへん\)/g, '大変(たいへん)');
  text = text.replace(/電\(でん\)話\(でんわ\)番号\(でんわばんごう\)/g, '電話番号(でんわばんごう)');
  text = text.replace(/電\(でん\)話\(でんわ\)/g, '電話(でんわ)');
  text = text.replace(/勉\(べん\)強\(きょう\)します/g, '勉強します(べんきょうします)');
  text = text.replace(/勉\(べん\)強\(きょう\)/g, '勉強(べんきょう)');
  text = text.replace(/会\(かい\)社\(しゃ\)員\(いん\)/g, '会社員(かいしゃいん)');
  text = text.replace(/会\(かい\)社\(しゃ\)/g, '会社(かいしゃ)');
  text = text.replace(/学\(がく\)生\(せい\)/g, '学生(がくせい)');
  text = text.replace(/先\(せん\)生\(せい\)/g, '先生(せんせい)');
  text = text.replace(/銀\(ぎん\)行\(こう\)/g, '銀行(ぎんこう)');
  text = text.replace(/写\(しゃ\)真\(しん\)/g, '写真(しゃしん)');
  text = text.replace(/休\(やす\)みは/g, '休みは(やすみは)');
  text = text.replace(/休\(やす\)/g, '休み(やすみ)');
  text = text.replace(/行\(こう\)/g, '行きます(いきます)');
  text = text.replace(/来\(らい\)/g, '来ます(きます)');
  text = text.replace(/帰\(かえ\)/g, '帰ります(かえります)');
  text = text.replace(/働\(はたら\)/g, '働きます(はたらきます)');
  text = text.replace(/駅\(えき\)/g, '駅(えき)');
  text = text.replace(/時\(とき\)/g, '時(とき)');
  // Fix embedded readings (bare kanji + hiragana as reading hint)
  text = text.replace(/飲のむ/g, '飲(の)む');
  text = text.replace(/飲のみません/g, '飲(の)みません');
  text = text.replace(/住すんでいた/g, '住(す)んでいた');
  text = text.replace(/作つくった/g, '作(つく)った');
  text = text.replace(/道みちを/g, '道(みち)を');
  text = text.replace(/渡わたります/g, '渡(わた)ります');
  text = text.replace(/払はらう/g, '払(はら)う');
  text = text.replace(/25歳さい/g, '25歳(さい)');
  // Fix bare kanji examples
  if (text === '[わたしは] カリナさんに CDを 借りました。') {
    text = '[わたしは] カリナさんに CDを 借りました(かりました)。';
  }
  if (text === 'わたしは 車が あります。') {
    text = 'わたしは 車(くるま)が あります。';
  }
  if (text === '疲れていて、寝たいです。') {
    text = '疲(つか)れていて、寝(ね)たいです。';
  }
  if (text === 'コーヒーを 飲む？ ……うん、飲む。') {
    text = 'コーヒーを 飲(の)む？ ……うん、飲(の)む。';
  }
  // Fix duplicate readings
  text = text.replace(/\(([^)]+)\)\(\1\)/g, '($1)');
  return text;
}

let count = 0;
for (const bab of data.babs) {
  for (const point of bab.points) {
    if (!point.examples) continue;
    for (const ex of point.examples) {
      const fixed = fix(ex.jp);
      if (fixed !== ex.jp) {
        ex.jp = fixed;
        count++;
      }
    }
  }
}

fs.writeFileSync(INPUT, JSON.stringify(data, null, 2), 'utf-8');
console.log('Fixed', count, 'entries');
