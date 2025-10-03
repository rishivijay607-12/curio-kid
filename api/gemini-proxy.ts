
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, Scientist, DiagramIdea } from '../types.ts';

const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Intelligently extracts a JSON object or array from a string,
 * tolerating markdown code blocks and other text noise from an LLM.
 * @param text The raw text response from the AI model.
 * @returns The parsed JSON object or array.
 * @throws An error if valid JSON cannot be found or parsed.
 */
function extractJson<T>(text: string): T {
    // 1. Try to find a markdown-style JSON block first.
    const markdownMatch = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[2]) {
        try {
            return JSON.parse(markdownMatch[2]) as T;
        } catch (e) {
            console.warn('Could not parse markdown JSON block, falling back to substring search.', e);
        }
    }

    // 2. Fallback to finding the first '{' or '[' and last '}' or ']'.
    const firstBracket = text.indexOf('{');
    const firstSquare = text.indexOf('[');
    
    let startIndex;
    if (firstBracket === -1 && firstSquare === -1) {
        console.error("No JSON object or array found in response text:", text);
        throw new Error('No JSON object or array found in the AI response.');
    }

    if (firstBracket === -1) startIndex = firstSquare;
    else if (firstSquare === -1) startIndex = firstBracket;
    else startIndex = Math.min(firstBracket, firstSquare);

    const lastBracket = text.lastIndexOf('}');
    const lastSquare = text.lastIndexOf(']');
    const endIndex = Math.max(lastBracket, lastSquare);

    if (endIndex === -1 || endIndex < startIndex) {
        console.error("Could not find a valid JSON structure in response text:", text);
        throw new Error('Could not find a valid JSON structure in the AI response.');
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    
    try {
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.error("Failed to parse extracted JSON string. Raw string:", jsonString);
        console.error("Full AI response text for debugging:", text);
        throw new Error('The AI returned a malformed JSON response that could not be parsed.');
    }
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CRITICAL FIX: Prevent crashes by ensuring the body exists before destructuring.
    if (!req.body) {
        return res.status(400).json({ error: 'Bad Request: Missing request body.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { action, params } = req.body;

    try {
        // --- Initialization and Validation (Handler Scope) ---
        if (!process.env.API_KEY) {
            console.error('[GEMINI_PROXY_FATAL] The API_KEY environment variable is not set on the server.');
            return res.status(500).json({ error: "The application's AI service is not configured correctly. Please contact the administrator." });
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        let result;
        switch (action) {
            case 'generateQuizQuestions': result = await generateQuizQuestions(ai, params); break;
            case 'generateWorksheet': result = await generateWorksheet(ai, params); break;
            case 'generateNotes': result = await generateNotes(ai, params); break;
            case 'getChatResponse': result = await getChatResponse(ai, params); break;
            case 'generateGreeting': result = await generateGreeting(ai, params); break;
            case 'generateDiagramIdeas': result = await generateDiagramIdeas(ai, params); break;
            case 'generateDiagramImage': result = await generateDiagramImage(ai, params); break;
            case 'generateTextForMode': result = await generateTextForMode(ai, params); break;
            case 'explainImageWithText': result = await explainImageWithText(ai, params); break;
            case 'generateScienceFairIdeas': result = await generateScienceFairIdeas(ai, params); break;
            case 'generateScienceFairPlan': result = await generateScienceFairPlan(ai, params); break;
            case 'generateScientistGreeting': result = await generateScientistGreeting(ai, params); break;
            case 'getHistoricalChatResponse': result = await getHistoricalChatResponse(ai, params); break;
            case 'analyzeGenerationFailure': result = await analyzeGenerationFailure(ai, params); break;
            case 'startVideoGeneration': result = await startVideoGeneration(ai, params); break;
            case 'checkVideoGenerationStatus': result = await checkVideoGenerationStatus(ai, params); break;
            default: return res.status(400).json({ error: 'Invalid action specified.' });
        }
        return res.status(200).json(result);

    } catch (error) {
        console.error(`[GEMINI_PROXY_ERROR] Action: "${action}" failed.`);
        console.error(`[PARAMS_DEBUG] ${JSON.stringify(params, null, 2)}`);

        let userMessage = "The AI is unable to process your request at the moment. This might be due to high traffic or a content safety block. Please try again with a different prompt.";
        let statusCode = 500;

        if (error instanceof Error) {
            console.error(`[ERROR_DETAILS] Name: ${error.name}`);
            console.error(`[ERROR_DETAILS] Message: ${error.message}`);
            if (error.stack) {
                console.error(`[ERROR_DETAILS] Stack: ${error.stack}`);
            }

            if (error.message.includes('API key not valid')) {
                userMessage = "The server is configured with an invalid API key. Please contact the administrator.";
            } else if (error.message.includes('malformed JSON response')) {
                userMessage = "The AI returned a response that could not be understood. This can be a temporary issue. Please try again.";
            } else if (error.message.toLowerCase().includes('timeout')) {
                userMessage = "The request to the AI timed out. Your request might be too complex. Please try simplifying it.";
                statusCode = 504; // Gateway Timeout
            }
        } else {
            console.error('[ERROR_DETAILS] A non-Error object was thrown:', error);
        }
        
        return res.status(statusCode).json({ error: userMessage });
    }
}

// --- All Gemini Logic is here, on the server ---
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const createModelParams = (params: any) => ({
    ...params,
    config: {
        ...(params.config || {}),
        safetySettings,
    },
});

const generateQuizQuestions = async (ai: GoogleGenAI, { topic, grade, difficulty, count }: any): Promise<QuizQuestion[]> => {
    const prompt = `You are an expert quiz creator for middle and high school students in India.
Generate a set of ${count} unique, multiple-choice science quiz questions based on the content from the India NCERT Grade ${grade} Science textbook, focusing on the chapter: "${topic}". Each question must be of **${difficulty}** difficulty. For each question: type must be "MCQ", provide a clear question and 4 plausible options, the correct answer, and a brief, easy-to-understand explanation.`;
    const params = {
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['type', 'question', 'options', 'answer', 'explanation'] } },
        },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return extractJson<QuizQuestion[]>(response.text);
};

const generateWorksheet = async (ai: GoogleGenAI, { topic, grade, difficulty, count }: any): Promise<QuizQuestion[]> => {
    const prompt = `You are an expert worksheet creator for students in India.
Generate a mixed worksheet of ${count} science questions based on the India NCERT Grade ${grade} Science textbook chapter: "${topic}".
All questions must be of **${difficulty}** difficulty.
Include a mix of 'MCQ', 'True/False', 'Assertion/Reason', and 'Q&A' types.
For every question, provide a brief, easy-to-understand explanation for the correct answer. Ensure the output is a valid JSON array of question objects.`;
    const params = {
        model: "gemini-2.5-flash", contents: prompt,
         config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, reason: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['type', 'question', 'answer', 'explanation'] } },
        },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    return extractJson<QuizQuestion[]>(response.text);
};

