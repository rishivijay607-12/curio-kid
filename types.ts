export type Grade = 6 | 7 | 8 | 9 | 10;
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type AppMode =
  | 'home'
  | 'quiz'
  | 'worksheet'
  | 'notes'
  | 'diagram'
  | 'doubt_solver'
  | 'chat_with_history'
  | 'concept_deep_dive'
  | 'virtual_lab'
  | 'real_world_links'
  | 'story_weaver'
  | 'what_if'
  | 'science_lens'
  | 'science_fair_buddy'
  | 'voice_tutor'
  | 'leaderboard'
  | 'profile';

export type QuestionType = 'MCQ' | 'True/False' | 'Assertion/Reason' | 'Q&A';

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  reason?: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface NoteSection {
  title: string;
  points: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export type Language =
  | 'English'
  | 'English+Tamil'
  | 'English+Malayalam'
  | 'English+Hindi'
  | 'English+Telugu'
  | 'English+Kannada';

export interface Scientist {
  name: string;
  field: string;
  description: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GenerativeTextResult {
  text: string;
  sources?: GroundingChunk[];
}

export interface DiagramIdea {
  id: string;
  description: string;
}

export interface Diagram {
  id: string;
  idea: DiagramIdea;
  image?: string; // base64 data URL, optional now
  status: 'pending' | 'complete' | 'failed';
  error?: string;
}

export interface ScienceFairIdea {
    id?: string;
    title: string;
    description: string;
}

export interface ScienceFairPlanStep {
    stepTitle: string;
    instructions: string;
}

export interface QuizScore {
    username: string;
    score: number;
    total: number;
    percentage: number;
    date: string; // ISO date string
}

export interface User {
    username: string;
    isAdmin: boolean;
}

export interface UserProfile {
    quizzesCompleted: number;
    totalScore: number;
    currentStreak: number;
    lastQuizDate: string | null; // ISO date string
}

export type GenerationStatus = 'pending' | 'in-progress' | 'complete' | 'failed' | 'skipped';

export interface GenerationLogEntry {
    id: string;
    title: string;
    status: GenerationStatus;
    error?: string;
}