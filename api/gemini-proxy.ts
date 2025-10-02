
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type, Modality } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, Scientist, DiagramIdea } from '../types';

// This function is the single server-side entry point for all standard AI interactions.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, params } = req.body;

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'API key not configured on the server.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let result;

        // Route the request to the appropriate function based on the 'action'
        switch (action) {
            case 'generateQuizQuestions':
                result = await generateQuizQuestions(ai, params);
                break;
            case 'generateWorksheet':
                result = await generateWorksheet(ai, params);
                break;
            case 'generateNotes':
                result = await generateNotes(ai, params);
                break;
            case 'getChatResponse':
                result = await getChatResponse(ai, params);
                break;
            case 'generateGreeting':
                result = await generateGreeting(ai, params);
                break;
            case 'generateDiagramIdeas':
                result = await generateDiagramIdeas(ai, params);
                break;
            case 'generateDiagramImage':
                result = await generateDiagramImage(ai, params);
                break;
            case 'generateTextForMode':
                result = await generateTextForMode(ai, params);
                break;
            case 'explainImageWithText':
                result = await explainImageWithText(ai, params);
                break;
            case 'generateScienceFairIdeas':
                result = await generateScienceFairIdeas(ai, params);
                break;
            case 'generateScienceFairPlan':
                result = await generateScienceFairPlan(ai, params);
                break;
            case 'generateScientistGreeting':
                result = await generateScientistGreeting(ai, params);
                break;
            case 'getHistoricalChatResponse':
                result = await getHistoricalChatResponse(ai, params);
                break;
            default:
                return res.status(400).json({ error: 'Invalid action specified.' });
        }
        
        return res.status(200).json(result);

    } catch (error) {
        console.error(`Error in action "${action}":`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return res.status(500).json({ error: errorMessage });
    }
}


// --- All Gemini Logic from geminiService.ts is now here, on the server ---

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const createModelParams = (params: any) => ({
    ...params,
    config: { ...params.config, safetySettings }
});

const generateQuizQuestions = async (ai: GoogleGenAI, { topic, grade, difficulty, count }: any): Promise<QuizQuestion[]> => {
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

const generateWorksheet = async (ai: GoogleGenAI, { topic, grade, difficulty, count }: any): Promise<QuizQuestion[]> => {
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

const generateNotes = async (ai: GoogleGenAI, { topic, grade }: any): Promise<NoteSection[]> => {
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

const getChatResponse = async (ai: GoogleGenAI, { grade, history, language, topic }: any): Promise<string> => {
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

const generateGreeting = async (ai: GoogleGenAI, { grade, language, topic }: any): Promise<string> => {
    let langInstruction = "in clear and simple English.";
    const prompt = `You are a friendly AI science tutor 'Curio'. Provide a very short, welcoming opening message for a Grade ${grade} student to start a doubt-solving session about '${topic}'. The message should be **${langInstruction}** Keep it to one or two sentences.`;
    const params = { model: "gemini-2.5-flash", contents: prompt };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

const generateDiagramIdeas = async (ai: GoogleGenAI, { topic, grade }: any): Promise<DiagramIdea[]> => {
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

const generateDiagramImage = async (ai: GoogleGenAI, { prompt }: any): Promise<string> => {
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

const generateTextForMode = async (ai: GoogleGenAI, { mode, userInput, grade, topic }: any): Promise<GenerativeTextResult> => {
    let systemInstruction = "You are a helpful and engaging AI science expert.";
    let contents = `My question: "${userInput}"`;
    let useSearch = mode === 'real_world_links';
    const params = {
        model: "gemini-2.5-flash", contents, config: { systemInstruction, tools: useSearch ? [{ googleSearch: {} }] : undefined }
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

const explainImageWithText = async (ai: GoogleGenAI, { base64Image, mimeType, prompt }: any): Promise<string> => {
    const params = {
        model: "gemini-2.5-flash",
        contents: { parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }] },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

const generateScienceFairIdeas = async (ai: GoogleGenAI, { userInput }: any): Promise<ScienceFairIdea[]> => {
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

const generateScienceFairPlan = async (ai: GoogleGenAI, { projectTitle, projectDescription }: any): Promise<{ stepTitle: string; instructions: string }[]> => {
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

const generateScientistGreeting = async (ai: GoogleGenAI, { scientist }: any): Promise<string> => {
    const prompt = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Provide a short, welcoming opening message to start a chat session with a student. Speak in the first person.`;
    const params = { model: "gemini-2.5-flash", contents: prompt };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

const getHistoricalChatResponse = async (ai: GoogleGenAI, { scientist, history }: any): Promise<string> => {
    const systemInstruction = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Act and speak as this person, from their historical perspective and personality. Keep responses concise and engaging.`;
    const params = { model: "gemini-2.5-flash", contents: history, config: { systemInstruction } };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};
