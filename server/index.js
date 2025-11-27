const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { recommendSchemes, chatWithScheme } = require('./groq');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/recommend-schemes', async (req, res) => {
    try {
        const userProfile = req.body;
        const language = userProfile.language || 'en';
        console.log("Received profile:", userProfile);
        const recommendations = await recommendSchemes(userProfile, language);
        res.json(recommendations);
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/chat-scheme', async (req, res) => {
    try {
        const { scheme, question, language } = req.body;
        if (!scheme || !question) {
            return res.status(400).json({ error: "Scheme details and question are required." });
        }
        const answer = await chatWithScheme(scheme, question, language || 'en');
        res.json({ answer });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        // Log the full error object for debugging
        console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
