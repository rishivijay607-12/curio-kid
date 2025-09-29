import type { QuizScore, User, UserProfile } from '../types';

const USERS_KEY = 'curiosity_users';
const PROFILES_KEY = 'curiosity_profiles';
const SCORES_KEY = 'curiosity_scores';
const CURRENT_USER_KEY = 'curiosity_current_user';

// --- Helper Functions ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- Profile Management ---
const createProfile = async (username: string): Promise<UserProfile> => {
    const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    if (profiles[username]) {
        return profiles[username]; // Profile already exists
    }
    const newProfile: UserProfile = {
        quizzesCompleted: 0,
        totalScore: 0,
        currentStreak: 0,
        lastQuizDate: null,
    };
    profiles[username] = newProfile;
    saveToStorage(PROFILES_KEY, profiles);
    return newProfile;
}

export const getProfile = async (username: string): Promise<UserProfile> => {
    const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    if (!profiles[username]) {
        return createProfile(username);
    }
    return profiles[username];
}

export const updateProfile = async (username: string, updatedProfile: UserProfile): Promise<UserProfile> => {
    const profiles = getFromStorage<Record<string, UserProfile>>(PROFILES_KEY, {});
    profiles[username] = updatedProfile;
    saveToStorage(PROFILES_KEY, profiles);
    return updatedProfile;
}

// --- Auth Management ---
export const register = async (username: string, password: string): Promise<User> => {
  const users = getFromStorage<Record<string, string>>(USERS_KEY, {});
  if (users[username]) {
    throw new Error("Username already exists.");
  }
  users[username] = password; // In a real app, hash the password!
  saveToStorage(USERS_KEY, users);
  await createProfile(username);
  return { username };
};

export const login = async (username: string, password: string): Promise<User> => {
  const users = getFromStorage<Record<string, string>>(USERS_KEY, {});
  if (!users[username] || users[username] !== password) {
    throw new Error("Invalid username or password.");
  }
  saveToStorage(CURRENT_USER_KEY, { username });
  return { username };
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  return getFromStorage<User | null>(CURRENT_USER_KEY, null);
};


// --- Leaderboard/Score Management ---
export const addQuizScore = async (username: string, score: number, total: number): Promise<void> => {
    const scores = getFromStorage<QuizScore[]>(SCORES_KEY, []);
    
    const newScore: QuizScore = {
      username,
      score,
      total,
      date: new Date().toISOString(),
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    };

    // Keep only the user's best score
    const userScores = scores.filter(s => s.username === username);
    const otherScores = scores.filter(s => s.username !== username);
    
    if (userScores.length > 0) {
        const bestScore = userScores.reduce((best, current) => current.percentage > best.percentage ? current : best);
        if (newScore.percentage > bestScore.percentage) {
            saveToStorage(SCORES_KEY, [...otherScores, newScore]);
        }
    } else {
         scores.push(newScore);
         saveToStorage(SCORES_KEY, scores);
    }

    // Update user profile stats
    const profile = await getProfile(username);
    profile.quizzesCompleted += 1;
    profile.totalScore += score;
    
    // Streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastQuizDay = profile.lastQuizDate ? new Date(profile.lastQuizDate) : null;
    if(lastQuizDay) {
        lastQuizDay.setHours(0, 0, 0, 0);
    }
   
    if (!lastQuizDay || lastQuizDay.getTime() < today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastQuizDay && lastQuizDay.getTime() === yesterday.getTime()) {
            profile.currentStreak += 1;
        } else {
            profile.currentStreak = 1;
        }
        profile.lastQuizDate = today.toISOString();
    }
    
    await updateProfile(username, profile);
};

export const getLeaderboard = async (): Promise<QuizScore[]> => {
    const scores = getFromStorage<QuizScore[]>(SCORES_KEY, []);
    // Sort scores by percentage desc, then score desc
    scores.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return b.score - a.score;
    });
    return scores.slice(0, 20); // Return top 20
};
