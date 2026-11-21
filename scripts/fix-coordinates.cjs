const fs = require('fs');
const path = require('path');

// This script SUBTRACTS the padding offset that was previously added
// because we removed the 20px padding from the board

const monthsDir = path.join(__dirname, '../public/data/months');

if (!fs.existsSync(monthsDir)) {
  console.error('Months directory not found:', monthsDir);
  process.exit(1);
}

const files = fs.readdirSync(monthsDir).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} month files to process.`);

files.forEach(file => {
  const filePath = path.join(monthsDir, file);
  console.log(`Processing ${file}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    let modified = false;

    // Helper to process a month object
    const processMonth = (monthData) => {
      let monthModified = false;
      if (monthData.items && Array.isArray(monthData.items)) {
        monthData.items.forEach(item => {
          if (item.position) {
            // SUBTRACT 20px to reverse the previous fix
            item.position.x = (item.position.x || 0) - 20;
            item.position.y = (item.position.y || 0) - 20;
            monthModified = true;
          }
        });
      }
      if (monthData.decorations && Array.isArray(monthData.decorations)) {
        monthData.decorations.forEach(dec => {
          if (dec.position) {
            // SUBTRACT 20px to reverse the previous fix
            dec.position.x = (dec.position.x || 0) - 20;
            dec.position.y = (dec.position.y || 0) - 20;
            monthModified = true;
          }
        });
      }
      return monthModified;
    };

    // Check if root has items (legacy/flat structure)
    if (data.items || data.decorations) {
      if (processMonth(data)) modified = true;
    }

    // Check months object
    if (data.months) {
      Object.keys(data.months).forEach(monthKey => {
        if (processMonth(data.months[monthKey])) modified = true;
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`  Updated coordinates in ${file}`);
    } else {
      console.log(`  No items/decorations found in ${file}`);
    }

  } catch (err) {
    console.error(`  Error processing ${file}:`, err.message);
  }
});

console.log('Coordinate fix complete.');
