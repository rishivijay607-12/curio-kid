// This service manages the API key in the browser's local storage.

const API_KEY_STORAGE_KEY = 'curiosity_gemini_api_key';

/**
 * Retrieves the API key from local storage.
 * @returns The API key string, or null if it's not set.
 */
export const getApiKey = (): string | null => {
    try {
        return localStorage.getItem(API_KEY_STORAGE_KEY);
    } catch (e) {
        console.error("Could not access local storage to get API key.", e);
        return null;
    }
};

/**
 * Saves the API key to local storage.
 * @param key The API key string to save.
 */
export const saveApiKey = (key: string): void => {
    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } catch (e) {
        console.error("Could not access local storage to save API key.", e);
    }
};
