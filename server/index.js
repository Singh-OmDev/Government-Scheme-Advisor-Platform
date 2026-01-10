const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Ensure Clerk Publishable Key is available for Backend SDK (it might look for CLERK_PUBLISHABLE_KEY)
if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY;
}

const { recommendSchemes, chatWithScheme } = require('./groq');

const mongoose = require('mongoose');
const Analytics = require('./models/Analytics');
const History = require('./models/History');
const SavedScheme = require('./models/SavedScheme');

const app = express();
// const port = 5002; // Hardcoded to match Vite Proxy
const port = process.env.PORT || 5002;
// const port = process.env.PORT || 5000;

// Global Error Handlers to prevent crash
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    // process.exit(1); // Keep alive for debugging
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    // process.exit(1);
});

// Connect to MongoDB
// Connect to MongoDB with robust error handling
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Fail after 5s if no DB
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Initial Fail:', err.message);
        // Do NOT process.exit(1) here, let the server run without DB
    });

mongoose.connection.on('error', err => {
    console.error('❌ MongoDB Runtime Error:', err.message);
});

const { clerkMiddleware, requireAuth } = require('@clerk/express');

app.use(cors());
app.use(express.json());

// Debug Logger
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.path}`);
    next();
});

// Add Clerk Middleware securely
if (process.env.CLERK_SECRET_KEY) {
    app.use(clerkMiddleware());
} else {
    console.warn("⚠️ CLERK_SECRET_KEY is missing in .env. Authentication middleware skipped (Routes protected by requireAuth will fail).");
}

// Routes
// app.post('/api/recommend-schemes', requireAuth(), async (req, res) => {
app.post('/api/recommend-schemes', async (req, res) => {
    // console.log("Auth Status: Request received at guarded endpoint.");
    console.log("⚠️ Auth bypassed for debugging."); // Keep debug log for now
    try {
        const userProfile = req.body;
        console.log("-----------------------------------------");
        console.log("Received profile for recommendation:", JSON.stringify(userProfile, null, 2));

        const language = userProfile.language || 'en';

        // 1. Critical Step: Get Recommendations (Independent of DB)
        let recommendations;
        try {
            recommendations = await recommendSchemes(userProfile, language);
            console.log("Recommendations generated successfully");
        } catch (groqError) {
            console.error("Critical: Groq API failed:", groqError);
            return res.status(500).json({ error: "Failed to generate recommendations", details: groqError.message });
        }

        const schemeNames = recommendations.schemes ? recommendations.schemes.map(s => s.name) : [];

        // Check DB Connection State
        // const isDbConnected = mongoose.connection.readyState === 1;
        const isDbConnected = false; // EMERGENCY DISABLE

        if (!isDbConnected) {
            console.warn("⚠️ MongoDB not connected. Skipping Analytics/History save to prevent crash.");
        } else {
            // 2. Non-Critical Step: Save Analytics (Fire & Forget)
            (async () => {
                try {
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
                        topSchemes: schemeNames.slice(0, 5)
                    });
                    console.log("📊 Analytics saved.");
                } catch (analyticsErr) {
                    console.error("⚠️ Analytics save failed:", analyticsErr.message);
                }
            })();

            // 3. Non-Critical Step: Save User History
            if (userProfile.userId) {
                (async () => {
                    try {
                        await History.create({
                            userId: userProfile.userId,
                            profile: {
                                state: userProfile.state,
                                age: userProfile.age,
                                occupation: userProfile.occupation,
                                income: userProfile.annualIncome,
                                category: userProfile.category
                            },
                            schemesFound: schemeNames.length,
                            topSchemes: schemeNames.slice(0, 5)
                        });
                        console.log(`📜 History saved for user ${userProfile.userId}`);
                    } catch (histErr) {
                        console.error("⚠️ History save failed:", histErr.message);
                    }
                })();
            }
        }

        res.json(recommendations);
    } catch (error) {
        console.error("Unexpected error in /api/recommend-schemes:");
        console.error(error);
        // TEMPORARY DEBUGGING: Expose stack trace to client
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
            stack: error.stack,
            location: "server/index.js catch block"
        });
    }
});

const { searchSchemes } = require('./groq');

// New Endpoint: Search Schemes by Keyword
app.post('/api/search-schemes', requireAuth(), async (req, res) => {
    try {
        const { query, language } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        console.log(`🔍 Searching for: ${query}`);
        const results = await searchSchemes(query, language || 'en');

        // Log search in analytics (optional, simplified)
        // await Analytics.create({ searchTerm: query, ... }); 

        res.json(results);
    } catch (error) {
        console.error("Search Endpoint Error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

// New Endpoint: Get Admin Dashboard Stats (Protected)
app.get('/api/analytics', requireAuth(), async (req, res) => {
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

// Get User History
app.get('/api/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await History.find({ userId }).sort({ timestamp: -1 }).limit(20);
        res.json(history);
    } catch (error) {
        console.error("History fetch error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// ... existing imports

// --- Saved Schemes Endpoints ---

// Save a Scheme
app.post('/api/save-scheme', async (req, res) => {
    try {
        const { userId, schemeName, schemeData } = req.body;

        if (!userId || !schemeName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Create a simple ID from name if not provided (or use a hash)
        const schemeId = schemeName.toLowerCase().replace(/\s+/g, '-');

        const saved = await SavedScheme.create({
            userId,
            schemeId,
            schemeName,
            schemeData
        });

        res.json(saved);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Scheme already saved" });
        }
        console.error("Save scheme error:", error);
        res.status(500).json({ error: "Failed to save scheme" });
    }
});

// Get User's Saved Schemes
app.get('/api/saved-schemes/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const savedSchemes = await SavedScheme.find({ userId }).sort({ timestamp: -1 });
        res.json(savedSchemes);
    } catch (error) {
        console.error("Fetch saved schemes error:", error);
        res.status(500).json({ error: "Failed to fetch saved schemes" });
    }
});

// Remove a Saved Scheme
app.delete('/api/saved-schemes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await SavedScheme.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete saved scheme error:", error);
        res.status(500).json({ error: "Failed to remove scheme" });
    }
});

// Check if scheme is saved (optional utility)
app.get('/api/is-saved', async (req, res) => {
    try {
        const { userId, schemeName } = req.query;
        if (!userId || !schemeName) return res.json({ saved: false });

        const schemeId = schemeName.toLowerCase().replace(/\s+/g, '-');
        const exists = await SavedScheme.exists({ userId, schemeId });
        res.json({ saved: !!exists });
    } catch (error) {
        res.status(500).json({ error: "Check error" });
    }
});

// ... existing chat-scheme route ...
app.post('/api/chat-scheme', async (req, res) => {
    // ...
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

app.get('/api/verify-server', (req, res) => {
    res.json({ message: "Verification Successful", port: port });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} (0.0.0.0) - TIMESTAMP: ${new Date().toISOString()}`);
    console.log(`🔒 Clerk Secret Key: ${process.env.CLERK_SECRET_KEY ? '✅ Loaded' : '❌ MISSING'}`);
    console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? '✅ Loaded' : '❌ MISSING'}`);
});
