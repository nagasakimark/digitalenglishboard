const fs = require('fs');
const path = require('path');

const MONTH_FILE = path.join(__dirname, '../public/data/months/2025-12.json');
const OUTPUT_DIR = path.join(__dirname, '../public/assets/images/extracted');
const PUBLIC_PATH_PREFIX = 'assets/images/extracted/';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function processData(data) {
    if (typeof data === 'string') {
        if (data.startsWith('data:image/')) {
            return extractImage(data);
        }
        return data;
    } else if (Array.isArray(data)) {
        return data.map(item => processData(item));
    } else if (typeof data === 'object' && data !== null) {
        const newData = {};
        for (const key in data) {
            newData[key] = processData(data[key]);
        }
        return newData;
    }
    return data;
}

function extractImage(base64String) {
    try {
        const matches = base64String.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (!matches) {
            console.warn('Invalid base64 string format');
            return base64String;
        }

        let extension = matches[1];
        // Fix common extensions
        if (extension === 'jpeg') extension = 'jpg';
        if (extension === 'svg+xml') extension = 'svg';

        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const filename = `img_${timestamp}_${random}.${extension}`;
        const filePath = path.join(OUTPUT_DIR, filename);

        fs.writeFileSync(filePath, buffer);
        console.log(`Extracted: ${filename}`);

        return PUBLIC_PATH_PREFIX + filename;
    } catch (error) {
        console.error('Error extracting image:', error);
        return base64String;
    }
}

console.log(`Processing ${MONTH_FILE}...`);
const rawData = fs.readFileSync(MONTH_FILE, 'utf8');
const jsonData = JSON.parse(rawData);

const processedData = processData(jsonData);

fs.writeFileSync(MONTH_FILE, JSON.stringify(processedData, null, 2));
console.log('Done! JSON updated.');
