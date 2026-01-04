const fetch = require('node-fetch');

async function test() {
    try {
        console.log("Testing GET http://localhost:5000/");
        // Root might 404 if not defined, but let's see headers
        const resRoot = await fetch('http://localhost:5000/');
        console.log("Root status:", resRoot.status);
    } catch (e) {
        console.log("Root fetch failed:", e.message);
    }

    try {
        console.log("Testing POST http://localhost:5000/api/recommend-schemes");
        const res = await fetch('http://localhost:5000/api/recommend-schemes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "Test" })
        });
        console.log("API status:", res.status);
        const text = await res.text();
        console.log("API response:", text);
    } catch (e) {
        console.log("API fetch failed:", e.message);
    }
}

test();
