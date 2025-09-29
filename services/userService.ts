import type { QuizScore, UserStats } from '../types';

const USERS_KEY = 'curiosity_users';
const SCORES_KEY = 'curiosity_scores';
const CURRENT_USER_KEY = 'curiosity_current_user';

// Helper to get users from localStorage
const getUsers = (): Record<string, string> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (e) {
    return {};
  }
};

// Helper to save users to localStorage
const saveUsers = (users: Record<string, string>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const register = async (username: string, password: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      if (users[username]) {
        reject(new Error("Username already exists."));
        return;
      }
      users[username] = password; // In a real app, hash the password!
      saveUsers(users);
      resolve(true);
    }, 500);
  });
};

export const login = async (username: string, password: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      if (!users[username] || users[username] !== password) {
        reject(new Error("Invalid username or password."));
        return;
      }
      localStorage.setItem(CURRENT_USER_KEY, username);
      resolve(true);
    }, 500);
  });
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

export const getQuizScores = async (): Promise<QuizScore[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const scores = localStorage.getItem(SCORES_KEY);
        const parsedScores: QuizScore[] = scores ? JSON.parse(scores) : [];
        // Sort scores by percentage desc, then score desc
        parsedScores.sort((a, b) => {
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage;
          }
          return b.score - a.score;
        });
        resolve(parsedScores.slice(0, 20)); // Return top 20
      } catch (e) {
        resolve([]);
      }
    }, 300);
  });
};

export const saveQuizScore = async (score: Omit<QuizScore, 'date' | 'percentage'>): Promise<void> => {
  return new Promise((resolve) => {
    let parsedScores: QuizScore[] = [];
    try {
        const scores = localStorage.getItem(SCORES_KEY);
        parsedScores = scores ? JSON.parse(scores) : [];
    } catch(e) {
        parsedScores = [];
    }
    
    const newScore: QuizScore = {
      ...score,
      date: new Date().toISOString(),
      percentage: score.total > 0 ? Math.round((score.score / score.total) * 100) : 0,
    };

    parsedScores.push(newScore);
    localStorage.setItem(SCORES_KEY, JSON.stringify(parsedScores));
    resolve();
  });
};


export const getUserStats = async (username: string): Promise<UserStats> => {
    return new Promise((resolve) => {
        let parsedScores: QuizScore[] = [];
        try {
            const scores = localStorage.getItem(SCORES_KEY);
            parsedScores = scores ? JSON.parse(scores) : [];
        } catch (e) {
            parsedScores = [];
        }
        
        const userScores = parsedScores.filter(s => s.username === username);

        const quizzesTaken = userScores.length;
        const totalPercentage = userScores.reduce((acc, s) => acc + s.percentage, 0);
        const averageScore = quizzesTaken > 0 ? Math.round(totalPercentage / quizzesTaken) : 0;
        
        // This is a mock value for now
        const worksheetsCompleted = userScores.filter(s => s.total > 10).length;

        resolve({
            quizzesTaken,
            averageScore,
            worksheetsCompleted,
        });
    });
};
