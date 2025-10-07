import type { QuizScore, User, UserProfile } from '../types';

// --- localStorage Keys ---
const USERS_KEY = 'curiosity_users';
const PROFILES_KEY = 'curiosity_profiles';
const SCORES_KEY = 'curiosity_scores';
const CURRENT_USER_KEY = 'curiosity_current_user';

// --- Helper Functions for localStorage ---
const getStoredData = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn(`Could not read from localStorage key "${key}":`, e);
        return defaultValue;
    }
};

const setStoredData = (key: string, data: any): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`Could not write to localStorage key "${key}":`, e);
    }
};

// --- Local Session Management ---
const saveCurrentUser = (user: User) => {
    setStoredData(CURRENT_USER_KEY, user);
};

export const getCurrentUser = (): User | null => {
    return getStoredData<User | null>(CURRENT_USER_KEY, null);
};

export const logout = (): void => {
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
        console.warn("Could not clear user session from localStorage.");
    }
};

// --- Profile Creation ---
const createProfile = (username: string): UserProfile => {
    const profiles = getStoredData<Record<string, UserProfile>>(PROFILES_KEY, {});
    if (profiles[username]) {
        return profiles[username];
    }
    const newProfile: UserProfile = {
        quizzesCompleted: 0,
        totalScore: 0,
        currentStreak: 0,
        lastQuizDate: null,
    };
    profiles[username] = newProfile;
    setStoredData(PROFILES_KEY, profiles);
    return newProfile;
};


// --- Auth Functions (Now Local) ---
export const register = async (username: string, password: string): Promise<User> => {
    const users = getStoredData<Record<string, any>>(USERS_KEY, {});
    
    if (!username || !password) throw new Error("Username and password are required.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters long.");
    if (username.toLowerCase() === 'rishi') throw new Error("This username is reserved.");
    if (users[username]) {
        throw new Error("Username already exists.");
    }
    
    // NOTE: Storing password in plaintext is acceptable for a localStorage-based demo/offline app.
    // Do NOT do this in a real production app with a backend.
    users[username] = { username, password, isAdmin: false };
    setStoredData(USERS_KEY, users);
    
    createProfile(username);
    
    // Automatically log in after registration
    return login(username, password);
};

export const login = async (username: string, password: string): Promise<User> => {
    const users = getStoredData<Record<string, any>>(USERS_KEY, {});
    
    // Initialize admin user if it doesn't exist
    if (!users['Rishi']) {
        users['Rishi'] = { username: 'Rishi', password: '134679', isAdmin: true };
        setStoredData(USERS_KEY, users);
        createProfile('Rishi');
    }

    const storedUser = users[username];

    if (!storedUser || storedUser.password !== password) {
        throw new Error("Invalid username or password.");
    }

    const userToReturn: User = {
        username: storedUser.username,
        isAdmin: storedUser.isAdmin,
    };
    
    saveCurrentUser(userToReturn);
    return userToReturn;
};

// --- Data Functions (Now Local) ---
export const addQuizScore = async (username: string, score: number, total: number): Promise<void> => {
    const allScores = getStoredData<QuizScore[]>(SCORES_KEY, []);
    const newScore: QuizScore = {
        username,
        score,
        total,
        date: new Date().toISOString(),
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    };
    allScores.push(newScore);
    setStoredData(SCORES_KEY, allScores);

    // Update profile stats
    const profiles = getStoredData<Record<string, UserProfile>>(PROFILES_KEY, {});
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
        setStoredData(PROFILES_KEY, profiles);
    }
};

export const getLeaderboard = async (): Promise<QuizScore[]> => {
    const allScores = getStoredData<QuizScore[]>(SCORES_KEY, []);
    
    // Get the best score for each user
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

export const getProfile = async (username: string): Promise<UserProfile> => {
    const profiles = getStoredData<Record<string, UserProfile>>(PROFILES_KEY, {});
    if (!profiles[username]) {
        return createProfile(username);
    }
    return profiles[username];
};

// --- Admin Functions (Now Local) ---
export const getAllUsers = async (): Promise<{ username: string }[]> => {
    const users = getStoredData<Record<string, any>>(USERS_KEY, {});
    return Object.values(users).map(u => ({ username: u.username }));
};

export const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    return getStoredData<Record<string, UserProfile>>(PROFILES_KEY, {});
};

export const getAllScores = async (): Promise<QuizScore[]> => {
    return getStoredData<QuizScore[]>(SCORES_KEY, []);
};

export const deleteUser = async (usernameToDelete: string): Promise<void> => {
    if (usernameToDelete === 'Rishi') throw new Error("Cannot delete the admin account.");

    const users = getStoredData<Record<string, any>>(USERS_KEY, {});
    delete users[usernameToDelete];
    setStoredData(USERS_KEY, users);

    const profiles = getStoredData<Record<string, UserProfile>>(PROFILES_KEY, {});
    delete profiles[usernameToDelete];
    setStoredData(PROFILES_KEY, profiles);

    let scores = getStoredData<QuizScore[]>(SCORES_KEY, []);
    scores = scores.filter(s => s.username !== usernameToDelete);
    setStoredData(SCORES_KEY, scores);
};

export const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    if (username === 'Rishi') throw new Error("Admin password cannot be changed from the panel.");
    if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
    
    const users = getStoredData<Record<string, any>>(USERS_KEY, {});
    if (!users[username]) throw new Error("User not found.");
    
    users[username].password = newPassword;
    setStoredData(USERS_KEY, users);
};