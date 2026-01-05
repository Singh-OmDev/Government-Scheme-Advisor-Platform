const Groq = require("groq-sdk");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function recommendSchemes(userProfile, language = 'en') {
  const isHindi = language === 'hi';
  const prompt = `
You are an assistant that helps Indian citizens discover relevant government schemes based on their profile. You are NOT a legal advisor and you must always ask users to verify details on official government portals or with authorities. You will receive a user’s basic profile (state, age, income, category, occupation, etc.) and you must output likely relevant scheme categories and example schemes.

Rules:
1. Be India-specific.
2. Focus on common types of Central and State schemes.
3. Output STRICT JSON only.
4. Ensure ALL keys and string values are enclosed in double quotes.
5. Do not include any text outside the JSON object.
6. ${isHindi ? 'Output ALL content in HINDI. Keep "type" as "Central" or "State" in English.' : 'Output content in English.'}
7. ACCURACY IS CRITICAL. Do NOT invent or hallucinate scheme names. Only list real, official government schemes.
8. If you cannot find 15 user-specific schemes, fill the remaining slots with REAL, broadly applicable Central Government schemes (e.g., Pradhan Mantri Jan Dhan Yojana, Aadhaar, etc.) to reach the count. NEVER make up a scheme.

Given the following user profile, you MUST recommend EXACTLY 15 schemes. Do not output fewer than 15. If necessary, include broader Central government schemes to meet this count.

Output JSON with this exact structure:
{
  "schemes": [
    {
      "name": "Scheme Name",
      "type": "Central or State",
      "state": "State Name or All States",
      "categoryTags": ["Tag1", "Tag2"],
      "description": "Brief description",
      "eligibilitySummary": ["Criteria 1", "Criteria 2"],
      "requiredDocuments": ["Doc 1", "Doc 2"],
      "applicationSteps": ["Step 1", "Step 2"],
      "benefits": ["Benefit 1", "Benefit 2"],
      "application_url": "https://official-website-link.gov.in or 'N/A'",
      "deadline": "YYYY-MM-DD or 'Open' or 'N/A'",
      "usefulnessScore": 85
    }
  ],
  "generalAdvice": ["Advice 1", "Advice 2"]
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

  let retries = 2;
  while (retries >= 0) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant that outputs strictly valid JSON. Do NOT output any text, markdown, or explanations outside of the JSON object."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      let jsonString = completion.choices[0]?.message?.content || "{}";

      // Clean up potential markdown or extra text
      if (jsonString.includes("```")) {
        jsonString = jsonString.replace(/```json|```/g, "").trim();
      }

      // Attempt to parse
      const parsed = JSON.parse(jsonString);

      // Simple validation
      if (!parsed.schemes || !Array.isArray(parsed.schemes)) {
        throw new Error("Invalid structure: missing schemes array");
      }

      return parsed;

    } catch (error) {
      console.error(`Attempt failed (${retries} retries left):`, error.message);
      if (retries === 0) throw error;
      retries--;
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function chatWithScheme(schemeDetails, userQuestion, language) {
  const isHindi = language === 'hi';

  const prompt = `
    You are a helpful government scheme advisor assistant.
    
    Scheme Details:
    ${JSON.stringify(schemeDetails, null, 2)}
    
    User Question: "${userQuestion}"
    
    Instructions:
    1. Answer the user's question based ONLY on the provided scheme details.
    2. If the answer is not in the scheme details, say "I don't have that information based on the available scheme details."
    3. Keep the answer concise (under 50 words if possible).
    4. ${isHindi ? 'Answer in HINDI language.' : 'Answer in English.'}
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || (isHindi ? "क्षमा करें, मैं अभी उत्तर नहीं दे सकता।" : "Sorry, I cannot answer that right now.");
  } catch (error) {
    console.error("Error in chatWithScheme:", error);
    throw error;
  }
}

module.exports = { recommendSchemes, chatWithScheme };
