
import { GoogleGenAI } from '@google/genai';
import { API_KEY } from '../config.ts'; // Only for 'live' service
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, Scientist, DiagramIdea, Diagram } from '../types.ts';


// Helper function to call our new, secure serverless proxy
async function callApi<T>(action: string, params: object): Promise<T> {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'An error occurred while communicating with the server.');
    }

    return data as T;
}

// --- All functions below now use the secure proxy ---

export const generateQuizQuestions = (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    return callApi('generateQuizQuestions', { topic, grade, difficulty, count });
};

export const generateWorksheet = (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    return callApi('generateWorksheet', { topic, grade, difficulty, count });
};

export const generateNotes = (topic: string, grade: Grade): Promise<NoteSection[]> => {
    return callApi('generateNotes', { topic, grade });
};

export const getChatResponse = (grade: Grade, history: ChatMessage[], language: Language, topic: string): Promise<string> => {
    return callApi('getChatResponse', { grade, history, language, topic });
};

export const generateGreeting = (grade: Grade, language: Language, topic: string): Promise<string> => {
    return callApi('generateGreeting', { grade, language, topic });
};

export const generateDiagramIdeas = (topic: string, grade: Grade): Promise<DiagramIdea[]> => {
    return callApi('generateDiagramIdeas', { topic, grade });
};

export const generateDiagramImage = (prompt: string): Promise<string> => {
    return callApi('generateDiagramImage', { prompt });
};

export const generateTextForMode = (mode: AppMode, userInput: string, grade?: Grade, topic?: string): Promise<GenerativeTextResult> => {
    return callApi('generateTextForMode', { mode, userInput, grade, topic });
};

export const explainImageWithText = (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    return callApi('explainImageWithText', { base64Image, mimeType, prompt });
};

export const generateScienceFairIdeas = (userInput: string): Promise<ScienceFairIdea[]> => {
    return callApi('generateScienceFairIdeas', { userInput });
};

export const generateScienceFairPlan = (projectTitle: string, projectDescription: string): Promise<{ stepTitle: string; instructions: string }[]> => {
    return callApi('generateScienceFairPlan', { projectTitle, projectDescription });
};

export const generateScientistGreeting = (scientist: Scientist): Promise<string> => {
    return callApi('generateScientistGreeting', { scientist });
};

export const getHistoricalChatResponse = (scientist: Scientist, history: ChatMessage[]): Promise<string> => {
    return callApi('getHistoricalChatResponse', { scientist, history });
};


// --- SPECIAL CASE for Voice Tutor ---
// The 'live' service establishes a direct WebSocket connection and MUST be initialized on the client.
// It will use the API key injected via the build command.

let ai: GoogleGenAI | null = null;
const getAiForLive = (): GoogleGenAI => {
    if (!API_KEY || API_KEY === 'GEMINI_API_KEY_PLACEHOLDER') {
        throw new Error("API key not configured for Voice Tutor. Please set the API_KEY environment variable on your hosting platform.");
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

export const live = {
    connect: async (options: any) => {
        const aiInstance = getAiForLive();
        return aiInstance.live.connect(options);
    },
};
