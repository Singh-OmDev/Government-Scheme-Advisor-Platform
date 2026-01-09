const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Clerk User ID
    timestamp: { type: Date, default: Date.now },
    profile: {
        state: String,
        age: String,
        occupation: String,
        category: String,
        income: String
    },
    schemesFound: { type: Number, default: 0 },
    topSchemes: [String] // Names of schemes recommended
});

module.exports = mongoose.model('History', historySchema);