const generateNotes = async (ai: GoogleGenAI, { topic, grade }: any): Promise<NoteSection[]> => {
    const prompt = `You are an expert academic content creator for students in India. Generate a comprehensive, structured set of study notes for the chapter "${topic}" from the India NCERT Grade ${grade} Science textbook. Organize into logical sections with a title and 3-5 key bullet points each.`;
    const params = {
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { notes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['title', 'points'] } } }, required: ['notes'] },
        },
    };
    const response = await ai.models.generateContent(createModelParams(params));
    const data = extractJson<{ notes: NoteSection[] }>(response.text);
    return data.notes;
};

const getChatResponse = async (ai: GoogleGenAI, { grade, history, language, topic }: any): Promise<string> => {
    let langInstruction = 'Respond in clear and simple English.';
    const systemInstruction = `You are a friendly and masterful science tutor for a Grade ${grade} student in India. Your name is 'Curio'. The student wants to ask questions specifically about the chapter: "${topic}". Your goal is to teach, not just to answer. ${langInstruction} **Teaching Method:** NEVER give the full answer at once. Guide the student step-by-step. After one small step, ALWAYS ask a simple question to check for understanding. Use analogies, lists, and short sentences. Be encouraging. Stay on topic.`;
    const params = { model: "gemini-2.5-flash", contents: history, config: { systemInstruction } };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

const generateGreeting = async (ai: GoogleGenAI, { grade, language, topic }: any): Promise<string> => {
    const prompt = `You are a friendly AI science tutor 'Curio'. Provide a very short, welcoming opening message for a Grade ${grade} student to start a doubt-solving session about '${topic}'. The message should be in clear and simple English. Keep it to one or two sentences.`;
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
    const ideasData = extractJson<{ diagrams: Omit<DiagramIdea, 'id'>[] }>(response.text);
    return ideasData.diagrams.map((idea) => ({ ...idea, id: generateUniqueId() }));
};

const generateDiagramImage = async (ai: GoogleGenAI, { prompt }: any): Promise<string> => {
    const params = {
        model: 'imagen-4.0-generate-001', prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
    };
    const response = await ai.models.generateImages(params);
    if (!response.generatedImages?.[0]?.image?.imageBytes) {
        console.error("Invalid or empty response from image generation API:", JSON.stringify(response, null, 2));
        throw new Error("Image generation failed to return a valid image.");
    }
    return response.generatedImages[0].image.imageBytes;
};

const generateTextForMode = async (ai: GoogleGenAI, { mode, userInput, grade, topic }: any): Promise<GenerativeTextResult> => {
    let systemInstruction = "You are a helpful and engaging AI science expert.";
    let contents = `My question: "${userInput}"`;
    let useSearch = mode === 'real_world_links';
    const params = { model: "gemini-2.5-flash", contents, config: { systemInstruction, tools: useSearch ? [{ googleSearch: {} }] : undefined } };
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
    return extractJson<{ ideas: ScienceFairIdea[] }>(response.text).ideas;
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
    return extractJson<{ plan: { stepTitle: string; instructions: string }[] }>(response.text).plan;
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

const analyzeGenerationFailure = async (ai: GoogleGenAI, { errorMessage }: any): Promise<string> => {
    const prompt = `A user's attempt to generate content failed in my web application. Here is the technical error message: "${errorMessage}". Please analyze this error and provide a simple, user-friendly explanation (in one or two sentences) of what likely went wrong and what they can try next. Do not provide code or technical jargon. Address the user directly.`;
    const params = { model: "gemini-2.5-flash", contents: prompt };
    const response = await ai.models.generateContent(createModelParams(params));
    return response.text;
};

const startVideoGeneration = async (ai: GoogleGenAI, { topic, grade }: any): Promise<any> => {
    const prompt = `Create a short, engaging, and simple educational video (around 30 seconds) for a Grade ${grade} student about "${topic}". The video should be visually appealing with clear narration. Focus on one key concept from the topic.`;
    return await ai.models.generateVideos({
        model: 'veo-2.0-generate-001', prompt, config: { numberOfVideos: 1 }
    });
};

const checkVideoGenerationStatus = async (ai: GoogleGenAI, { operation }: any): Promise<any> => {
    return await ai.operations.getVideosOperation({ operation });
};
