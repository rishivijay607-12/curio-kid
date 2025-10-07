import bcrypt from 'bcryptjs';
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

// --- Local Storage Keys ---
const USERS_KEY = 'curiosity_users';
const PROFILES_KEY = 'curiosity_profiles';
const SCORES_KEY = 'curiosity_scores';
const CURRENT_USER_KEY = 'curiosity_current_user';

// --- Helper Functions to interact with localStorage ---
const readStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
        console.error(`Failed to read from localStorage key "${key}":`, e);
        return defaultValue;
    }
};

const writeStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Failed to write to localStorage key "${key}":`, e);
    }
};


// --- Initialize Admin Account ---
const initializeAdmin = async () => {
    const users = readStorage<Record<string, any>>(USERS_KEY, {});
    if (!users['Rishi']) {
        const hashedPassword = await bcrypt.hash('134679', 10);
        users['Rishi'] = { username: 'Rishi', isAdmin: true, password: hashedPassword };
        writeStorage(USERS_KEY, users);
        
        const profiles = readStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
        profiles['Rishi'] = {
            quizzesCompleted: 0,
            totalScore: 0,
            currentStreak: 0,
            lastQuizDate: null,
        };
        writeStorage(PROFILES_KEY, profiles);
    }
};
// Initialize on script load
initializeAdmin();


// --- User Service Functions (Client-Side) ---

export const register = async (username: string, password: string): Promise<User> => {
    if (!username || !password) throw new ApiError("Username and password are required.", 400);
    if (password.length < 6) throw new ApiError("Password must be at least 6 characters long.", 400);
    
    const users = readStorage<Record<string, any>>(USERS_KEY, {});
    if (users[username]) {
        throw new ApiError("Username already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = { username, isAdmin: false };
    users[username] = { ...newUser, password: hashedPassword };
    writeStorage(USERS_KEY, users);

    // Create a profile for the new user
    const profiles = readStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    profiles[username] = {
        quizzesCompleted: 0,
        totalScore: 0,
        currentStreak: 0,
        lastQuizDate: null,
    };
    writeStorage(PROFILES_KEY, profiles);

    return newUser;
};

export const login = async (username: string, password: string): Promise<User> => {
    const users = readStorage<Record<string, any>>(USERS_KEY, {});
    const storedUser = users[username];

    if (!storedUser) {
        throw new ApiError("Invalid username or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, storedUser.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid username or password.", 401);
    }
    
    const { password: _, ...userToReturn } = storedUser;
    writeStorage(CURRENT_USER_KEY, userToReturn);
    return userToReturn;
};

export const getCurrentUser = (): User | null => {
    return readStorage<User | null>(CURRENT_USER_KEY, null);
};

export const logout = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const addQuizScore = async (username: string, score: number, total: number): Promise<void> => {
    const scores = readStorage<QuizScore[]>(SCORES_KEY, []);
    const newScore: QuizScore = {
        username,
        score,
        total,
        date: new Date().toISOString(),
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    };
    scores.push(newScore);
    writeStorage(SCORES_KEY, scores);

    // Update profile stats
    const profiles = readStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
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
        writeStorage(PROFILES_KEY, profiles);
    }
};


export const getProfile = async (username: string): Promise<UserProfile> => {
    const profiles = readStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    const profile = profiles[username];
    if (!profile) {
        throw new ApiError("Profile not found.", 404);
    }
    return profile;
};


export const getLeaderboard = async (): Promise<QuizScore[]> => {
    // For leaderboard, we only show the single best score for each user.
    const allScores = readStorage<QuizScore[]>(SCORES_KEY, []);
    const bestScores: { [username: string]: QuizScore } = {};

    for (const score of allScores) {
        if (!bestScores[score.username] || score.percentage > bestScores[score.username].percentage) {
            bestScores[score.username] = score;
        }
    }
    
    const leaderboard = Object.values(bestScores);
    leaderboard.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
    return leaderboard.slice(0, 20);
};

// --- Admin Functions ---
const verifyAdmin = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
        throw new ApiError("Forbidden: Admin access required.", 403);
    }
};

export const getAllUsers = async (): Promise<{ username: string }[]> => {
    verifyAdmin();
    const users = readStorage<Record<string, any>>(USERS_KEY, {});
    return Object.keys(users).map(username => ({ username }));
};

export const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    verifyAdmin();
    return readStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
};

export const getAllScores = async (): Promise<QuizScore[]> => {
    verifyAdmin();
    return readStorage<QuizScore[]>(SCORES_KEY, []);
};


export const deleteUser = async (usernameToDelete: string): Promise<void> => {
    verifyAdmin();
    if (usernameToDelete === 'Rishi') throw new ApiError("Cannot delete the admin account.", 403);

    const users = readStorage<Record<string, any>>(USERS_KEY, {});
    delete users[usernameToDelete];
    writeStorage(USERS_KEY, users);

    const profiles = readStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    delete profiles[usernameToDelete];
    writeStorage(PROFILES_KEY, profiles);

    const scores = readStorage<QuizScore[]>(SCORES_KEY, []);
    const updatedScores = scores.filter(s => s.username !== usernameToDelete);
    writeStorage(SCORES_KEY, updatedScores);
};

export const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    verifyAdmin();
    if (username === 'Rishi') throw new ApiError("Admin password cannot be changed from the panel.", 403);
    if (!newPassword || newPassword.length < 6) throw new ApiError("Password must be at least 6 characters.", 400);

    const users = readStorage<Record<string, any>>(USERS_KEY, {});
    const user = users[username];
    if (!user) throw new ApiError("User not found.", 404);

    user.password = await bcrypt.hash(newPassword, 10);
    writeStorage(USERS_KEY, users);
};
