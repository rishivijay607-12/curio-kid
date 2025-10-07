
import type { QuizScore, User, UserProfile } from '../types';

// Custom error for API responses, consistent with other services.
export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// --- localStorage Key for client-side session management ---
const CURRENT_USER_KEY = 'curiosity_current_user';

// --- Helper function to call our secure serverless user DB ---
async function callUserApi<T>(action: string, params: object, user?: User | null): Promise<T> {
    const response = await fetch('/api/user-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params, user }), // Pass user for admin auth
    });

    // We attempt to parse JSON on both success and error, as our API should return it.
    const responseData = await response.json().catch(() => {
        // If JSON parsing fails, create a generic error object
        return { error: `Server returned a non-JSON response with status ${response.status}` };
    });

    if (!response.ok) {
        const errorMessage = responseData.error || `Server Error: ${response.status}`;
        throw new ApiError(errorMessage, response.status);
    }
    
    return responseData as T;
}

// --- Local Session Management ---
const saveCurrentUser = (user: User) => {
    try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.warn(`Could not write to localStorage key "${CURRENT_USER_KEY}":`, e);
    }
};

export const getCurrentUser = (): User | null => {
    try {
        const item = localStorage.getItem(CURRENT_USER_KEY);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn(`Could not read from localStorage key "${CURRENT_USER_KEY}":`, e);
        return null;
    }
};

export const logout = (): void => {
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
        console.warn("Could not clear user session from localStorage.");
    }
};


// --- Auth Functions (Now hitting the API) ---
export const register = async (username: string, password: string): Promise<User> => {
    // Call the API to create the user account in the central DB.
    await callUserApi('register', { username, password });
    
    // After successful registration, log the user in to create a local session.
    // This is cleaner as `login` is the single source of truth for session creation.
    return login(username, password);
};

export const login = async (username: string, password: string): Promise<User> => {
    const user = await callUserApi<User>('login', { username, password });
    saveCurrentUser(user); // Save session locally after successful login from API
    return user;
};

// --- Data Functions (Now hitting the API) ---
export const addQuizScore = async (username:string, score: number, total: number): Promise<void> => {
    // The username is sufficient for the API to identify the profile.
    return callUserApi('addQuizScore', { username, score, total });
};

export const getLeaderboard = async (): Promise<QuizScore[]> => {
    return callUserApi('getLeaderboard', {});
};

export const getProfile = async (username: string): Promise<UserProfile> => {
    return callUserApi('getProfile', { username });
};

// --- Admin Functions (Now hitting the API with authentication) ---
export const getAllUsers = async (): Promise<{ username: string }[]> => {
    return callUserApi('getAllUsers', {}, getCurrentUser());
};

export const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    return callUserApi('getAllProfiles', {}, getCurrentUser());
};

export const getAllScores = async (): Promise<QuizScore[]> => {
    return callUserApi('getAllScores', {}, getCurrentUser());
};

export const deleteUser = async (usernameToDelete: string): Promise<void> => {
    return callUserApi('deleteUser', { usernameToDelete }, getCurrentUser());
};

export const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    return callUserApi('editUserPassword', { username, newPassword }, getCurrentUser());
};
