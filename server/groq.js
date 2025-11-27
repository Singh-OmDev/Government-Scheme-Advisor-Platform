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
6. ${isHindi ? 'Output ALL content (descriptions, names, advice, tags, eligibility, documents, steps, benefits) in HINDI language. HOWEVER, keep the value of "type" as strictly "Central" or "State" (in English) for filtering purposes. Keep JSON keys in English.' : 'Output content in English.'}

Given the following user profile, recommend UP TO 10 schemes.

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

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that outputs strictly valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const jsonString = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
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
