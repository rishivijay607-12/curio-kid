const API_KEY_STORAGE_KEY = 'curiosity_gemini_api_key';

export const saveApiKey = (apiKey: string): void => {
  try {
    if (!apiKey) {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    } else {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }
  } catch (e) {
    console.error("Failed to save API key to localStorage", e);
    alert("Could not save API Key. Your browser might be in private mode or has storage disabled.");
  }
};

export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to get API key from localStorage", e);
    return null;
  }
};

export const clearApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear API key from localStorage", e);
  }
};