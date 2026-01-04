const Groq = require("groq-sdk");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    console.log("Testing Groq API JSON mode...");
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant that outputs strictly valid JSON."
                },
                {
                    role: "user",
                    content: "Generate a JSON with a key 'greeting' and value 'hello'."
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        console.log("Success:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
