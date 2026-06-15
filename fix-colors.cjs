const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'app/admin-table.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace Text Colors
css = css.replace(/color:\s*#ededed\s*!important;/g, 'color: var(--text-primary) !important;');
css = css.replace(/color:\s*#ededed;/g, 'color: var(--text-primary);');
css = css.replace(/color:\s*#fff;/g, 'color: var(--text-primary);');
css = css.replace(/color:\s*#888;/g, 'color: var(--text-secondary);');
css = css.replace(/color:\s*#a1a1aa;/g, 'color: var(--text-secondary);');

// Replace Backgrounds
css = css.replace(/background:\s*#111;/g, 'background: var(--bg-card);');
css = css.replace(/background:\s*#1a1a1a;/g, 'background: var(--bg-card);');
css = css.replace(/background:\s*#fff;/g, 'background: var(--bg-card);');
css = css.replace(/background:\s*#000;/g, 'background: var(--bg-primary);');

css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.02\);/g, 'background: var(--bg-secondary);');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\);/g, 'background: var(--bg-secondary);');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.05\);/g, 'background: var(--bg-card-hover);');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.06\)\s*!important;/g, 'background: var(--bg-card-hover) !important;');

// Replace Borders
css = css.replace(/border-color:\s*#fff;/g, 'border-color: var(--border-primary);');
css = css.replace(/border:\s*solid\s*#000;/g, 'border: solid var(--border-primary);');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/g, 'border: 1px solid var(--border-primary);');
css = css.replace(/border-left:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/g, 'border-left: 1px solid var(--border-primary);');
css = css.replace(/border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/g, 'border-bottom: 1px solid var(--border-primary);');
css = css.replace(/border-bottom:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.05\);/g, 'border-bottom: 1px solid var(--border-secondary);');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.3\);/g, 'border: 1px solid var(--border-secondary);');
css = css.replace(/border-color:\s*rgba\(255,\s*255,\s*255,\s*0\.3\);/g, 'border-color: var(--border-secondary);');
css = css.replace(/border-color:\s*rgba\(255,\s*255,\s*255,\s*0\.4\);/g, 'border-color: var(--border-primary);');
css = css.replace(/border-color:\s*rgba\(255,\s*255,\s*255,\s*0\.6\);/g, 'border-color: var(--text-secondary);');

// Replace Box-Shadows
css = css.replace(/box-shadow:\s*inset\s*2px\s*0\s*0\s*#fff;/g, 'box-shadow: inset 2px 0 0 var(--text-primary);');

// Replace SVG background for select/caret to use currentColor or var(--text-secondary)
// SVG fill='%23888'
css = css.replace(/stroke='%23888'/g, "stroke='currentColor'");

// Add Role Menu Styles
const roleMenuStyles = `
/* ── Role Menu Dropdown ── */
.adt-role-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 4px;
  box-shadow: var(--shadow-md);
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.adt-role-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.adt-role-option:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.adt-role-option--active {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
}
`;

css += '\n' + roleMenuStyles;

fs.writeFileSync(cssPath, css);
console.log('Successfully updated admin-table.css');
