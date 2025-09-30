import { GoogleGenAI } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GroundingChunk, GenerativeTextResult, ScienceFairIdea, ScienceFairPlanStep, Scientist, DiagramIdea } from '../types';
import { getApiKey } from './apiKeyService';

// Helper to communicate with our serverless proxy
const proxyFetch = async (action: string, payload: object) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API key is not configured. The administrator needs to set it up.");
    }

    try {
        const response = await fetch('/api/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Include the API key in the payload for the serverless function
            body: JSON.stringify({ action, payload, apiKey }),
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
// This part is special because it cannot be proxied easily.
// It fetches the key once from local storage and then uses it on the client.
const getLiveApiKey = (): string => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API key not configured. The application cannot connect to the AI service.");
    }
    return apiKey;
};

export const live = {
    connect: (options: any) => {
        const apiKey = getLiveApiKey();
        const ai = new GoogleGenAI({ apiKey });
        return ai.live.connect(options);
    },
};