# Government Scheme Advisor – India

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ai-government-scheme-advisor.vercel.app/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

<img width="1899" height="867" alt="Dashboard Screenshot" src="https://github.com/user-attachments/assets/8eb51b1d-76c9-409b-a9ba-4a0425b6e170" />

## 📋 Overview

**AI Government Scheme Advisor** is a comprehensive web application designed to bridge the gap between Indian citizens and government welfare schemes. Using advanced AI (Llama 3.3 via Groq), it analyzes user profiles to discover relevant Central and State government schemes, explaining eligibility criteria, required documents, and application processes in simple, easy-to-understand language.

## ✨ Key Features

-   **🤖 AI-Powered Recommendations**: Utilizes **Llama 3.3** (via Groq) to analyze user data and suggest highly relevant schemes.
-   **🗣️ Multi-Language Support**: Provides scheme details in both **English** and **Hindi**.
-   **💬 Interactive AI Chat**: Users can ask specific questions about any scheme and get instant, context-aware answers.
-   **🔐 Secure Authentication**: Integrated with **Clerk** for secure and seamless user sign-up and login.
-   **💾 Saved Schemes**: Users can bookmark schemes to their profile for easy access later (MongoDB integration).
-   **🔍 Smart Search**: Search functionality to find schemes by keywords.
-   **📱 Responsive Design**: Fully responsive UI built with **React** and **Tailwind CSS**.
-   **⚡ Fast & Scalable**: Powered by **Vite** on the frontend and **Node.js/Express** on the backend.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS, Framer Motion (Animations)
-   **Icons**: Lucide React
-   **Authentication**: Clerk SDK

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose ODM)
-   **AI Model**: Llama 3.3-70b-versatile (via Groq Cloud)
-   **Authentication**: Clerk Express Middleware

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   **Node.js** (v18 or higher)
-   **MongoDB** (Local or Atlas URI)
-   **Groq Cloud API Key** (Get it [here](https://console.groq.com/))
-   **Clerk API Keys** (Get them [here](https://clerk.com/))

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/ai-government-scheme-advisor.git
    cd ai-government-scheme-advisor
    ```

2.  **Install Dependencies**
    Install dependencies for the root, server, and client:

    ```bash
    # Root dependencies
    npm install

    # Server dependencies
    cd server
    npm install

    # Client dependencies
    cd ../client
    npm install
    ```

### Configuration

You need to set up environment variables for both the Client and Server.

#### 1. Server Configuration
Create a `.env` file in the `server` directory:

```env
# server/.env
PORT=5002
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
# Optional but recommended for consistency
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

#### 2. Client Configuration
Create a `.env` file in the `client` directory:

```env
# client/.env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Running the Application

Return to the root directory and start both the client and server concurrently:

```bash
# From the root directory
npm start
```

-   **Frontend**: http://localhost:5173
-   **Backend**: http://localhost:5002

## 📂 Project Structure

```
ai-government-scheme-advisor/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   └── ...
│   └── ...
├── server/                 # Express Backend
│   ├── routes/             # API Routes
│   ├── models/             # Mongoose Models
│   ├── groq.js             # AI Logic Helper
│   └── index.js            # Server Entry Point
└── package.json            # Root configuration
```

## ⚠️ Disclaimer

This tool is for **informational purposes only**. The AI recommendations are based on available data and pattern matching. Always verify details (eligibility, deadlines, documents) from official government portals before applying. This application is not a substitute for professional legal or financial advice.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
