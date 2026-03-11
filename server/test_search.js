const http = require('http');

const postData = JSON.stringify({
    query: "education scheme for girl in bihar",
    language: "en"
});

const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/search-schemes',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log("Starting request to localhost:5002/api/search-schemes");
const startTime = Date.now();

const req = http.request(options, (res) => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        console.log(`Request completed in ${duration} seconds`);
        console.log(`Status Code: ${res.statusCode}`);

        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(body);
                console.log(JSON.stringify(json, null, 2));
            } catch (e) {
                console.log("❌ ERROR: Failed to parse JSON response.");
                console.log(body);
            }
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ PROBLEM WITH REQUEST: ${e.message}`);
});

req.write(postData);
req.end();
