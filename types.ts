
export type Grade = 6 | 7 | 8 | 9 | 10;
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type AppMode =
  | 'home'
  | 'quiz'
  | 'worksheet'
  | 'notes'
  | 'flashcards'
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
  | 'profile'
  | 'science_game'
  | 'science_game_selection'
  | 'game_element_match'
  | 'game_lab_safety'
  | 'game_planet_lineup'
  | 'game_state_of_matter'
  | 'game_scientific_method'
  | 'game_food_chain'
  | 'game_invention_timeline'
  | 'game_scientist_match'
  | 'game_science_riddles'
  | 'game_animal_kingdom'
  | 'game_lab_tool_match'
  | 'game_anatomy_quiz'
  | 'game_tic_tac_toe'
  | 'mystery_of_science'
  | 'multiplayer_quiz';

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

export interface Flashcard {
  term: string;
  definition: string;
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
    totalQuestionsAttempted: number;
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

export interface ScienceRiddle {
    riddle: string;
    options: string[];
    answer: string;
}

export interface SudokuPuzzle {
    puzzle: number[][];
    solution: number[][];
    difficulty: Difficulty;
}

export type TicTacToeBoard = ( 'X' | 'O' | null )[];

export interface MysteryState {
  story: string;
  choices: string[];
  isEnd: boolean;
}

// Multiplayer type definitions.
export interface MultiplayerPlayer {
    username: string;
    score: number;
    answeredThisRound: boolean;
}

export type MultiplayerGameStatus = 'lobby' | 'in_progress' | 'round_over' | 'finished';

export interface MultiplayerGameState {
    gameId: string;
    host: string;
    players: MultiplayerPlayer[];
    status: MultiplayerGameStatus;
    questions: QuizQuestion[];
    currentQuestionIndex: number;
    roundEndTime: number;
    isPublic: boolean;
    grade: Grade;
    topic: string;
    quizLength: number;
}

export interface AnalyticsLog {
    username: string;
    action: string;
    feature: string;
    details?: string;
    timestamp: string;
}
