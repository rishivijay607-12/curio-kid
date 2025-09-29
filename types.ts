export type QuestionType = 'MCQ' | 'True/False' | 'Assertion/Reason' | 'Q&A';

export interface QuizQuestion {
  type: QuestionType;
  question: string; // For MCQ/T-F/Q&A, this is the question. For A/R, this is the Assertion.
  reason?: string; // For Assertion/Reason questions, this is the Reason.
  options: string[]; // Empty for Q&A type
  answer: string;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface NoteSection {
  title: string;
  points: string[];
}

export interface DiagramIdea {
  id: string;
  prompt: string;
  description: string;
}

export interface Diagram {
  id: string;
  prompt: string;
  image: string; // base64 encoded image
  description: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}

export interface GenerativeTextResult {
    text: string;
    sources?: GroundingChunk[];
}


export enum GameState {
  LOGIN_SCREEN,
  HOME_SCREEN,
  GRADE_SELECTION,
  LANGUAGE_SELECTION,
  TOPIC_SELECTION,
  DIFFICULTY_SELECTION,
  QUESTION_NUMBER_SELECTION,
  TIMER_SELECTION,
  WORKSHEET_COUNT_SELECTION,
  PLAYING,
  FINISHED,
  WORKSHEET_GENERATED,
  NOTES_GENERATED,
  DIAGRAM_IDEAS_SELECTION,
  DIAGRAM_GENERATOR,
  DOUBT_SOLVER,
  GENERATIVE_TEXT_INPUT,
  SCIENCE_LENS_INPUT,
  VOICE_TUTOR_LANGUAGE_SELECTION,
  VOICE_TUTOR_SESSION,
}

export type AppMode = 
  | 'quiz' 
  | 'worksheet' 
  | 'notes' 
  | 'diagram'
  | 'science_lens'
  | 'concept_deep_dive'
  | 'virtual_lab'
  | 'real_world_links'
  | 'chat_with_history'
  | 'story_weaver'
  | 'science_fair_buddy'
  | 'what_if'
  | 'voice_tutor';

export type Grade = 6 | 7 | 8 | 9 | 10;
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Language = 'English' | 'English+Tamil' | 'English+Malayalam' | 'English+Hindi' | 'English+Telugu' | 'English+Kannada';