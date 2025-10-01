// This variable will cache the API key in memory for the duration of the session
let apiKey: string | null = null;
let apiKeyPromise: Promise<string> | null = null;

/**
 * Fetches the API key from the secure serverless function.
 * It caches the key in memory to avoid repeated requests.
 * @returns {Promise<string>} A promise that resolves with the API key.
 */
export const fetchAndCacheApiKey = (): Promise<string> => {
    if (apiKey) {
        return Promise.resolve(apiKey);
    }

    if (apiKeyPromise) {
        return apiKeyPromise;
    }

    apiKeyPromise = new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('/api/get-api-key');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse API key error response.' }));
                throw new Error(errorData.error || 'Failed to fetch API key from server.');
            }
            const data = await response.json();
            if (!data.apiKey) {
                throw new Error('API key was not found in the server response.');
            }
            apiKey = data.apiKey;
            resolve(apiKey);
        } catch (error) {
            console.error("API Key fetch error:", error);
            reject(error);
        } finally {
            // Clear the promise so that subsequent failures can be retried.
            apiKeyPromise = null;
        }
    });
    
    return apiKeyPromise;
};
