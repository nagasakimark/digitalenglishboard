// Migration script to split board-content.json into monthly files
// Run with: node scripts/migrate-to-monthly-files.js

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');
const monthsDir = path.join(dataDir, 'months');

// Read the current board-content.json
const boardDataPath = path.join(dataDir, 'board-content.json');
const boardData = JSON.parse(fs.readFileSync(boardDataPath, 'utf8'));

// Create months directory if it doesn't exist
if (!fs.existsSync(monthsDir)) {
  fs.mkdirSync(monthsDir, { recursive: true });
}

// Extract tags
const tags = boardData.tags || [];
fs.writeFileSync(
  path.join(dataDir, 'tags.json'),
  JSON.stringify(tags, null, 2)
);
console.log('✓ Created tags.json');

// Split months into separate files
const months = boardData.months || {};
Object.keys(months).forEach(monthKey => {
  const monthData = months[monthKey];
  const monthFilePath = path.join(monthsDir, `${monthKey}.json`);
  
  fs.writeFileSync(
    monthFilePath,
    JSON.stringify(monthData, null, 2)
  );
  
  console.log(`✓ Created ${monthKey}.json`);
});

console.log('\nMigration complete!');
console.log(`Created ${Object.keys(months).length} month files`);
console.log('\nYou can now delete board-content.json if you want.');
