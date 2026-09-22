const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const DATABASE_DIR = path.join(__dirname, '..', 'DATABASE');
const OUTPUT_DIR = path.join(__dirname, '..', 'DATABASE');

async function extractDocxHtml(filename) {
  const filePath = path.join(DATABASE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filename}`);
    return null;
  }
  const result = await mammoth.convertToHtml({ path: filePath });
  return result.value;
}

async function main() {
  const file = '3. KOTOBA MASTER N5 (Updated) - donihongo_removed.docx';
  console.log(`Extracting as HTML: ${file}`);
  const html = await extractDocxHtml(file);
  
  const outPath = path.join(OUTPUT_DIR, 'kotoba-n5-raw.html');
  fs.writeFileSync(outPath, html);
  console.log(`Saved to kotoba-n5-raw.html (${html.length} bytes)`);
  
  console.log('\n--- First 5000 chars of HTML ---');
  console.log(html.substring(0, 5000));
}

main().catch(console.error);
