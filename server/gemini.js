const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("Gemini API Key Configured:", process.env.GEMINI_API_KEY ? "Yes (" + process.env.GEMINI_API_KEY.substring(0, 4) + "...)" : "No");

async function recommendSchemes(userProfile) {
  // Use gemini-pro as fallback
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
You are an assistant that helps Indian citizens discover relevant government schemes based on their profile. You are NOT a legal advisor and you must always ask users to verify details on official government portals or with authorities. You will receive a user’s basic profile (state, age, income, category, occupation, etc.) and you must output likely relevant scheme categories and example schemes.

Rules:
1. Be India-specific.
2. Focus on common types of Central and State schemes (scholarships, pensions, health insurance, farmer support, women empowerment, housing, etc.).
3. You DO NOT need to be 100% exhaustive or perfectly updated.
4. You MUST clearly present output in structured JSON.
5. Use simple, understandable English.
6. Never guarantee eligibility; only say ‘may be eligible’ or ‘possibly eligible’.
7. Always include a disclaimer in generalAdvice telling the user to verify details on official portals.

Given the following user profile, recommend UP TO 10 schemes that are likely relevant.

Output JSON with this structure:
{
  "schemes": [
    {
      "name": "string",
      "type": "Central or State",
      "state": "string (state name or 'All States')",
      "categoryTags": ["string", "string"],
      "description": "short description",
      "eligibilitySummary": ["bullet1", "bullet2"],
      "requiredDocuments": ["doc1", "doc2"],
      "applicationSteps": ["step1", "step2"],
      "usefulnessScore": 0
    }
  ],
  "generalAdvice": ["tip1", "tip2"]
}

User Profile:
Name: ${userProfile.name || 'N/A'}
Age: ${userProfile.age}
Gender: ${userProfile.gender}
State: ${userProfile.state}
City: ${userProfile.city}
Annual Income: ${userProfile.annualIncome}
Category: ${userProfile.category}
Occupation: ${userProfile.occupation}
Education Level: ${userProfile.educationLevel}
Special Conditions: ${userProfile.specialConditions ? userProfile.specialConditions.join(', ') : 'None'}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the text to ensure it's valid JSON
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

module.exports = { recommendSchemes };
