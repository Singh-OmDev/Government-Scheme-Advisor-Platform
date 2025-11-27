const API_URL = 'http://localhost:5000/api';

export const recommendSchemes = async (userProfile) => {
    try {
        const response = await fetch(`${API_URL}/recommend-schemes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userProfile),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const chatWithScheme = async (scheme, question, language) => {
    try {
        const response = await fetch(`${API_URL}/chat-scheme`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scheme, question, language }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error("Chat API Error:", error);
        throw error;
    }
};
