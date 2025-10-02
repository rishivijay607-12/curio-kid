import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type, Modality } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, Scientist, DiagramIdea } from '../types.ts';

// A private, cached instance of the AI client.
let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * This prevents the app from crashing on startup if the API key is missing or invalid.
 * Throws an error if the API key is not configured.
 */
const getAi = (): GoogleGenAI => {
    // FIX: Use process.env.API_KEY as per guidelines, which also resolves the TypeScript error.
    if (!process.env.API_KEY) {
        throw new Error("API key not configured. Please set the API_KEY environment variable to use this feature.");
    }
    // Initialize the AI client if it hasn't been already.
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const createModelParams = (params: any) => ({
    ...params,
    config: { ...params.config, safetySettings }
});

export const generateQuizQuestions = async (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    const ai = getAi();
    const prompt = `You are an expert quiz creator for middle and high school students in India.
Generate a set of ${count} unique, multiple-choice science quiz questions based on the content from the India NCERT Grade ${grade} Science textbook, focusing on the chapter: "${topic}". Each question must be of **${difficulty}** difficulty. For each question: type must be "MCQ", provide a clear question and 4 plausible options, the correct answer, and a brief, easy-to-understand explanation.`;
    const params = {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['type', 'question', 'options', 'answer', 'explanation'] } },
        },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return JSON.parse(response.text.trim());
};

export const generateWorksheet = async (topic: string, grade: Grade, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
    const ai = getAi();
    const prompt = `You are an expert worksheet creator for students in India.
Generate a mixed worksheet of ${count} science questions based on the India NCERT Grade ${grade} Science textbook chapter: "${topic}".
All questions must be of **${difficulty}** difficulty.
Include a mix of 'MCQ', 'True/False', 'Assertion/Reason', and 'Q&A' types.
For every question, provide a brief, easy-to-understand explanation for the correct answer. Ensure the output is a valid JSON array of question objects.`;
    const params = {
        model: "gemini-2.5-flash",
        contents: prompt,
         config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, reason: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['type', 'question', 'options', 'answer', 'explanation'] } },
        },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return JSON.parse(response.text.trim());
};

export const generateNotes = async (topic: string, grade: Grade): Promise<NoteSection[]> => {
    const ai = getAi();
    const prompt = `You are an expert academic content creator for students in India. Generate a comprehensive, structured set of study notes for the chapter "${topic}" from the India NCERT Grade ${grade} Science textbook. Organize into logical sections with a title and 3-5 key bullet points each.`;
    const params = {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { notes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['title', 'points'] } } }, required: ['notes'] },
        },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return JSON.parse(response.text.trim()).notes;
};

export const getChatResponse = async (grade: Grade, history: ChatMessage[], language: Language, topic: string): Promise<string> => {
    const ai = getAi();
    let langInstruction = 'Respond in clear and simple English.';
    const systemInstruction = `You are a friendly and masterful science tutor for a Grade ${grade} student in India. Your name is 'Curio'. The student wants to ask questions specifically about the chapter: "${topic}". Your goal is to teach, not just to answer. ${langInstruction} **Teaching Method:** NEVER give the full answer at once. Guide the student step-by-step. After one small step, ALWAYS ask a simple question to check for understanding. Use analogies, lists, and short sentences. Be encouraging. Stay on topic.`;
    const params = {
        model: "gemini-2.5-flash",
        contents: history,
        config: { systemInstruction },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

export const generateGreeting = async (grade: Grade, language: Language, topic: string): Promise<string> => {
    const ai = getAi();
    let langInstruction = "in clear and simple English.";
    const prompt = `You are a friendly AI science tutor 'Curio'. Provide a very short, welcoming opening message for a Grade ${grade} student to start a doubt-solving session about '${topic}'. The message should be **${langInstruction}** Keep it to one or two sentences.`;
    const params = { model: "gemini-2.5-flash", contents: prompt };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

export const generateDiagramIdeas = async (topic: string, grade: Grade): Promise<DiagramIdea[]> => {
    const ai = getAi();
    const prompt = `You are an expert science educator. Brainstorm 8 essential diagrams to help a Grade ${grade} student understand the chapter "${topic}". For each, provide a 'prompt' for an AI image model (simple, clear, black and white textbook line drawing) and a short 'description' for the student.`;
    const params = {
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { diagrams: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['prompt', 'description'] } } }, required: ['diagrams'] },
        }
    };
    const response = await ai.models.generateContent(createModelParams(params));
    const ideas: Omit<DiagramIdea, 'id'>[] = JSON.parse(response.text.trim()).diagrams;
    return ideas.map((idea) => ({ ...idea, id: self.crypto.randomUUID() }));
};

export const generateDiagramImage = async (prompt: string): Promise<string> => {
    const ai = getAi();
    const params = {
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
    };
    const response = await ai.models.generateImages(params);
    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation returned no images.");
    }
    return response.generatedImages[0].image.imageBytes;
};

export const generateTextForMode = async (mode: AppMode, userInput: string, grade?: Grade, topic?: string): Promise<GenerativeTextResult> => {
    const ai = getAi();
    let systemInstruction = "You are a helpful and engaging AI science expert.";
    let contents = `My question: "${userInput}"`;
    let useSearch = mode === 'real_world_links';
    const params = {
        model: "gemini-2.5-flash", contents, config: { systemInstruction, tools: useSearch ? [{ googleSearch: {} }] : undefined }
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

export const explainImageWithText = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAi();
    const params = {
        model: "gemini-2.5-flash",
        contents: { parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }] },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

export const generateScienceFairIdeas = async (userInput: string): Promise<ScienceFairIdea[]> => {
    const ai = getAi();
    const prompt = `Brainstorm 3 unique and engaging science fair project ideas based on the student's interest in: "${userInput}". For each, provide a catchy 'title' and a detailed 'description'.`;
    const params = {
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { ideas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] } } }, required: ['ideas'] },
        }
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return JSON.parse(response.text.trim()).ideas;
};

export const generateScienceFairPlan = async (projectTitle: string, projectDescription: string): Promise<{ stepTitle: string; instructions: string }[]> => {
    const ai = getAi();
    const prompt = `Create a detailed, 5-step plan for a science fair project. Title: "${projectTitle}". Description: "${projectDescription}". For each step, provide a 'stepTitle' and detailed 'instructions'.`;
    const params = {
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { stepTitle: { type: Type.STRING }, instructions: { type: Type.STRING } }, required: ['stepTitle', 'instructions'] } } }, required: ['plan'] },
        }
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return JSON.parse(response.text.trim()).plan;
};

export const generateScientistGreeting = async (scientist: Scientist): Promise<string> => {
    const ai = getAi();
    const prompt = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Provide a short, welcoming opening message to start a chat session with a student. Speak in the first person.`;
    const params = { model: "gemini-2.5-flash", contents: prompt };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

export const getHistoricalChatResponse = async (scientist: Scientist, history: ChatMessage[]): Promise<string> => {
    const ai = getAi();
    const systemInstruction = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Act and speak as this person, from their historical perspective and personality. Keep responses concise and engaging.`;
    const params = { model: "gemini-2.5-flash", contents: history, config: { systemInstruction } };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

export const live = {
    connect: async (options: any) => {
        const ai = getAi();
        return ai.live.connect(options);
    },
};
