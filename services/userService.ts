
import bcrypt from 'bcryptjs';
import type { QuizScore, User, UserProfile } from '../types';

// Custom error for local service responses, mimicking API errors.
export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// --- localStorage Keys ---
const CURRENT_USER_KEY = 'curiosity_current_user';
const USERS_KEY = 'curiosity_users';
const PROFILES_KEY = 'curiosity_profiles';
const SCORES_KEY = 'curiosity_scores'; // This will store the single best score per user for the leaderboard.

// --- Helper functions for localStorage access ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn(`Could not read from localStorage key "${key}":`, e);
        return defaultValue;
    }
};

const saveToStorage = (key: string, value: any): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Could not write to localStorage key "${key}":`, e);
    }
};

// --- Initialization ---
// Ensure the admin user exists on first load.
const initializeDatabase = async () => {
    const users = getFromStorage<Record<string, User & { password?: string }>>(USERS_KEY, {});
    if (!users['Rishi']) {
        const hashedPassword = await bcrypt.hash('134679', 10);
        users['Rishi'] = { username: 'Rishi', isAdmin: true, password: hashedPassword };
        saveToStorage(USERS_KEY, users);

        const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
        profiles['Rishi'] = {
            quizzesCompleted: 0,
            totalScore: 0,
            currentStreak: 0,
            lastQuizDate: null,
        };
        saveToStorage(PROFILES_KEY, profiles);
    }
};

let isInitialized = false;
const ensureInitialized = async () => {
    if (!isInitialized) {
        await initializeDatabase();
        isInitialized = true;
    }
};


// --- Local Session Management (Unchanged) ---
const saveCurrentUser = (user: User) => {
    saveToStorage(CURRENT_USER_KEY, user);
};

export const getCurrentUser = (): User | null => {
    return getFromStorage<User | null>(CURRENT_USER_KEY, null);
};

export const logout = (): void => {
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
        console.warn("Could not clear user session from localStorage.");
    }
};


// --- Auth Functions (Rewritten for localStorage) ---
export const register = async (username: string, password: string): Promise<User> => {
    await ensureInitialized();

    if (!username || !password) throw new ApiError("Username and password are required.", 400);
    if (password.length < 6) throw new ApiError("Password must be at least 6 characters long.", 400);
    if (username.toLowerCase() === 'rishi') throw new ApiError("This username is reserved.", 400);

    const users = getFromStorage<Record<string, User & { password?: string }>>(USERS_KEY, {});
    if (users[username]) {
        throw new ApiError("Username already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = { username, isAdmin: false };
    users[username] = { ...newUser, password: hashedPassword };
    saveToStorage(USERS_KEY, users);

    // Create profile
    const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    profiles[username] = {
        quizzesCompleted: 0,
        totalScore: 0,
        currentStreak: 0,
        lastQuizDate: null,
    };
    saveToStorage(PROFILES_KEY, profiles);
    
    // Log in the new user
    return login(username, password);
};

export const login = async (username: string, password: string): Promise<User> => {
    await ensureInitialized();

    if (!username || !password) throw new ApiError("Username and password are required.", 400);
    
    const users = getFromStorage<Record<string, User & { password?: string }>>(USERS_KEY, {});
    const storedUser = users[username];

    if (!storedUser || !storedUser.password) {
        throw new ApiError("Invalid username or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, storedUser.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid username or password.", 401);
    }
    
    const { password: _, ...userToReturn } = storedUser;
    saveCurrentUser(userToReturn);
    return userToReturn;
};

// --- Data Functions (Rewritten for localStorage) ---
export const addQuizScore = async (username:string, score: number, total: number): Promise<void> => {
    await ensureInitialized();
    
    // Update Leaderboard scores
    const scores = getFromStorage<QuizScore[]>(SCORES_KEY, []);
    const newScore: QuizScore = {
        username,
        score,
        total,
        date: new Date().toISOString(),
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    };
    
    const userBestScoreIndex = scores.findIndex(s => s.username === username);
    if (userBestScoreIndex > -1) {
        // Replace if new score is better
        if (newScore.percentage > scores[userBestScoreIndex].percentage) {
            scores[userBestScoreIndex] = newScore;
        }
    } else {
        scores.push(newScore);
    }
    saveToStorage(SCORES_KEY, scores);

    // Update profile stats
    const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    const profile = profiles[username];
    if (profile) {
        profile.quizzesCompleted += 1;
        profile.totalScore += score;

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const lastQuizDay = profile.lastQuizDate ? new Date(profile.lastQuizDate) : null;
        if(lastQuizDay) lastQuizDay.setHours(0, 0, 0, 0);

        if (!lastQuizDay || lastQuizDay.getTime() < today.getTime()) {
            const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
            profile.currentStreak = (lastQuizDay && lastQuizDay.getTime() === yesterday.getTime()) ? profile.currentStreak + 1 : 1;
            profile.lastQuizDate = today.toISOString();
        }
        profiles[username] = profile;
        saveToStorage(PROFILES_KEY, profiles);
    }
    return Promise.resolve();
};

export const getLeaderboard = async (): Promise<QuizScore[]> => {
    await ensureInitialized();
    const scores = getFromStorage<QuizScore[]>(SCORES_KEY, []);
    scores.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
    return Promise.resolve(scores.slice(0, 20));
};

export const getProfile = async (username: string): Promise<UserProfile> => {
    await ensureInitialized();
    const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    if (!profiles[username]) {
        // This case should ideally not happen if profile is created on register
        profiles[username] = {
            quizzesCompleted: 0,
            totalScore: 0,
            currentStreak: 0,
            lastQuizDate: null,
        };
        saveToStorage(PROFILES_KEY, profiles);
    }
    return Promise.resolve(profiles[username]);
};

// --- Admin Functions ---
const verifyAdmin = (): User => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
        throw new ApiError("Forbidden: Admin access required.", 403);
    }
    return currentUser;
};

export const getAllUsers = async (): Promise<{ username: string }[]> => {
    await ensureInitialized();
    verifyAdmin();
    const users = getFromStorage<Record<string, User>>(USERS_KEY, {});
    return Promise.resolve(Object.keys(users).map(username => ({ username })));
};

export const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    await ensureInitialized();
    verifyAdmin();
    return Promise.resolve(getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {}));
};

export const getAllScores = async (): Promise<QuizScore[]> => {
    await ensureInitialized();
    verifyAdmin();
    return Promise.resolve(getFromStorage<QuizScore[]>(SCORES_KEY, []));
};

export const deleteUser = async (usernameToDelete: string): Promise<void> => {
    await ensureInitialized();
    verifyAdmin();
    if (usernameToDelete === 'Rishi') throw new ApiError("Cannot delete the admin account.", 403);

    const users = getFromStorage<Record<string, User>>(USERS_KEY, {});
    delete users[usernameToDelete];
    saveToStorage(USERS_KEY, users);

    const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    delete profiles[usernameToDelete];
    saveToStorage(PROFILES_KEY, profiles);

    const scores = getFromStorage<QuizScore[]>(SCORES_KEY, []);
    const updatedScores = scores.filter(s => s.username !== usernameToDelete);
    saveToStorage(SCORES_KEY, updatedScores);
    
    return Promise.resolve();
};

export const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    await ensureInitialized();
    verifyAdmin();
    if (username === 'Rishi') throw new ApiError("Admin password cannot be changed from the panel.", 403);
    if (!newPassword || newPassword.length < 6) throw new ApiError("Password must be at least 6 characters.", 400);

    const users = getFromStorage<Record<string, User & { password?: string }>>(USERS_KEY, {});
    const user = users[username];
    if (!user) throw new ApiError("User not found.", 404);

    user.password = await bcrypt.hash(newPassword, 10);
    saveToStorage(USERS_KEY, users);

    return Promise.resolve();
};
