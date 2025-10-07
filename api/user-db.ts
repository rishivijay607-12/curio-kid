import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import type { QuizScore, User, UserProfile } from '../types';

// Custom error for API responses
class ApiError extends Error {
    code: number;
    constructor(message: string, code = 500) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
    }
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { action, params, user: clientUser } = req.body;

    try {
        await initializeAdmin(); // Ensure admin user exists

        let result;
        switch (action) {
            case 'register': result = await register(params); break;
            case 'login': result = await login(params); break;
            case 'getProfile': result = await getProfile(params); break;
            case 'addQuizScore': result = await addQuizScore(params); break;
            case 'getLeaderboard': result = await getLeaderboard(); break;
            
            // Admin actions - require verification
            case 'getAllUsers': await verifyAdmin(clientUser); result = await getAllUsers(); break;
            case 'getAllProfiles': await verifyAdmin(clientUser); result = await getAllProfiles(); break;
            case 'getAllScores': await verifyAdmin(clientUser); result = await getAllScores(); break;
            case 'deleteUser': await verifyAdmin(clientUser); result = await deleteUser(params); break;
            case 'editUserPassword': await verifyAdmin(clientUser); result = await editUserPassword(params); break;
            
            default: throw new ApiError('Invalid action specified', 400);
        }
        return res.status(200).json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown server error occurred.';
        const code = error instanceof ApiError ? error.code : 500;
        console.error(`[USER_DB_ERROR] Action: ${action}, Error: ${message}`);
        return res.status(code).json({ error: message });
    }
}

// --- User Management ---
const createProfile = async (username: string): Promise<UserProfile> => {
    const key = `profiles:${username}`;
    const existingProfile: UserProfile | null = await kv.get(key);
    if (existingProfile) return existingProfile;

    const newProfile: UserProfile = {
        quizzesCompleted: 0,
        totalScore: 0,
        currentStreak: 0,
        lastQuizDate: null,
    };
    await kv.set(key, newProfile);
    return newProfile;
};

const register = async ({ username, password }: any): Promise<User> => {
    if (!username || !password) throw new ApiError("Username and password are required.", 400);
    if (password.length < 6) throw new ApiError("Password must be at least 6 characters long.", 400);
    if (username.toLowerCase() === 'rishi') throw new ApiError("This username is reserved.", 400);

    const key = `users:${username}`;
    const existingUser: User | null = await kv.get(key);
    if (existingUser) {
        throw new ApiError("Username already exists.", 409); // 409 Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = { username, isAdmin: false };
    const userWithPassword = { ...newUser, password: hashedPassword };

    await kv.set(key, userWithPassword);
    await createProfile(username);

    return newUser; // Return user object without password
};

const login = async ({ username, password }: any): Promise<User> => {
    if (!username || !password) throw new ApiError("Username and password are required.", 400);

    const key = `users:${username}`;
    const storedUser: (User & { password?: string }) | null = await kv.get(key);

    if (!storedUser || !storedUser.password) {
        throw new ApiError("Invalid username or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, storedUser.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid username or password.", 401);
    }
    
    const { password: _, ...userToReturn } = storedUser;
    return userToReturn;
};


// --- Data Management ---
const addQuizScore = async ({ username, score, total }: any): Promise<void> => {
    const scores: QuizScore[] = await kv.get('scores') || [];
    const newScore: QuizScore = {
        username,
        score,
        total,
        date: new Date().toISOString(),
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    };
    
    const userBestScoreIndex = scores.findIndex(s => s.username === username);
    if (userBestScoreIndex > -1) {
        if (newScore.percentage > scores[userBestScoreIndex].percentage) {
            scores[userBestScoreIndex] = newScore;
        }
    } else {
        scores.push(newScore);
    }
    await kv.set('scores', scores);

    // Update profile stats
    const profile: UserProfile | null = await kv.get(`profiles:${username}`);
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
        await kv.set(`profiles:${username}`, profile);
    }
};

const getProfile = async ({ username }: any): Promise<UserProfile> => {
    const profile: UserProfile | null = await kv.get(`profiles:${username}`);
    if (!profile) return createProfile(username);
    return profile;
};

const getLeaderboard = async (): Promise<QuizScore[]> => {
    const scores: QuizScore[] = await kv.get('scores') || [];
    scores.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
    return scores.slice(0, 20);
};


// --- Admin ---
const initializeAdmin = async () => {
    const adminUser: User | null = await kv.get('users:Rishi');
    if (!adminUser) {
        const hashedPassword = await bcrypt.hash('134679', 10);
        await kv.set('users:Rishi', { username: 'Rishi', isAdmin: true, password: hashedPassword });
        await createProfile('Rishi');
    }
};

const verifyAdmin = async (clientUser: User | null) => {
    if (!clientUser || !clientUser.username) throw new ApiError("Authentication required.", 401);
    const storedUser: User | null = await kv.get(`users:${clientUser.username}`);
    if (!storedUser || !storedUser.isAdmin) throw new ApiError("Forbidden: Admin access required.", 403);
};

const getAllUsers = async (): Promise<{ username: string }[]> => {
    const userKeys = [];
    for await (const key of kv.scanIterator({ match: 'users:*' })) {
        userKeys.push(key);
    }
    const users: (User & { password?: string })[] = userKeys.length > 0 ? await kv.mget(...userKeys) : [];
    return users.map(u => ({ username: u.username }));
};

const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    const profileKeys: string[] = [];
    for await (const key of kv.scanIterator({ match: 'profiles:*' })) {
        profileKeys.push(key);
    }
    if (profileKeys.length === 0) return {};

    const profiles: UserProfile[] = await kv.mget(...profileKeys);
    const profileMap: Record<string, UserProfile> = {};
    profileKeys.forEach((key, index) => {
        const username = key.replace('profiles:', '');
        profileMap[username] = profiles[index];
    });
    return profileMap;
};

const getAllScores = async (): Promise<QuizScore[]> => {
    return await kv.get('scores') || [];
};

const deleteUser = async ({ usernameToDelete }: any): Promise<void> => {
    if (usernameToDelete === 'Rishi') throw new ApiError("Cannot delete the admin account.", 403);
    await kv.del(`users:${usernameToDelete}`);
    await kv.del(`profiles:${usernameToDelete}`);
    const scores: QuizScore[] = await kv.get('scores') || [];
    const updatedScores = scores.filter(s => s.username !== usernameToDelete);
    await kv.set('scores', updatedScores);
};

const editUserPassword = async ({ username, newPassword }: any): Promise<void> => {
    if (username === 'Rishi') throw new ApiError("Admin password cannot be changed from the panel.", 403);
    if (!newPassword || newPassword.length < 6) throw new ApiError("Password must be at least 6 characters.", 400);

    const key = `users:${username}`;
    const storedUser: (User & { password?: string }) | null = await kv.get(key);
    if (!storedUser) throw new ApiError("User not found.", 404);

    storedUser.password = await bcrypt.hash(newPassword, 10);
    await kv.set(key, storedUser);
};
