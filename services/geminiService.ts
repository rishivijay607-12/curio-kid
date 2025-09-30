import { GoogleGenAI } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GroundingChunk, GenerativeTextResult, ScienceFairIdea, Scientist, DiagramIdea } from '../types.ts';

// --- Server-Side Proxy Wrapper ---
const callProxy = async (action: string, payload: any) => {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred calling the proxy.' }));
        throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
    return response.json();
};

// --- Proxied Functions ---
export const generateQuizQuestions = async (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    return callProxy('generateQuizQuestions', { topic, grade, difficulty, count });
};

export const generateWorksheet = async (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    return callProxy('generateWorksheet', { topic, grade, difficulty, count });
};

export const generateNotes = async (topic: string, grade: Grade): Promise<NoteSection[]> => {
    return callProxy('generateNotes', { topic, grade });
};

export const generateGreeting = async (grade: Grade, language: Language, topic: string): Promise<string> => {
    return callProxy('generateGreeting', { grade, language, topic });
};

export const getChatResponse = async (grade: Grade, history: ChatMessage[], language: Language, topic: string): Promise<string> => {
    return callProxy('getChatResponse', { grade, history, language, topic });
};

export const generateDiagramIdeas = async (topic: string, grade: Grade): Promise<DiagramIdea[]> => {
    const ideas: Omit<DiagramIdea, 'id'>[] = await callProxy('generateDiagramIdeas', { topic, grade });
    // Add client-side UUIDs after receiving ideas from the proxy
    return ideas.map((idea) => ({ ...idea, id: self.crypto.randomUUID() }));
};

export const generateDiagramImage = async (prompt: string): Promise<string> => {
    return callProxy('generateDiagramImage', { prompt });
};

export const generateTextForMode = async (mode: AppMode, userInput: string, grade?: Grade, topic?: string): Promise<GenerativeTextResult> => {
    return callProxy('generateTextForMode', { mode, userInput, grade, topic });
};

export const explainImageWithText = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    return callProxy('explainImageWithText', { base64Image, mimeType, prompt });
};

export const generateScienceFairIdeas = async (userInput: string): Promise<ScienceFairIdea[]> => {
    return callProxy('generateScienceFairIdeas', { userInput });
};

export const generateScienceFairPlan = async (projectTitle: string, projectDescription: string): Promise<{ stepTitle: string; instructions: string }[]> => {
    return callProxy('generateScienceFairPlan', { projectTitle, projectDescription });
};

export const generateScientistGreeting = async (scientist: Scientist): Promise<string> => {
    return callProxy('generateScientistGreeting', { scientist });
};

export const getHistoricalChatResponse = async (scientist: Scientist, history: ChatMessage[]): Promise<string> => {
    return callProxy('getHistoricalChatResponse', { scientist, history });
};


// --- Client-Side Live/Voice API ---
// This service must run client-side. It fetches the API key from a secure
// endpoint just-in-time, enabling the feature for all users.
export const live = {
    connect: async (options: any) => {
        try {
            const response = await fetch('/api/get-api-key');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch API key for voice session.' }));
                throw new Error(errorData.message || `Server responded with status: ${response.status}`);
            }
            const { apiKey } = await response.json();
            if (!apiKey) {
                throw new Error("API key was not provided by the server. The administrator needs to configure it.");
            }
            const ai = new GoogleGenAI({ apiKey });
            return ai.live.connect(options);
        } catch (e) {
            console.error("Failed to initialize or connect live session:", e);
            // Re-throw the error so the UI component can catch it
            return Promise.reject(e);
        }
    },
};