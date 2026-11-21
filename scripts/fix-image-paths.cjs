const fs = require('fs');
const path = require('path');

const MONTH_FILE = path.join(__dirname, '../public/data/months/2025-12.json');

console.log(`Processing ${MONTH_FILE}...`);
let rawData = fs.readFileSync(MONTH_FILE, 'utf8');

// Replace absolute paths with relative paths
// We are looking for "/assets/images/extracted/" and replacing it with "assets/images/extracted/"
const fixedData = rawData.replace(/\/assets\/images\/extracted\//g, 'assets/images/extracted/');

fs.writeFileSync(MONTH_FILE, fixedData);
console.log('Done! Image paths updated.');
