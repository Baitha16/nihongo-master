const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const DATABASE_DIR = path.join(__dirname, '..', 'DATABASE');

async function extractPDF(filename) {
  const filePath = path.join(DATABASE_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filename}`);
    return null;
  }
  
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  
  return {
    filename: filename,
    pages: data.numpages,
    text: data.text
  };
}

async function listPDFs() {
  const files = fs.readdirSync(DATABASE_DIR).filter(f => f.endsWith('.pdf'));
  console.log('PDF files found:');
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    const files = await listPDFs();
    console.log('\nUsage:');
    console.log('  node scripts/extract-pdf.js <filename.pdf>     - Extract one PDF');
    console.log('  node scripts/extract-pdf.js all               - Extract all PDFs');
    console.log('  node scripts/extract-pdf.js list              - List PDF files');
    return;
  }
  
  if (args[0] === 'list') {
    await listPDFs();
    return;
  }
  
  if (args[0] === 'all') {
    const files = await listPDFs();
    for (const file of files) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Extracting: ${file}`);
      console.log('='.repeat(60));
      const result = await extractPDF(file);
      if (result) {
        const outFile = file.replace('.pdf', '.txt');
        const outPath = path.join(DATABASE_DIR, outFile);
        fs.writeFileSync(outPath, result.text);
        console.log(`Saved to: ${outFile}`);
        console.log(`Pages: ${result.pages}`);
        console.log(`Preview (first 500 chars):\n${result.text.substring(0, 500)}`);
      }
    }
    return;
  }
  
  const filename = args[0];
  console.log(`Extracting: ${filename}`);
  const result = await extractPDF(filename);
  if (result) {
    const outFile = filename.replace('.pdf', '.txt');
    const outPath = path.join(DATABASE_DIR, outFile);
    fs.writeFileSync(outPath, result.text);
    console.log(`Saved to: ${outFile}`);
    console.log(`Pages: ${result.pages}`);
    console.log(`Preview (first 1000 chars):\n${result.text.substring(0, 1000)}`);
  }
}

main().catch(console.error);
