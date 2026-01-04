const http = require('http');

const data = JSON.stringify({
    name: 'Om Singh',
    age: '21',
    gender: 'Male',
    state: 'Uttar Pradesh',
    city: '',
    annualIncome: 'Less than 1 Lakh',
    category: 'General',
    occupation: 'Student',
    educationLevel: 'Graduate',
    specialConditions: [],
    language: 'en'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/recommend-schemes',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending request with data:", data);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let chunks = "";
    res.on('data', (chunk) => {
        chunks += chunk;
    });
    res.on('end', () => {
        console.log(`BODY: ${chunks}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
