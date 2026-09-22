const fs = require('fs');
const path = require('path');

const romajiMap = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
  'しゃ':'sha','しゅ':'shu','しょ':'sho',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
  'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
  'みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
  'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'ja','じゅ':'ju','じょ':'jo',
  'びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  'っ':'',
  'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
  'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
  'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
  'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
  'ヤ':'ya','ユ':'yu','ヨ':'yo',
  'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
  'ワ':'wa','ヲ':'wo','ン':'n',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
  'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'ダ':'da','デ':'de','ド':'do',
  'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
  'キャ':'kya','キュ':'kyu','キョ':'kyo',
  'シャ':'sha','シュ':'shu','ショ':'sho',
  'チャ':'cha','チュ':'chu','チョ':'cho',
  'ニャ':'nya','ニュ':'nyu','ニョ':'nyo',
  'リャ':'rya','リュ':'ryu','リョ':'ryo',
  'ジャ':'ja','ジュ':'ju','ジョ':'jo'
};

function toRomaji(text) {
  if (/^[a-zA-Z\s]+$/.test(text)) return text;
  let r='',i=0;
  while(i<text.length){
    if(i+2<text.length&&romajiMap[text.substring(i,i+3)]){r+=romajiMap[text.substring(i,i+3)];i+=3;continue;}
    if(i+1<text.length&&romajiMap[text.substring(i,i+2)]){r+=romajiMap[text.substring(i,i+2)];i+=2;continue;}
    const c=text[i];
    if(c==='っ'||c==='ッ'){if(i+1<text.length){const nr=romajiMap[text[i+1]];if(nr)r+=nr[0];}}
    else{r+=romajiMap[c]||c;}
    i++;
  }
  return r;
}

function cap(s){return s?s[0].toUpperCase()+s.slice(1):s;}

function cleanMeaning(m){
  return m.replace(/\s+/g,' ').replace(/[,\s]+$/,'').trim();
}

function hasKanji(s){return /[\u4E00-\u9FFF]/.test(s);}
function isJP(s){return s&&/^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\s～]+$/.test(s);}
function isNum(s){return /^\d+$/.test(s);}

function genOpts(correct,all){
  const wrong=all.filter(m=>m!==correct).sort(()=>0.5-Math.random());
  const opts=[];
  for(const m of wrong){if(opts.length>=3)break;if(!opts.includes(m))opts.push(m);}
  if(opts.length<3){const rest=all.filter(m=>m!==correct&&!opts.includes(m)).sort(()=>0.5-Math.random());for(const m of rest){if(opts.length>=3)break;opts.push(m);}}
  return opts.slice(0,3);
}

// ===== PROCESS VERBS =====
function processVerbs(){
  const raw=fs.readFileSync(path.join(process.env.USERPROFILE,'AppData','Local','Temp','opencode','kerja_n4_extracted.txt'),'utf8');
  const lines=raw.split('\n').map(l=>l.trim());
  const verbs=[];
  let i=0;
  while(i<lines.length){
    if(isNum(lines[i])){
      let meaning=[],j=i+1;
      // Collect meaning until we hit Japanese
      while(j<lines.length&&!isJP(lines[j])){if(lines[j]&&!isNum(lines[j]))meaning.push(lines[j]);j++;}
      // Now collect Japanese (may be split)
      let jp='';
      while(j<lines.length&&isJP(lines[j])&&!hasKanji(lines[j])){jp+=lines[j];j++;}
      // Collect kanji
      let kn='';
      if(j<lines.length&&isJP(lines[j])&&hasKanji(lines[j])){kn=lines[j];j++;}
      if(!kn)kn=jp;
      const m=cleanMeaning(meaning.join(' '));
      if(jp&&m)verbs.push({japanese:jp,kanji:kn,meaning:m});
    }
    i++;
  }
  return verbs;
}

