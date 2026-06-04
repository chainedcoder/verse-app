const fs = require('fs');

let engine = fs.readFileSync('components/ExportEngine.jsx', 'utf8');

// 1. Remove mobile preset
engine = engine.replace(/,\s*\{\s*id:\s*"mobile".*?\}/g, '');

// 2. Change minHeight to height, and add overflow and justifyContent
engine = engine.replace(/minHeight: height \? `\$\{height\}px` : 'auto',/g, 
`height: height ? \`\${height}px\` : 'auto',
    overflow: "hidden",
    justifyContent: "center",`);

// 3. Fix h1 colors missing in minimal/dark/story
// Minimal/dark h1
engine = engine.replace(/<h1 style=\{\{\s*fontSize: `\$\{Math.max\(48/g, 
`<h1 style={{ color: c.text, fontSize: \`\${Math.max(48`);

// Story h1
engine = engine.replace(/<h1 style=\{\{\s*fontSize: `\$\{Math.max\(44/g, 
`<h1 style={{ color: c.text, fontSize: \`\${Math.max(44`);

fs.writeFileSync('components/ExportEngine.jsx', engine);
console.log('Fixed ExportEngine.jsx');
