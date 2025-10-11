import type { QuizScore, User, UserProfile } from '../types';

// Custom error for client-side logic
export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const CURRENT_USER_KEY = 'curiosity_current_user';

// --- Helper function to call the user API ---
async function callUserApi<T>(action: string, params: object = {}): Promise<T> {
    const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
    });

    if (!response.ok) {
        let errorMessage = `Server Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                errorMessage = errorData.error;
            }
        } catch (e) {
            // Ignore if error response is not JSON
        }
        throw new ApiError(errorMessage, response.status);
    }
    
    // Handle cases with no JSON response body (e.g., for a 200 OK on a delete)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
            const data = await response.json();
            return data as T;
        } catch (e) {
            throw new Error('Failed to parse a successful server response.');
        }
    } else {
        return undefined as T;
    }
}

// --- Auth & Session Management ---

export const register = async (username: string, password: string): Promise<User> => {
    return callUserApi<User>('register', { username, password });
};

export const login = async (username: string, password: string): Promise<User> => {
    const user = await callUserApi<User>('login', { username, password });
    // Side-effect removed from here and moved to App.tsx for consistency
    return user;
};

export const getCurrentUser = (): User | null => {
    try {
        const storedValue = localStorage.getItem(CURRENT_USER_KEY);
        return storedValue ? JSON.parse(storedValue) : null;
    } catch (e) {
        console.error("Failed to read current user from localStorage:", e);
        return null;
    }
};

export const logout = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

// --- Data Functions ---

export const addQuizScore = async (username: string, score: number, total: number): Promise<void> => {
    return callUserApi('addQuizScore', { username, score, total });
};

export const getProfile = async (username: string): Promise<UserProfile> => {
    return callUserApi('getProfile', { username });
};

export const getLeaderboard = async (): Promise<QuizScore[]> => {
    return callUserApi('getLeaderboard');
};

// --- Admin Functions ---

const verifyAdminClient = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
        throw new ApiError("Forbidden: Admin access required.", 403);
    }
    return currentUser;
}

export const getAllUsers = async (): Promise<{ username: string }[]> => {
    const currentUser = verifyAdminClient();
    return callUserApi('getAllUsers', { currentUser });
};

export const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    const currentUser = verifyAdminClient();
    return callUserApi('getAllProfiles', { currentUser });
};

export const getAllScores = async (): Promise<QuizScore[]> => {
    const currentUser = verifyAdminClient();
    return callUserApi('getAllScores', { currentUser });
};

export const deleteUser = async (usernameToDelete: string): Promise<void> => {
    const currentUser = verifyAdminClient();
    return callUserApi('deleteUser', { usernameToDelete, currentUser });
};

export const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    const currentUser = verifyAdminClient();
    return callUserApi('editUserPassword', { username, newPassword, currentUser });
};