import type { QuizScore, User, UserProfile } from '../types';

// Custom error for API responses
export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// Helper function to call our user database API
async function callUserApi<T>(action: string, params: object, user?: User | null): Promise<T> {
    const response = await fetch('/api/user-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params, user }), // Pass current user for auth on protected routes
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(data.error || 'An unknown error occurred', response.status);
    }
    
    return data as T;
}

// --- Local Session Management ---
const CURRENT_USER_KEY = 'curiosity_current_user';

const saveCurrentUser = (user: User) => {
    try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.warn('Could not save user session to localStorage.');
    }
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        console.warn('Could not retrieve user session from localStorage.');
        return null;
    }
};

export const logout = (): void => {
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
        console.warn('Could not clear user session from localStorage.');
    }
};

// --- API-driven Auth and Data Functions ---

export const register = async (username: string, password: string): Promise<User> => {
    // The server will handle registration and return the new user object (without password)
    const newUser = await callUserApi<User>('register', { username, password });
    // After successful registration, log them in by saving their session
    saveCurrentUser(newUser);
    return newUser;
};

export const login = async (username: string, password: string): Promise<User> => {
    const user = await callUserApi<User>('login', { username, password });
    saveCurrentUser(user);
    return user;
};

export const addQuizScore = async (username: string, score: number, total: number): Promise<void> => {
    return callUserApi('addQuizScore', { username, score, total });
};

export const getLeaderboard = async (): Promise<QuizScore[]> => {
    return callUserApi('getLeaderboard', {});
};

export const getProfile = async (username: string): Promise<UserProfile> => {
    return callUserApi('getProfile', { username });
};

// --- Admin Functions ---
const verifyAdminAndCall = async <T>(action: string, params: object = {}): Promise<T> => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
        throw new ApiError("Forbidden: Admin access required.", 403);
    }
    // Pass the current user to the API for server-side verification
    return callUserApi<T>(action, params, currentUser);
};

export const getAllUsers = async (): Promise<{ username: string }[]> => {
    return verifyAdminAndCall('getAllUsers');
};

export const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    return verifyAdminAndCall('getAllProfiles');
};

export const getAllScores = async (): Promise<QuizScore[]> => {
    return verifyAdminAndCall('getAllScores');
};

export const deleteUser = async (usernameToDelete: string): Promise<void> => {
    return verifyAdminAndCall('deleteUser', { usernameToDelete });
};

export const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    return verifyAdminAndCall('editUserPassword', { username, newPassword });
};
