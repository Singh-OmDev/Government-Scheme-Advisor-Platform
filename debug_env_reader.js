const fs = require('fs');
const path = require('path');

function readEnv(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`[${filePath}] DOES NOT EXIST`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`--- [${filePath}] ---`);
    console.log(JSON.stringify(content));
    console.log('--- END ---');
}

readEnv(path.join(__dirname, 'server/.env'));
readEnv(path.join(__dirname, 'client/.env'));
