import type { QuizScore, User, UserProfile } from '../types';

const CURRENT_USER_KEY = 'curiosity_current_user';

class ApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// --- API Helper ---
const callDbApi = async <T>(action: string, params: object = {}): Promise<T> => {
    const currentUser = getCurrentUser(); // Get user from local storage for auth
    const response = await fetch('/api/user-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params, user: currentUser }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(data.error || `Server error: ${response.status}`);
    }

    return data as T;
};

// --- Local Session Management ---
const saveCurrentUser = (user: User) => {
    try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.warn("Could not save user session to localStorage.");
    }
};

export const getCurrentUser = (): User | null => {
    try {
        const item = localStorage.getItem(CURRENT_USER_KEY);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn("Could not read user session from localStorage.");
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

// --- Auth Functions ---
export const register = async (username: string, password: string): Promise<User> => {
    const user = await callDbApi<User>('register', { username, password });
    // After successful registration, log the user in to create a session
    await login(username, password);
    return user;
};

export const login = async (username: string, password: string): Promise<User> => {
    const user = await callDbApi<User>('login', { username, password });
    saveCurrentUser(user);
    return user;
};

// --- Data Functions ---
export const addQuizScore = (username: string, score: number, total: number): Promise<void> => {
    return callDbApi('addQuizScore', { username, score, total });
};

export const getLeaderboard = (): Promise<QuizScore[]> => {
    return callDbApi<QuizScore[]>('getLeaderboard');
};

export const getProfile = (username: string): Promise<UserProfile> => {
    return callDbApi<UserProfile>('getProfile', { username });
};

// --- Admin Functions ---
export const getAllUsers = (): Promise<{ username: string }[]> => {
    return callDbApi<{ username: string }[]>('getAllUsers');
};

export const getAllProfiles = (): Promise<Record<string, UserProfile>> => {
    return callDbApi<Record<string, UserProfile>>('getAllProfiles');
};

export const getAllScores = (): Promise<QuizScore[]> => {
    return callDbApi<QuizScore[]>('getAllScores');
};

export const deleteUser = (usernameToDelete: string): Promise<void> => {
    return callDbApi('deleteUser', { usernameToDelete });
};

export const editUserPassword = (username: string, newPassword?: string): Promise<void> => {
    return callDbApi('editUserPassword', { username, newPassword });
};