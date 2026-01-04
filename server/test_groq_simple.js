const Groq = require("groq-sdk");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    console.log("Testing Groq API with key:", process.env.GROQ_API_KEY ? "Present" : "Missing");
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Say hello!"
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log("Success:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
