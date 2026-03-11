let apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    if (import.meta.env.MODE === 'production') {
        // Direct connection to Render in production to avoid Vercel proxy issues
        apiUrl = 'https://ai-government-scheme-advisor.onrender.com/api';
    } else {
        // Use local proxy in development
        apiUrl = '/api';
    }
}

// Defensive check for local legacy port
if (apiUrl.includes('localhost:5001')) {
    apiUrl = '/api';
}
export const API_URL = apiUrl;

export const recommendSchemes = async (userProfile, token) => {
    try {
        const url = `${API_URL}/recommend-schemes`;
        console.log("Fetching URL:", url);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userProfile),
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                console.error("Full API Error Details:", errorData);
                errorMessage += ` - ${errorData.details || errorData.error || JSON.stringify(errorData)}`;
                if (errorData.stack) console.error("Server Stack Trace:", errorData.stack);
            } catch (e) {
                const errorText = await response.text();
                console.error(`API Error (${response.status}) Raw Text:`, errorText);
                errorMessage += ` - ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("API Error Warning:", error);
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

export const searchSchemes = async (query, language, token, excludeSchemes = []) => {
    try {
        const response = await fetch(`${API_URL}/search-schemes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query, language, excludeSchemes }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to search schemes');
        }

        return await response.json();
    } catch (error) {
        console.error("Search Schemes API Error:", error);
        throw error;
    }
};

export const saveScheme = async (userId, scheme, token) => {
    const response = await fetch(`${API_URL}/save-scheme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            schemeName: scheme.name,
            schemeData: scheme
        }),
    });
    if (!response.ok) {
        if (response.status === 400) throw new Error("Already saved");
        throw new Error("Failed to save");
    }
    return await response.json();
};

export const getSavedSchemes = async (userId) => {
    const response = await fetch(`${API_URL}/saved-schemes/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
};

export const removeSavedScheme = async (id) => {
    const response = await fetch(`${API_URL}/saved-schemes/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error("Failed to delete");
    return await response.json();
};
