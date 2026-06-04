const fs = require('fs');

const fontEmbedCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
`;

const fontOptions = `, fontEmbedCSS: \`${fontEmbedCSS}\``;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace toJpeg calls
  content = content.replace(/toJpeg\(node, \{ quality: ([0-9.]+), backgroundColor: (.*?)\s*\}\)/g, `toJpeg(node, { quality: $1, backgroundColor: $2, fontEmbedCSS: \`\n@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');\n\` })`);
  
  // Replace toSvg calls
  content = content.replace(/toSvg\(node, \{ backgroundColor: (.*?)\s*\}\)/g, `toSvg(node, { backgroundColor: $1, fontEmbedCSS: \`\n@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');\n\` })`);

  fs.writeFileSync(filePath, content);
}

fixFile('components/ExportPageClient.jsx');
fixFile('components/ExportModal.jsx');

// Fix ExportEngine.jsx layout
let engine = fs.readFileSync('components/ExportEngine.jsx', 'utf8');
// Remove flex: 1
engine = engine.replace(/flex: 1 \}\}>/g, '}}>');
engine = engine.replace(/flex: 1 \}\}>/g, '}}>');

// Increase font sizes
// siteview title: width * 0.042 -> 0.06
engine = engine.replace(/Math\.max\(32, width \* 0\.042\)/g, 'Math.max(42, width * 0.06)');
// siteview text: width * 0.02 -> 0.035
engine = engine.replace(/Math\.max\(20, width \* 0\.02\)/g, 'Math.max(28, width * 0.035)');
// author: 0.022 -> 0.028
engine = engine.replace(/Math\.max\(16, width \* 0\.022\)/g, 'Math.max(20, width * 0.028)');

// minimal title: 0.052 -> 0.065
engine = engine.replace(/Math\.max\(40, width \* 0\.052\)/g, 'Math.max(48, width * 0.065)');
// minimal text: 0.03 -> 0.038
engine = engine.replace(/Math\.max\(24, width \* 0\.03\)/g, 'Math.max(28, width * 0.038)');

// love title: 0.066 -> 0.08
engine = engine.replace(/Math\.max\(50, width \* 0\.066\)/g, 'Math.max(56, width * 0.08)');
// love text: 0.03 -> 0.04
engine = engine.replace(/Math\.max\(24, width \* 0\.03\)/g, 'Math.max(28, width * 0.04)');

// story title: 0.046 -> 0.06
engine = engine.replace(/Math\.max\(36, width \* 0\.046\)/g, 'Math.max(44, width * 0.06)');
// story text: 0.032 -> 0.04
engine = engine.replace(/Math\.max\(24, width \* 0\.032\)/g, 'Math.max(28, width * 0.04)');

fs.writeFileSync('components/ExportEngine.jsx', engine);
console.log('Fixed export engine and rendering options.');
