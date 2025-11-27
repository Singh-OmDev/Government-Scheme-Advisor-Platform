const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');


dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    try {
        const key = process.env.GEMINI_API_KEY;
        console.log("API Key loaded:", key ? "Yes" : "No");

        if (key) {
            console.log("Key length:", key.length);
            console.log("Key starts with:", key.substring(0, 4));
            console.log("Key ends with:", key.substring(key.length - 4));
        }

        if (!key || key === 'YOUR_API_KEY_HERE') {
            console.error("ERROR: You have not replaced YOUR_API_KEY_HERE with your actual API key in server/.env");
            return;
        }

        const genAI = new GoogleGenerativeAI(key);

        console.log("Attempting to connect with gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("Success! Response:", response.text());

    } catch (error) {
        console.error("Error testing Gemini:", error.message);
    }
}

listModels();
