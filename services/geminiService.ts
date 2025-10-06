


import { GoogleGenAI } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, Scientist, DiagramIdea, Diagram } from '../types.ts';

// Define a custom error class to hold the status code for better error handling in the UI
export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}


// Helper function to call our secure serverless proxy
async function callApi<T>(action: string, params: object): Promise<T> {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
    });

    if (!response.ok) {
        let errorMessage = `Server Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                errorMessage = errorData.error;
            }
        } catch (e) {
            console.error('Could not parse error response as JSON.', e);
        }
        // Throw our custom error to propagate the status code
        throw new ApiError(errorMessage, response.status);
    }
    
    try {
        const data = await response.json();
        return data as T;
    } catch (e) {
        throw new Error('Failed to parse a successful server response. The response may not be valid JSON.');
    }
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

export const generateDiagramImage = (description: string): Promise<string> => {
    return callApi('generateDiagramImage', { description });
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

export const analyzeGenerationFailure = (errorMessage: string): Promise<string> => {
    return callApi('analyzeGenerationFailure', { errorMessage });
};

// --- SPECIAL CASE for Voice Tutor ---
// The 'live' service establishes a direct WebSocket connection and MUST be initialized on the client.
// This section now fetches the key securely from an API endpoint instead of a build-injected file.

let ai: GoogleGenAI | null = null;
let clientSideApiKey: string | null = null;

export async function getClientSideApiKey(): Promise<string> {
    if (clientSideApiKey) {
        return clientSideApiKey;
    }
    const response = await fetch('/api/get-key');
    if (!response.ok) {
        throw new Error("Could not fetch the API key for the Voice Tutor.");
    }
    const data = await response.json();
    if (!data.apiKey) {
        throw new Error("API key was not provided by the server.");
    }
    clientSideApiKey = data.apiKey;
    return clientSideApiKey;
}


const getAiForLive = async (): Promise<GoogleGenAI> => {
    if (ai) {
        return ai;
    }
    const apiKey = await getClientSideApiKey();
    ai = new GoogleGenAI({ apiKey });
    return ai;
};

export const live = {
    connect: async (options: any) => {
        const aiInstance = await getAiForLive();
        return aiInstance.live.connect(options);
    },
};