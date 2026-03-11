const Groq = require("groq-sdk");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Hours

async function recommendSchemes(userProfile, language = 'en') {
  const isHindi = language === 'hi';

  // Clean profile for cache key
  const cacheKey = JSON.stringify({
    state: userProfile.state,
    age: userProfile.age,
    gender: userProfile.gender,
    income: userProfile.annualIncome,
    category: userProfile.category,
    occupation: userProfile.occupation,
    lang: language
  });

  if (cache.has(cacheKey)) {
    const { timestamp, data } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log("⚡ Serving from Cache");
      return data;
    }
    cache.delete(cacheKey);
  }

  const systemPrompt = "You are a helpful AI assistant that outputs strictly valid JSON. Do NOT output any text, markdown, or explanations outside of the JSON object.";

  // Step 1: Get List of Scheme Names (Fast)
  // Requesting 15-20 relevant scheme names strictly.
  const namePrompt = `
    You are an expert government scheme advisor for India.
    User Profile:
    Name: ${userProfile.name || 'N/A'}
    Age: ${userProfile.age}
    Gender: ${userProfile.gender}
    State: ${userProfile.state}
    Income: ${userProfile.annualIncome}
    Category: ${userProfile.category}
    Occupation: ${userProfile.occupation}
    Special Conditions: ${userProfile.specialConditions ? userProfile.specialConditions.join(', ') : 'None'}

    Task:
    1. Identify highly relevant government schemes (Central & State) for this user. Aim for 10-15 schemes.
    2. PRIORITY: You must prioritize **State-specific schemes** for '${userProfile.state}'. Aim for at least 40-50% schemes from this state if possible.
    3. ELIGIBILITY CHECKS (CRITICAL AND MANDATORY):
       - GENDER (ABSOLUTE RULE): If 'Male', you MUST NOT include ANY schemes for Women, Girls, Maternity, or Pregnancy. NO maternity benefit programs or schemes for females.
       - AGE: Ensure the user's age (${userProfile.age}) strictly falls within the scheme's limits.
       - INCOME: If income is 'High' or exceeds limits, EXCLUDE BPL/EWS specific schemes.
       - CATEGORY: If 'General', EXCLUDE schemes reserved EXCLUSIVELY for SC/ST/OBC/Minority. If user is SC/ST/OBC, INCLUDE specific schemes for them.
       - STATE (CRITICAL): State specific schemes MUST ONLY be for '${userProfile.state}'. NEVER include a state scheme for a different state. If you can't find state schemes, use Central schemes.
       - OCCUPATION: Prioritize schemes matching '${userProfile.occupation}'.
    4. Do NOT force the list to 15 if there are not enough relevant schemes, but try to find valid State schemes first before filling with broad Central schemes.
    5. Output STRICT JSON only.
    
    JSON Structure:
    {
      "schemeNames": ["State Scheme 1", "State Scheme 2", "Central Scheme 1", ...],
      "generalAdvice": ["Advice 1", "Advice 2"]
    }
  `;

  let step1Data;
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: namePrompt }
      ],
      model: "llama-3.1-8b-instant", // Optimised for speed
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let jsonString = completion.choices[0]?.message?.content || "{}";
    if (jsonString.includes("```")) jsonString = jsonString.replace(/```json|```/g, "").trim();
    step1Data = JSON.parse(jsonString);
  } catch (err) {
    console.error("Step 1 (Names) Failed:", err);
    console.warn("⚠️ Groq API Failed (Rate Limit/Error). Using Fallback Schemes.");
    return {
      schemes: require('./constants/fallbackSchemes').FALLBACK_SCHEMES,
      generalAdvice: ["We are experiencing high traffic. Here are some popular schemes for everyone."]
    };
  }

  const allNames = step1Data.schemeNames || [];
  const generalAdvice = step1Data.generalAdvice || [];

  if (allNames.length === 0) {
    console.warn("⚠️ No schemes found by AI. Using Fallback Schemes.");
    return { schemes: require('./constants/fallbackSchemes').FALLBACK_SCHEMES, generalAdvice: ["Could not find specific schemes for your profile at this moment.", "Please check the 'General' schemes listed below."] };
  }

  // Step 2: Parallel Details Fetching
  // Split names into batches of 5 to run in parallel
  const batchSize = 5;
  const batches = [];
  for (let i = 0; i < allNames.length; i += batchSize) {
    batches.push(allNames.slice(i, i + batchSize));
  }

  // Schema Template for prompt
  const schemaStructure = JSON.stringify({
    schemes: [
      {
        name: "Exact Name from list",
        type: "Central or State",
        state: "State Name or All States",
        categoryTags: ["Tag1", "Tag2"],
        description: "Brief description",
        eligibilitySummary: ["Criteria 1", "Criteria 2"],
        requiredDocuments: ["Doc 1", "Doc 2"],
        applicationSteps: ["Step 1", "Step 2"],
        benefits: ["Benefit 1", "Benefit 2"],
        application_url: "MUST be a valid official URL (e.g., .gov.in, .nic.in) or 'N/A'",
        deadline: "YYYY-MM-DD or 'Open' or 'N/A'",
        usefulnessScore: 85
      }
    ]
  });

  const detailPromises = batches.map(async (batchNames) => {
    const detailPrompt = `
      You are a government scheme advisor.
      User Profile: [Age: ${userProfile.age}, Gender: ${userProfile.gender}, State: ${userProfile.state}, Category: ${userProfile.category}, Income: ${userProfile.annualIncome}]
      Language: ${isHindi ? 'HINDI' : 'English'}

      Task:
      Provide details for these specific schemes: ${JSON.stringify(batchNames)}

      Rules:
      1. Output STRICT JSON only.
      2. Follow this structure EXACTLY: ${schemaStructure}
      3. VERIFY ELIGIBILITY: Before generating details, verify if the user is truly eligible. 
         - CRITICAL: If Gender is 'Male', you MUST instantly reject ANY scheme related to maternity, pregnant women, or women's empowerment. 
         - CRITICAL: Review the State. If the scheme is a State Scheme for a state OTHER THAN '${userProfile.state}', you MUST reject it.
         - CRITICAL: Review Category. If the scheme is ONLY for SC/ST and user is '${userProfile.category}', verify match. 
         If a scheme is clearly ineligible, do NOT return it in the array; omit it entirely.
      4. PROVIDE OFFICIAL SOURCES (CRITICAL):
         - \`application_url\` MUST be a verifiable official government link (MUST END with \`.gov.in\`, \`.nic.in\` or \`.org.in\`).
         - DO NOT Hallucinate URLs. DO NOT provide dead links like "pmkvyofficial.org".
         - If you are not 100% certain of the official URL, YOU MUST output a Google Search link instead: \`https://www.google.com/search?q=\` + URL Encoded Scheme Name.
      5. ${isHindi ? 'Translate content to Hindi.' : 'Keep content in English.'}
      6. Ensure "name" matches the input name exactly.
    `;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: detailPrompt }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      let jsonString = completion.choices[0]?.message?.content || "{}";
      if (jsonString.includes("```")) jsonString = jsonString.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(jsonString);
      return parsed.schemes || [];
    } catch (err) {
      console.error("Batch Details Failed:", err);
      // Return empty array for this batch on failure instead of crashing everything
      return [];
    }
  });

  const results = await Promise.all(detailPromises);
  const allSchemes = results.flat();

  console.log(`Step 2 Complete. Generated ${allSchemes.length} detailed schemes.`);

  if (allSchemes.length === 0) {
    console.warn("⚠️ Step 2 produced 0 schemes (Rate Limit?). Using Fallback Schemes.");
    return {
      schemes: require('./constants/fallbackSchemes').FALLBACK_SCHEMES,
      generalAdvice: ["We are experiencing high traffic. Here are some popular schemes for everyone."]
    };
  }

  // 🚨 POST-PROCESSING FILTER (STRICT DEMOGRAPHIC ENFORCEMENT)
  let filteredSchemes = allSchemes;
  
  filteredSchemes = allSchemes.filter(scheme => {
    const schemeText = [
      scheme.name,
      scheme.description,
      ...(scheme.categoryTags || []),
      ...(scheme.eligibilitySummary || []),
      scheme.state
    ].join(' ').toLowerCase();

    // 1. GENDER FILTER
    if (userProfile.gender === 'Male') {
      const femaleKeywords = ['maternity', 'pregnant', 'pregnancy', 'women', 'woman', 'girl', 'female', 'mother', 'ladies', 'beti', 'mahila', 'matritva', 'sukanya', 'kanya'];
      if (femaleKeywords.some(keyword => schemeText.includes(keyword))) {
        return false; // Drop female-centric schemes for males
      }
    } else if (userProfile.gender === 'Female') {
      // Optional: if want to strictly block male-only schemes for females, though rare in India
    }

    // 2. STATE FILTER
    // If it's a state scheme, it MUST be for the user's state OR "All States"/"Central"/"India"
    const isCentralOrAll = ['all states', 'central', 'india', 'national', 'pan-india'].some(kw => scheme.state?.toLowerCase().includes(kw) || scheme.type?.toLowerCase().includes('central'));
    const isUsersState = scheme.state?.toLowerCase().includes(userProfile.state.toLowerCase()) || schemeText.includes(userProfile.state.toLowerCase());
    
    if (scheme.type?.toLowerCase().includes('state')) {
      if (!isUsersState && !isCentralOrAll) {
         return false; // Drop schemes from other states
      }
    }

    // 3. CASTE/CATEGORY FILTER (Basic Level)
    if (userProfile.category === 'General') {
      const scstKeywords = ['sc/st', 'scheduled caste', 'scheduled tribe', 'obc', 'backward class', 'minority only', 'minorities only'];
      if (scstKeywords.some(keyword => schemeText.includes(keyword)) && 
          !schemeText.includes('general') && !schemeText.includes('all categories')) {
        return false; // Drop SC/ST/OBC exclusive schemes for General
      }
    }

    // 4. URL SANITIZATION (Prevent Hallucinations/Dead links)
    if (scheme.application_url && scheme.application_url !== 'N/A') {
      const urlLower = scheme.application_url.toLowerCase();
      const validTlds = ['.gov.in', '.nic.in', '.org.in', '.edu.in', 'google.com/search'];
      
      let isValidGovLink = false;
      try {
        const parsedUrl = new URL(urlLower);
        isValidGovLink = validTlds.some(tld => parsedUrl.hostname.endsWith(tld));
      } catch(e) { /* invalid URL string */ }

      // If it's not a verified Indian Government TLD, replace it with a Google Search fallback
      if (!isValidGovLink) {
        // e.g., 'pmkvyofficial.org' gets overridden here
        const query = encodeURIComponent(scheme.name + " official website gov.in");
        scheme.application_url = `https://www.google.com/search?q=${query}`;
      }
    }

    return true; // Pass all filters
  });

  console.log(`Strict Filtering applied. Dropped ${allSchemes.length - filteredSchemes.length} ineligible schemes.`);

  const responseData = {
    schemes: filteredSchemes,
    generalAdvice: generalAdvice
  };

  // Cache the result
  cache.set(cacheKey, { timestamp: Date.now(), data: responseData });

  return responseData;
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
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || (isHindi ? "क्षमा करें, मैं अभी उत्तर नहीं दे सकता।" : "Sorry, I cannot answer that right now.");
  } catch (error) {
    console.error("Error in chatWithScheme:", error);
    throw error;
  }
}

