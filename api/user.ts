
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, RedisClientType } from 'redis';
import * as bcrypt from 'bcryptjs';
import type { QuizScore, User, UserProfile } from '../types';

let redisClient: RedisClientType | null = null;

// --- Redis Client Getter ---
// Lazily initializes the client to ensure it's created only when needed.
const getRedisClient = async (): Promise<RedisClientType> => {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }
    if (!process.env.REDIS_URL) {
        throw new Error('Database is not configured correctly on the server. The REDIS_URL environment variable is missing.');
    }
    redisClient = createClient({
        url: process.env.REDIS_URL,
    });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    return redisClient;
};


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

// --- Initialize Admin Account in Redis ---
const initializeAdmin = async () => {
    try {
        const adminUsername = 'Rishi';
        const client = await getRedisClient();
        const adminExists = await client.exists(`user:${adminUsername}`);
        if (!adminExists) {
            const passwordHash = await bcrypt.hash('134679', 10);
            const adminUser: StoredUser = { username: adminUsername, isAdmin: true, passwordHash };
            const adminProfile: UserProfile = {
                quizzesCompleted: 0,
                totalScore: 0,
                totalQuestionsAttempted: 0,
                currentStreak: 0,
                lastQuizDate: null,
            };
            await Promise.all([
                client.set(`user:${adminUsername}`, JSON.stringify(adminUser)),
                client.set(`profile:${adminUsername}`, JSON.stringify(adminProfile))
            ]);
            console.log('Admin user "Rishi" created in Redis store.');
        }
    } catch (e) {
         if (process.env.NODE_ENV !== 'development') {
            console.warn('Could not initialize admin user, Redis store might not be configured yet.', e);
        }
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

        let userMessage = 'An internal server error occurred.';
        if (error instanceof Error) {
            if (error.message.includes('Database is not configured correctly')) {
                userMessage = error.message;
            }
        }
        
        return res.status(500).json({ error: userMessage });
    }
}


// --- Service Functions (Server-Side) ---

const register = async (username: string, password: string): Promise<User> => {
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
        throw new ApiError("Username and password must be non-empty strings.", 400);
    }
    if (password.length < 6) {
        throw new ApiError("Password must be at least 6 characters long.", 400);
    }
    
    const client = await getRedisClient();
    const userExists = await client.exists(`user:${username}`);
    if (userExists) {
        throw new ApiError("Username already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: StoredUser = { username, isAdmin: false, passwordHash };
    const newProfile: UserProfile = {
        quizzesCompleted: 0,
        totalScore: 0,
        totalQuestionsAttempted: 0,
        currentStreak: 0,
        lastQuizDate: null,
    };

    await Promise.all([
        client.set(`user:${username}`, JSON.stringify(newUser)),
        client.set(`profile:${username}`, JSON.stringify(newProfile))
    ]);

    const { passwordHash: _, ...userToReturn } = newUser;
    return userToReturn;
};

const login = async (username: string, password: string): Promise<User> => {
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
        throw new ApiError("Invalid username or password.", 401);
    }

    const client = await getRedisClient();
    const userJson = await client.get(`user:${username}`);
    if (!userJson) {
         throw new ApiError("Invalid username or password.", 401);
    }

    const storedUser: StoredUser = JSON.parse(userJson);
    if (typeof storedUser.passwordHash !== 'string' || !storedUser.passwordHash) {
        throw new ApiError("Invalid username or password.", 401);
    }
    
    let isPasswordValid = false;
    try {
        isPasswordValid = await bcrypt.compare(password, storedUser.passwordHash);
    } catch (compareError) {
        console.error(`[Bcrypt Error] Password comparison failed for user "${username}".`, compareError);
        throw new ApiError("Invalid username or password.", 401);
    }

    if (!isPasswordValid) {
        throw new ApiError("Invalid username or password.", 401);
    }
    
    const { passwordHash: _, ...userToReturn } = storedUser;
    return userToReturn;
};

const addQuizScore = async (username: string, score: number, total: number): Promise<void> => {
    const client = await getRedisClient();

    // Store individual score record for history/admin purposes
    const newScoreRecord: QuizScore = {
        username,
        score,
        total,
        date: new Date().toISOString(),
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    };
    const scoreKey = `score:${username}:${newScoreRecord.date}`;
    await client.set(scoreKey, JSON.stringify(newScoreRecord));

    // Update user's main profile for cumulative stats
    const profileJson = await client.get(`profile:${username}`);
    if (!profileJson) {
        // This case handles a user whose profile might have been deleted but they are still logged in.
        const newProfile: UserProfile = {
            quizzesCompleted: 1,
            totalScore: score,
            totalQuestionsAttempted: total,
            currentStreak: 1,
            lastQuizDate: new Date().toISOString(),
        };
        await client.set(`profile:${username}`, JSON.stringify(newProfile));
        await client.zAdd('leaderboard_cumulative', { score: newProfile.totalScore, value: username });
        return;
    }
    
    const profile: UserProfile = JSON.parse(profileJson);
    profile.quizzesCompleted += 1;
    profile.totalScore += score;
    // Safely add to totalQuestionsAttempted, initializing if it doesn't exist on older profiles
    profile.totalQuestionsAttempted = (profile.totalQuestionsAttempted || 0) + total;
    
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const lastQuizDay = profile.lastQuizDate ? new Date(profile.lastQuizDate) : null;
    if (lastQuizDay) lastQuizDay.setHours(0, 0, 0, 0);

    if (!lastQuizDay || lastQuizDay.getTime() < today.getTime()) {
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        profile.currentStreak = (lastQuizDay && lastQuizDay.getTime() === yesterday.getTime()) ? profile.currentStreak + 1 : 1;
        profile.lastQuizDate = today.toISOString();
    }
    await client.set(`profile:${username}`, JSON.stringify(profile));

    // Update the new cumulative leaderboard, ranked by total correct answers.
    await client.zAdd('leaderboard_cumulative', { score: profile.totalScore, value: username });
};

