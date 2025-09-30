import { GoogleGenAI } from '@google/genai';
import { getApiKey } from './apiKeyService';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GroundingChunk, GenerativeTextResult, ScienceFairIdea, ScienceFairPlanStep, Scientist, DiagramIdea } from '../types';

// Helper to communicate with our serverless proxy
const proxyFetch = async (action: string, payload: object) => {
    try {
        const response = await fetch('/api/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // The API key is now handled by the serverless function using environment variables.
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'An unknown error occurred in the proxy.' }));
            throw new Error(errorBody.message || `Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching from proxy action "${action}":`, error);
        throw error; // Re-throw to be caught by the calling function
    }
};


export const generateQuizQuestions = (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    return proxyFetch('generateQuizQuestions', { topic, grade, difficulty, count });
};

export const generateWorksheet = (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    return proxyFetch('generateWorksheet', { topic, grade, difficulty, count });
};

export const generateNotes = (topic: string, grade: Grade): Promise<NoteSection[]> => {
    return proxyFetch('generateNotes', { topic, grade });
};

export const generateGreeting = (grade: Grade, language: Language, topic: string): Promise<string> => {
    return proxyFetch('generateGreeting', { grade, language, topic });
};

export const getChatResponse = (grade: Grade, history: ChatMessage[], language: Language, topic: string): Promise<string> => {
    return proxyFetch('getChatResponse', { grade, history, language, topic });
};

export const generateDiagramIdeas = (topic: string, grade: Grade): Promise<DiagramIdea[]> => {
    return proxyFetch('generateDiagramIdeas', { topic, grade }).then(ideas =>
        // Add unique ID on the client-side for state management
        ideas.map((idea: Omit<DiagramIdea, 'id'>) => ({ ...idea, id: self.crypto.randomUUID() }))
    );
};

export const generateDiagramImage = (prompt: string): Promise<string> => {
    return proxyFetch('generateDiagramImage', { prompt });
};

export const generateTextForMode = (mode: AppMode, userInput: string, grade?: Grade, topic?: string): Promise<GenerativeTextResult> => {
    return proxyFetch('generateTextForMode', { mode, userInput, grade, topic });
};

export const explainImageWithText = (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    return proxyFetch('explainImageWithText', { base64Image, mimeType, prompt });
};

export const generateScienceFairIdeas = (userInput: string): Promise<ScienceFairIdea[]> => {
    return proxyFetch('generateScienceFairIdeas', { userInput });
};

// The plan generation is now a two-step process on the client
export const generateScienceFairPlan = async (projectTitle: string, projectDescription: string): Promise<{ stepTitle: string; instructions: string }[]> => {
    // Step 1: Get the text plan from the proxy
    return proxyFetch('generateScienceFairPlan', { projectTitle, projectDescription });
};

export const generateScientistGreeting = (scientist: Scientist): Promise<string> => {
    return proxyFetch('generateScientistGreeting', { scientist });
};

export const getHistoricalChatResponse = (scientist: Scientist, history: ChatMessage[]): Promise<string> => {
    return proxyFetch('getHistoricalChatResponse', { scientist, history });
};


// --- Special Handling for Live/Voice API ---
// This feature requires a client-side API key and is enabled for admin users.
export const live = {
    connect: (options: any) => {
        const apiKey = getApiKey();
        if (!apiKey) {
            return Promise.reject(new Error("The Voice Tutor feature requires a client-side API key, which is only available for admin users. Please log in as an admin and provide the key."));
        }
        // Initialize a separate client-side instance for the live API
        try {
            const ai = new GoogleGenAI({ apiKey });
            return ai.live.connect(options);
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI for live connection:", e);
            return Promise.reject(e);
        }
    },
};