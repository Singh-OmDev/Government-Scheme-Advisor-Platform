const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { recommendSchemes, chatWithScheme } = require('./groq');

const mongoose = require('mongoose');
const Analytics = require('./models/Analytics');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/recommend-schemes', async (req, res) => {
    try {
        const userProfile = req.body;
        console.log("-----------------------------------------");
        console.log("Received profile for recommendation:", JSON.stringify(userProfile, null, 2));

        const language = userProfile.language || 'en';
        const recommendations = await recommendSchemes(userProfile, language);
        console.log("Recommendations generated successfully");

        // --- Save Analytics Background Task (Fire & Forget) ---
        try {
            const schemeNames = recommendations.schemes ? recommendations.schemes.map(s => s.name) : [];
            await Analytics.create({
                profile: {
                    state: userProfile.state,
                    age: userProfile.age,
                    occupation: userProfile.occupation,
                    income: userProfile.annualIncome,
                    category: userProfile.category,
                    gender: userProfile.gender
                },
                schemesFound: schemeNames.length,
                topSchemes: schemeNames.slice(0, 5) // Save top 5
            });
            console.log("📊 Analytics saved.");
        } catch (analyticsErr) {
            console.error("⚠️ Analytics save failed:", analyticsErr.message);
        }
        // -------------------------------------------------------

        res.json(recommendations);
    } catch (error) {
        console.error("Error processing request in /api/recommend-schemes:");
        console.error(error);
        if (error.response) {
            console.error("API Response Data:", error.response.data);
        }
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// New Endpoint: Get Admin Dashboard Stats
app.get('/api/analytics', async (req, res) => {
    try {
        const totalSearches = await Analytics.countDocuments();

        // Aggregate mostly searched states
        const stateStats = await Analytics.aggregate([
            { $group: { _id: "$profile.state", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Aggregate top occupations
        const occupationStats = await Analytics.aggregate([
            { $group: { _id: "$profile.occupation", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const recentSearches = await Analytics.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .select('profile.state profile.occupation schemesFound topSchemes timestamp');

        res.json({
            totalSearches,
            topStates: stateStats,
            topOccupations: occupationStats,
            recentSearches
        });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
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
