# AI Government Scheme Advisor – India

A web application that helps Indian citizens understand which government schemes they may be eligible for, what documents are required, and how to apply.

## Features
- **AI-Powered Recommendations**: Uses Gemini 1.5 Flash to suggest relevant schemes.
- **Simple Language**: Explains eligibility and steps in easy-to-understand English.
- **Comprehensive Form**: Captures detailed user profile for accurate suggestions.
- **Filtering**: Filter schemes by type (Central/State) and category.
- **Shareable**: Copy all recommendations to share via WhatsApp/Text.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini 1.5 Flash

## How to Run

1.  **Clone/Download** the repository.
2.  **Setup API Key**:
    - Create a `.env` file in the `server` directory.
    - Add `GEMINI_API_KEY=your_api_key_here`.
3.  **Install Dependencies**:
    ```bash
    npm install
    cd client && npm install
    cd ../server && npm install
    ```
4.  **Start the App**:
    ```bash
    npm start
    ```
5.  **Open Browser**: Visit `http://localhost:5173`.

## Disclaimer
This tool is for **informational purposes only**. Always verify details from official government portals. This is not legal or financial advice.