// ===== PROCESS NOUNS =====
function processNouns(){
  const raw=fs.readFileSync(path.join(process.env.USERPROFILE,'AppData','Local','Temp','opencode','minna_extracted.txt'),'utf8');
  const lines=raw.split('\n').map(l=>l.trim());
  const words=[];
  let i=0;
  while(i<lines.length){
    if(isNum(lines[i])){
      let jp='',meaning=[],j=i+1;
      while(j<lines.length&&j<i+5){if(isJP(lines[j])){jp=lines[j];j++;break;}j++;}
      while(j<lines.length){
        if(isNum(lines[j]))break;
        if(!isJP(lines[j])&&lines[j])meaning.push(lines[j]);
        j++;
      }
      const m=cleanMeaning(meaning.join(' '));
      if(jp&&m)words.push({japanese:jp,kanji:jp,meaning:m});
    }
    i++;
  }
  return words;
}

// ===== PROCESS ADJECTIVES =====
function processAdjectives(){
  const raw=fs.readFileSync(path.join(process.env.USERPROFILE,'AppData','Local','Temp','opencode','sifat_extracted.txt'),'utf8');
  const lines=raw.split('\n').map(l=>l.trim());
  const adj=[];
  let i=0;
  while(i<lines.length){
    if(isNum(lines[i])){
      let meaning=[],j=i+1;
      while(j<lines.length&&!isJP(lines[j])){if(lines[j]&&!isNum(lines[j]))meaning.push(lines[j]);j++;}
      let jp='';
      while(j<lines.length&&isJP(lines[j])&&!hasKanji(lines[j])){jp+=lines[j];j++;}
      let kn='';
      if(j<lines.length&&isJP(lines[j])&&hasKanji(lines[j])){kn=lines[j];j++;}
      if(!kn)kn=jp;
      const m=cleanMeaning(meaning.join(' '));
      if(jp&&m)adj.push({japanese:jp,kanji:kn,meaning:m});
    }
    i++;
  }
  return adj;
}

function createQ(items){
  const all=items.map(x=>x.meaning);
  return items.map((x,idx)=>{
    const wrong=genOpts(x.meaning,all);
    const opts=wrong.map(cap);
    const ci=Math.floor(Math.random()*4);
    opts.splice(ci,0,cap(x.meaning));
    return{id:idx+1,kanji:x.kanji,reading:x.japanese,romaji:toRomaji(x.japanese),meaning:cap(x.meaning),options:opts,correctIndex:ci};
  });
}

function createLevels(qs){
  const lvls=[];
  for(let i=0;i<qs.length;i+=50)lvls.push({level:lvls.length+1,questions:qs.slice(i,i+50)});
  return lvls;
}

// ===== MAIN =====
console.log('Processing...\n');
const nouns=processNouns();
const verbs=processVerbs();
const adj=processAdjectives();
console.log(`Nouns: ${nouns.length}, Verbs: ${verbs.length}, Adjectives: ${adj.length}`);

const nq=createQ(nouns),vq=createQ(verbs),aq=createQ(adj);

fs.writeFileSync(path.join(__dirname,'..','data','nouns.json'),JSON.stringify({category:"Kata Benda",categoryJapanese:"名詞",categoryRomaji:"Meishi",levels:createLevels(nq)},null,2),'utf8');
fs.writeFileSync(path.join(__dirname,'..','data','verbs.json'),JSON.stringify({category:"Kata Kerja",categoryJapanese:"動詞",categoryRomaji:"Doushi",levels:createLevels(vq)},null,2),'utf8');
fs.writeFileSync(path.join(__dirname,'..','data','adjectives.json'),JSON.stringify({category:"Kata Sifat",categoryJapanese:"形容詞",categoryRomaji:"Keiyoushi",levels:createLevels(aq)},null,2),'utf8');

console.log(`Saved: Nouns ${nq.length}, Verbs ${vq.length}, Adjectives ${aq.length}`);

// ===== CHECKS =====
console.log('\n===== CHECKS =====');
const checks=['いる','ある','まつ','ひく','よむ','きく','つく','つかう','ひっぱる','とうちゃくする'];
checks.forEach(w=>{
  const v=vq.filter(q=>q.reading===w);
  if(v.length)v.forEach(x=>console.log(`✓ ${x.reading}: ${x.meaning} [${x.kanji}]`));
  else console.log(`✗ ${w}: NOT FOUND`);
});

console.log('\nSingle char readings:');
vq.filter(q=>q.reading.length<=1).forEach(q=>console.log(`  ${q.reading}: ${q.meaning}`));
