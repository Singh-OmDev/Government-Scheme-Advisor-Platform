export const API_URL = '/api';
// export const API_URL = 'https://ai-government-scheme-advisor.onrender.com/api';

export const recommendSchemes = async (userProfile, token) => {
    try {
        console.log("Fetching URL:", `${API_URL}/recommend-schemes`);
        const response = await fetch(`${API_URL}/recommend-schemes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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

export const searchSchemes = async (query, language, token) => {
    try {
        const response = await fetch(`${API_URL}/search-schemes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query, language }),
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
