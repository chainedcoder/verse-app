const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'app/admin-table.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Fix Border Radii to match site styles (8px and 12px)
css = css.replace(/border-radius:\s*4px;/g, 'border-radius: 8px;');
css = css.replace(/border-radius:\s*6px;/g, 'border-radius: 12px;');

// 2. Add Accent Color awareness
// Focus rings on inputs/selects
css = css.replace(/border-color:\s*var\(--border-secondary\);\s*}/g, 'border-color: var(--accent);\n}');
// Active tab indicator (assuming there's a border-bottom or color for active tabs)
css = css.replace(/\.adt-tab--active\s*\{\s*color:\s*var\(--text-primary\);\s*border-bottom:\s*2px\s*solid\s*var\(--text-primary\);\s*\}/, '.adt-tab--active {\n  color: var(--accent);\n  border-bottom: 2px solid var(--accent);\n}');

fs.writeFileSync(cssPath, css);
console.log('Successfully updated radii and accents');
