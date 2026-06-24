const fs = require('fs');

let composer = fs.readFileSync('components/admin/CollectionComposer.tsx', 'utf8');
// Fix "Cannot find name 'theme'." Replace `theme` with `'theme'` or just fix it?
composer = composer.replace(/className={theme\./g, 'className={`theme.');
// Let's just sed it.
