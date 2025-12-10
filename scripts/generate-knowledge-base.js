const fs = require('fs');
const path = require('path');

const faqDir = path.join(__dirname, '../faqs');
const outputDir = path.join(__dirname, '../src/consts');
const outputFile = path.join(outputDir, 'knowledge-base.ts');

const filesToRead = [
  'data_products.txt',
  'ecocash_plus.txt',
  'ecosure_zesa.txt',
  'ecocash_junior.txt',
  'econet_knowledgebase.txt',
  'ecosure_claims.txt',
  'ecosure_diaspora.txt'
];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let combinedContent = '';

filesToRead.forEach(file => {
  const filePath = path.join(faqDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`Reading ${file}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const sectionTitle = file.replace('.txt', '').replace(/_/g, ' ').toUpperCase();
    combinedContent += `\n\n# ${sectionTitle}\n\n${content}`;
  } else {
    console.warn(`Warning: File not found: ${file}`);
  }
});

// Escape backticks to avoid breaking the template literal
const escapedContent = combinedContent.replace(/`/g, '\\`');

const fileContent = `export const KNOWLEDGE_BASE = \`
${escapedContent}
\`;
`;

fs.writeFileSync(outputFile, fileContent);
console.log(`Successfully generated ${outputFile}`);