const getProfile = async (username: string): Promise<UserProfile> => {
    const client = await getRedisClient();
    const profileJson = await client.get(`profile:${username}`);
    if (!profileJson) {
        throw new ApiError("Profile not found.", 404);
    }
    return JSON.parse(profileJson);
};

const getLeaderboard = async (): Promise<QuizScore[]> => {
    const client = await getRedisClient();
    // Get top 20 usernames from the cumulative leaderboard, ranked by total correct answers.
    const usernames = await client.zRange('leaderboard_cumulative', 0, 19, { REV: true });
    if (usernames.length === 0) return [];

    const profileKeys = usernames.map(u => `profile:${u}`);
    const profileJsonArray = await client.mGet(profileKeys);
    
    const leaderboard: QuizScore[] = [];

    profileJsonArray.forEach((json, index) => {
        if (json) {
            const profile: UserProfile = JSON.parse(json);
            const username = usernames[index];
            
            const totalAttempted = profile.totalQuestionsAttempted || 0;

            leaderboard.push({
                username: username,
                score: profile.totalScore,
                total: totalAttempted,
                percentage: totalAttempted > 0 ? Math.round((profile.totalScore / totalAttempted) * 100) : 0,
                date: profile.lastQuizDate || new Date(0).toISOString(),
            });
        }
    });
    
    return leaderboard;
};


// --- Admin Functions (Server-Side) ---

const verifyAdmin = async (currentUser: User | null) => {
    if (!currentUser?.username) {
        throw new ApiError("Authentication required.", 401);
    }
    const client = await getRedisClient();
    const userJson = await client.get(`user:${currentUser.username}`);
    if (!userJson) throw new ApiError("Forbidden: Admin access required.", 403);

    const user: StoredUser = JSON.parse(userJson);
    if (!user.isAdmin) {
        throw new ApiError("Forbidden: Admin access required.", 403);
    }
};

const getAllUsers = async (): Promise<{ username: string }[]> => {
    const client = await getRedisClient();
    const userKeys = await client.keys('user:*');
    if (userKeys.length === 0) return [];

    const userJsonArray = await client.mGet(userKeys);
    const users: StoredUser[] = userJsonArray.filter(u => u).map(u => JSON.parse(u!));
    return users.map(u => ({ username: u.username }));
};

const getAllProfiles = async (): Promise<Record<string, UserProfile>> => {
    const client = await getRedisClient();
    const profileKeys = await client.keys('profile:*');
    if (profileKeys.length === 0) return {};
    
    const profileJsonArray = await client.mGet(profileKeys);
    const profiles: UserProfile[] = profileJsonArray.filter(p => p).map(p => JSON.parse(p!));

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
    const client = await getRedisClient();
    const scoreKeys = await client.keys('score:*');
    if(scoreKeys.length === 0) return [];
    
    const scoreJsonArray = await client.mGet(scoreKeys);
    return scoreJsonArray.filter(s => s).map(s => JSON.parse(s!));
};

const deleteUser = async (usernameToDelete: string): Promise<void> => {
    if (usernameToDelete === 'Rishi') throw new ApiError("Cannot delete the admin account.", 403);
    
    const client = await getRedisClient();
    
    // Use SCAN to safely find all score keys for the user without blocking the database,
    // which is crucial for performance as the user base grows.
    const scoreKeys: string[] = [];
    let cursor = 0;
    do {
        const reply = await client.scan(cursor, {
            MATCH: `score:${usernameToDelete}:*`,
            COUNT: 100 // Process in batches of 100
        });
        cursor = reply.cursor;
        scoreKeys.push(...reply.keys);
    } while (cursor !== 0);

    // Using a transaction to ensure all deletion operations succeed or fail together
    const multi = client.multi();
    
    // Remove user from all relevant leaderboards
    multi.zRem('leaderboard_cumulative', usernameToDelete);
    multi.zRem('leaderboard_avg', usernameToDelete); // For legacy cleanup

    // The old leaderboard stored individual score keys. Remove them if they exist.
    if (scoreKeys.length > 0) {
        multi.zRem('leaderboard_scores', scoreKeys);
    }

    // Prepare all user-related keys for deletion
    const keysToDelete = [
        `user:${usernameToDelete}`,
        `profile:${usernameToDelete}`,
        `agg_stats:${usernameToDelete}`, // legacy
        ...scoreKeys
    ];
    
    if (keysToDelete.length > 0) {
        multi.del(keysToDelete);
    }

    // Execute the transaction
    await multi.exec();
};

const editUserPassword = async (username: string, newPassword?: string): Promise<void> => {
    if (username === 'Rishi') throw new ApiError("Admin password cannot be changed from the panel.", 403);
    if (!newPassword || newPassword.length < 6) throw new ApiError("Password must be at least 6 characters.", 400);

    const client = await getRedisClient();
    const userJson = await client.get(`user:${username}`);
    if (!userJson) throw new ApiError("User not found.", 404);

    const user: StoredUser = JSON.parse(userJson);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await client.set(`user:${username}`, JSON.stringify(user));
};
