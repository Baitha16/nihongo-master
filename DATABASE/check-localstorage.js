const fs = require('fs');
const js = fs.readFileSync('D:/Github/Belajar Jepang/js/app.js', 'utf8');
console.log('app.js lines: ' + js.split('\n').length);

const regex = /localStorage\.\w+\(['"]([^'"]+)['"]/g;
const keys = new Set();
let m;
while ((m = regex.exec(js)) !== null) {
  keys.add(m[1]);
}
console.log('localStorage keys (' + keys.size + '):');
keys.forEach(k => console.log('  ' + k));