async function searchSchemes(query, language = 'en') {
  const isHindi = language === 'hi';

  const prompt = `
    You are an expert government scheme advisor for India.
    User is searching for schemes related to: "${query}"

    Task:
    1. Identify the most relevant Central and State government schemes for this keyword.
    2. Return a list of up to 10 schemes.
    3. Output STRICT JSON format as defined below.
    4. ${isHindi ? 'Output mostly in HINDI, but keep keys in English.' : 'Output in English.'}
    5. Be accurate. Do not hallucinate schemes.
    
    JSON Structure:
    {
      "schemes": [
        {
          "name": "Scheme Name",
          "type": "Central or State",
          "state": "State Name",
          "categoryTags": ["Tag1", "Tag2"],
          "description": "Brief description",
          "eligibilitySummary": ["Criteria 1"],
          "requiredDocuments": ["Doc 1", "Doc 2"],
          "applicationSteps": ["Step 1", "Step 2"],
          "benefits": ["Benefit 1", "Benefit 2"],
          "application_url": "URL or 'N/A'",
          "deadline": "YYYY-MM-DD or 'Open' or 'N/A'",
          "usefulnessScore": 90
        }
      ]
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let jsonString = completion.choices[0]?.message?.content || "{}";
    if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```json|```/g, "").trim();
    }
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Search API Error:", error);
    throw new Error("Failed to fetch search results");
  }
}

module.exports = { recommendSchemes, chatWithScheme, searchSchemes };
