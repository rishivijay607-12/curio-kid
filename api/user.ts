import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import * as bcrypt from 'bcryptjs';
import type { QuizScore, User, UserProfile } from '../types';

// More specific type for stored user data, including password hash
interface StoredUser extends User {
    passwordHash: string;
}

// Custom error for API logic
class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// --- Initialize Admin Account in KV ---
const initializeAdmin = async () => {
    const adminUsername = 'Rishi';
    const adminExists = await kv.exists(`user:${adminUsername}`);
    if (!adminExists) {
        const passwordHash = await bcrypt.hash('134679', 10);
        const adminUser: StoredUser = { username: adminUsername, isAdmin: true, passwordHash };
        const adminProfile: UserProfile = {
            quizzesCompleted: 0,
            totalScore: 0,
            currentStreak: 0,
            lastQuizDate: null,
        };
        await Promise.all([
            kv.set(`user:${adminUsername}`, adminUser),
            kv.set(`profile:${adminUsername}`, adminProfile)
        ]);
        console.log('Admin user "Rishi" created in KV store.');
    }
};

initializeAdmin().catch(console.error);


// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, params } = req.body;
    if (!action) {
        return res.status(400).json({ error: 'Bad Request: Missing action.' });
    }

    try {
        let result: any;
        switch (action) {
            case 'register':
                result = await register(params.username, params.password);
                break;
            case 'login':
                result = await login(params.username, params.password);
                break;
            case 'addQuizScore':
                result = await addQuizScore(params.username, params.score, params.total);
                break;
            case 'getProfile':
                result = await getProfile(params.username);
                break;
            case 'getLeaderboard':
                result = await getLeaderboard();
                break;
            // Admin actions
            case 'getAllUsers':
                await verifyAdmin(params.currentUser);
                result = await getAllUsers();
                break;
            case 'getAllProfiles':
                await verifyAdmin(params.currentUser);
                result = await getAllProfiles();
                break;
            case 'getAllScores':
                await verifyAdmin(params.currentUser);
                result = await getAllScores();
                break;
            case 'deleteUser':
                 await verifyAdmin(params.currentUser);
                result = await deleteUser(params.usernameToDelete);
                break;
            case 'editUserPassword':
                await verifyAdmin(params.currentUser);
                result = await editUserPassword(params.username, params.newPassword);
                break;
            default:
                throw new ApiError('Invalid action specified.', 400);
        }
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error(`[USER_API_ERROR] Action: "${action}" failed:`, error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
}


// --- Service Functions (Server-Side) ---

const register = async (username: string, password: string): Promise<User> => {
    if (!username || !password) throw new ApiError("Username and password are required.", 400);
    if (password.length < 6) throw new ApiError("Password must be at least 6 characters long.", 400);
    
    const userExists = await kv.exists(`user:${username}`);
    if (userExists) {
        throw new ApiError("Username already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: StoredUser = { username, isAdmin: false, passwordHash };
    const newProfile: UserProfile = {
        quizzesCompleted: 0,
        totalScore: 0,
        currentStreak: 0,
        lastQuizDate: null,
    };

    await Promise.all([
        kv.set(`user:${username}`, newUser),
        kv.set(`profile:${username}`, newProfile)
    ]);

    const { passwordHash: _, ...userToReturn } = newUser;
    return userToReturn;
};

const login = async (username: string, password: string): Promise<User> => {
    const storedUser = await kv.get<StoredUser>(`user:${username}`);
    if (!storedUser) {
        throw new ApiError("Invalid username or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, storedUser.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError("Invalid username or password.", 401);
    }
    
    const { passwordHash: _, ...userToReturn } = storedUser;
    return userToReturn;
};

const addQuizScore = async (username: string, score: number, total: number): Promise<void> => {
    const newScore: QuizScore = {
        username,
        score,
        total,
        date: new Date().toISOString(),
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    };
    // Scores are stored in a sorted set by percentage for easy leaderboard fetching.
    // The member is a unique string to prevent overwrites.
    await kv.zadd('scores', { score: newScore.percentage, member: `${username}:${newScore.date}` });
    await kv.set(`score:${username}:${newScore.date}`, newScore); // Store full score object

    const profile = await kv.get<UserProfile>(`profile:${username}`);
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
        await kv.set(`profile:${username}`, profile);
    }
};

const getProfile = async (username: string): Promise<UserProfile> => {
    const profile = await kv.get<UserProfile>(`profile:${username}`);
    if (!profile) {
        throw new ApiError("Profile not found.", 404);
    }
    return profile;
};

const getLeaderboard = async (): Promise<QuizScore[]> => {
    const scoreKeys = await kv.zrevrange('scores', 0, 100); // Get top 100 score keys
    if (scoreKeys.length === 0) return [];

    const allScores: (QuizScore | null)[] = await kv.mget(...scoreKeys.map(key => `score:${key}`));
    
    const bestScores: { [username: string]: QuizScore } = {};
    for (const score of allScores) {
        if(score){
             if (!bestScores[score.username] || score.percentage > bestScores[score.username].percentage) {
                bestScores[score.username] = score;
            }
        }
    }
    
    const leaderboard = Object.values(bestScores);
    leaderboard.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
    return leaderboard.slice(0, 20);
};

// --- Admin Functions (Server-Side) ---

const verifyAdmin = async (currentUser: User | null) => {
    if (!currentUser?.username) {
        throw new ApiError("Authentication required.", 401);
    }
    const user = await kv.get<StoredUser>(`user:${currentUser.username}`);
    if (!user || !user.isAdmin) {
        throw new ApiError("Forbidden: Admin access required.", 403);
    }
};

const getAllUsers = async (): Promise<{ username: string }[]> => {
    const userKeys = await kv.keys('user:*');
    if (userKeys.length === 0) return [];
    const users = await kv.mget<StoredUser[]>(...userKeys);
    
    // FIX: Check if the entire mget result is null, which can happen.
    if (!users) {
        return [];
    }

    return users.filter((u): u is StoredUser => u !== null).map(u => ({ username: u.username }));
};

const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    const profileKeys = await kv.keys('profile:*');
     if (profileKeys.length === 0) return {};
    const profiles = await kv.mget<UserProfile[]>(...profileKeys);
    
    // FIX: Check if the entire mget result is null.
    if (!profiles) {
        return {};
    }

    const profileMap: Record<string, UserProfile> = {};
    profileKeys.forEach((key, index) => {
        const profile = profiles[index];
        if (profile) {
            const username = key.replace('profile:', '');
            profileMap[username] = profile;
        }
    });
    return profileMap;
};

const getAllScores = async (): Promise<QuizScore[]> => {
    const scoreKeys = await kv.keys('score:*');
    if(scoreKeys.length === 0) return [];
    const scores = await kv.mget<QuizScore[]>(...scoreKeys);
    
    // FIX: Check if the entire mget result is null.
    if (!scores) {
        return [];
    }

    return scores.filter((score): score is QuizScore => score !== null);
};

const deleteUser = async (usernameToDelete: string): Promise<void> => {
    if (usernameToDelete === 'Rishi') throw new ApiError("Cannot delete the admin account.", 403);
    
    await kv.del(`user:${usernameToDelete}`, `profile:${usernameToDelete}`);
    
    // This is less efficient but necessary for KV without complex querying
    const scoreKeys = await kv.keys(`score:${usernameToDelete}:*`);
    if(scoreKeys.length > 0) await kv.del(...scoreKeys);

    const scoreMembers = await kv.zrange('scores', 0, -1);
    const userScoreMembers = scoreMembers.filter(member => typeof member === 'string' && member.startsWith(`${usernameToDelete}:`));
    if(userScoreMembers.length > 0) await kv.zrem('scores', ...userScoreMembers);
};

const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    if (username === 'Rishi') throw new ApiError("Admin password cannot be changed from the panel.", 403);
    if (!newPassword || newPassword.length < 6) throw new ApiError("Password must be at least 6 characters.", 400);

    const user = await kv.get<StoredUser>(`user:${username}`);
    if (!user) throw new ApiError("User not found.", 404);

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await kv.set(`user:${username}`, user);
};