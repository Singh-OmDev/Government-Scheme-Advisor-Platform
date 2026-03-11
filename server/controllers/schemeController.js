const { recommendSchemes, chatWithScheme, searchSchemes } = require('../groq');
const Analytics = require('../models/Analytics');
const History = require('../models/History');
const SavedScheme = require('../models/SavedScheme');
const mongoose = require('mongoose');

// Helper to check DB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * recommendSchemesController
 * Handles the logic for generating scheme recommendations based on user profile.
 * Also saves analytics and user history asynchronously.
 */
exports.getRecommendations = async (req, res) => {
    try {
        const userProfile = req.body;
        const language = userProfile.language || 'en';

        // 1. Get Recommendations (Independent of DB)
        let recommendations;
        try {
            const excludeSchemes = userProfile.excludeSchemes || [];
            recommendations = await recommendSchemes(userProfile, language, excludeSchemes);
        } catch (groqError) {
            console.error("Critical: Groq API failed:", groqError);
            return res.status(500).json({ error: "Failed to generate recommendations", details: groqError.message });
        }

        const schemeNames = recommendations.schemes ? recommendations.schemes.map(s => s.name) : [];

        // 2. Fire-and-forget: Save Analytics & History if DB is connected
        if (isDbConnected()) {
            // Save Analytics
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
                } catch (analyticsErr) {
                    console.error("⚠️ Analytics save failed:", analyticsErr.message);
                }
            })();

            // Save History (if userId exists)
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
                    } catch (histErr) {
                        console.error("⚠️ History save failed:", histErr.message);
                    }
                })();
            }
        } else {
            // console.warn("⚠️ MongoDB not connected. Skipping Analytics/History save.");
        }

        res.json(recommendations);
    } catch (error) {
        console.error("Unexpected error in getRecommendations:");
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

/**
 * searchSchemesController
 * Handles searching for schemes by keyword.
 */
exports.searchSchemes = async (req, res) => {
    try {
        const { query, language, excludeSchemes } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        const results = await searchSchemes(query, language || 'en', excludeSchemes || []);
        res.json(results);
    } catch (error) {
        console.error("Search Endpoint Error:", error);
        res.status(500).json({ error: "Search failed" });
    }
};

/**
 * chatWithSchemeController
 * Handles chatting with a specific scheme.
 */
exports.chatWithScheme = async (req, res) => {
    try {
        const { scheme, question, language } = req.body;
        if (!scheme || !question) {
            return res.status(400).json({ error: "Scheme details and question are required." });
        }
        const answer = await chatWithScheme(scheme, question, language || 'en');
        res.json({ answer });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

/**
 * saveScheme
 * Saves a scheme to the user's bookmark list.
 */
exports.saveScheme = async (req, res) => {
    try {
        const { userId, schemeName, schemeData } = req.body;

        if (!userId || !schemeName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

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
};

/**
 * getSavedSchemes
 * Retrieves saved schemes for a user.
 */
exports.getSavedSchemes = async (req, res) => {
    try {
        const { userId } = req.params;
        const savedSchemes = await SavedScheme.find({ userId }).sort({ timestamp: -1 });
        res.json(savedSchemes);
    } catch (error) {
        console.error("Fetch saved schemes error:", error);
        res.status(500).json({ error: "Failed to fetch saved schemes" });
    }
};

/**
 * deleteSavedScheme
 * Removes a scheme from saved list.
 */
exports.deleteSavedScheme = async (req, res) => {
    try {
        const { id } = req.params;
        await SavedScheme.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete saved scheme error:", error);
        res.status(500).json({ error: "Failed to remove scheme" });
    }
};

/**
 * checkIsSaved
 * Checks if a specific scheme is saved by the user.
 */
exports.checkIsSaved = async (req, res) => {
    try {
        const { userId, schemeName } = req.query;
        if (!userId || !schemeName) return res.json({ saved: false });

        const schemeId = schemeName.toLowerCase().replace(/\s+/g, '-');
        const exists = await SavedScheme.exists({ userId, schemeId });
        res.json({ saved: !!exists });
    } catch (error) {
        res.status(500).json({ error: "Check error" });
    }
};
