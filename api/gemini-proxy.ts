import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GenerativeTextResult, ScienceFairIdea, Scientist, Flashcard } from '../types.ts';

const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Bad Request: Missing or malformed JSON body.' });
    }

    const { action, params } = req.body;

    if (typeof action !== 'string' || !action) {
         return res.status(400).json({ error: 'Bad Request: "action" property must be a non-empty string.' });
    }

    const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;
    
    if (!apiKey) {
        console.error('[GEMINI_PROXY_FATAL] The API_KEY environment variable is not set on the server.');
        return res.status(500).json({ error: "Configuration Error: The AI service API key is MISSING on the server. Please contact the administrator." });
    }
    
    let ai: GoogleGenAI;
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (initError) {
        console.error('[GEMINI_PROXY_FATAL] Failed to initialize GoogleGenAI. The API key might be invalid.', initError);
        return res.status(500).json({ error: "Configuration Error: The AI service could not be initialized. The provided API key may be INVALID." });
    }

    try {
        let result;
        switch (action) {
            case 'generateQuizQuestions': result = await generateQuizQuestions(ai, params); break;
            case 'generateWorksheet': result = await generateWorksheet(ai, params); break;
            case 'generateNotes': result = await generateNotes(ai, params); break;
            case 'generateFlashcards': result = await generateFlashcards(ai, params); break;
            case 'getChatResponse': result = await getChatResponse(ai, params); break;
            case 'generateGreeting': result = await generateGreeting(ai, params); break;
            case 'generateTextForMode': result = await generateTextForMode(ai, params); break;
            case 'explainImageWithText': result = await explainImageWithText(ai, params); break;
            case 'generateScienceFairIdeas': result = await generateScienceFairIdeas(ai, params); break;
            case 'generateScienceFairPlan': result = await generateScienceFairPlan(ai, params); break;
            case 'generateScientistGreeting': result = await generateScientistGreeting(ai, params); break;
            case 'getHistoricalChatResponse': result = await getHistoricalChatResponse(ai, params); break;
            case 'analyzeGenerationFailure': result = await analyzeGenerationFailure(ai, params); break;
            default: return res.status(400).json({ error: 'Invalid action specified.' });
        }
        return res.status(200).json(result);

    } catch (error) {
        console.error(`[GEMINI_PROXY_ERROR] Action: "${action}" failed.`);
        console.error(`[PARAMS_DEBUG] ${JSON.stringify(params, null, 2)}`);
        
        console.error('[RAW_ERROR]', error);

        let userMessage = "The AI is unable to process your request at the moment. This might be due to high traffic or a content safety block. Please try again with a different prompt.";
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message.includes('JSON.parse')) {
                 userMessage = "The AI returned a response that could not be understood. This can be a temporary issue. Please try again.";
            } else if (error.message.includes('API key not valid')) {
                userMessage = "The server is configured with an invalid API key. Please contact the administrator.";
            } else if (error.message.toLowerCase().includes('timeout')) {
                userMessage = "The request to the AI timed out. Your request might be too complex. Please try simplifying it.";
                statusCode = 504; // Gateway Timeout
            }
        }
        
        return res.status(statusCode).json({ error: userMessage });
    }
}

// --- All Gemini Logic is here, on the server ---
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const generateQuizQuestions = async (ai: GoogleGenAI, { topic, grade, difficulty, count }: any): Promise<QuizQuestion[]> => {
    const prompt = `You are an expert quiz creator for middle and high school students in India.
Generate a set of ${count} unique, multiple-choice science quiz questions based on the content from the India NCERT Grade ${grade} Science textbook, focusing on the chapter: "${topic}". Each question must be of **${difficulty}** difficulty. For each question: type must be "MCQ", provide a clear question and 4 plausible options, the correct answer, and a brief, easy-to-understand explanation.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            safetySettings,
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['type', 'question', 'options', 'answer', 'explanation'] } },
        },
    });
    return JSON.parse(response.text) as QuizQuestion[];
};

const generateWorksheet = async (ai: GoogleGenAI, { topic, grade, difficulty, count }: any): Promise<QuizQuestion[]> => {
    const prompt = `You are an expert worksheet creator for students in India.
Generate a mixed worksheet of ${count} science questions based on the India NCERT Grade ${grade} Science textbook chapter: "${topic}".
All questions must be of **${difficulty}** difficulty.
Include a mix of 'MCQ', 'True/False', 'Assertion/Reason', and 'Q&A' types.
For 'Assertion/Reason' questions, combine both the Assertion and the Reason into the main 'question' field, clearly labeling them as 'Assertion (A):' and 'Reason (R):'. Do not use a separate 'reason' field.
For every question, provide a brief, easy-to-understand explanation for the correct answer. Ensure the output is a valid JSON array of question objects.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            safetySettings,
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['type', 'question', 'answer', 'explanation'] } },
        },
    });
    return JSON.parse(response.text) as QuizQuestion[];
};

const generateNotes = async (ai: GoogleGenAI, { topic, grade }: any): Promise<NoteSection[]> => {
    const prompt = `You are an expert academic content creator for students in India. Generate a comprehensive, structured set of study notes for the chapter "${topic}" from the India NCERT Grade ${grade} Science textbook. Organize into logical sections with a title and 3-5 key bullet points each.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            safetySettings,
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { notes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['title', 'points'] } } }, required: ['notes'] },
        },
    });
    const data = JSON.parse(response.text) as { notes: NoteSection[] };
    return data.notes;
};

const generateFlashcards = async (ai: GoogleGenAI, { topic, grade }: any): Promise<Flashcard[]> => {
    const prompt = `You are an expert in creating educational materials. Generate a set of 15 concise flashcards for a Grade ${grade} student studying the chapter "${topic}".
Each flashcard must have a 'term' (a key concept, name, or item) and a 'definition' (a clear and simple explanation of the term).
The term should be on the front of the card, and the definition on the back.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            safetySettings,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    flashcards: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                term: { type: Type.STRING },
                                definition: { type: Type.STRING }
                            },
                            required: ['term', 'definition']
                        }
                    }
                },
                required: ['flashcards']
            },
        },
    });
    const data = JSON.parse(response.text) as { flashcards: Flashcard[] };
    return data.flashcards;
};

const getChatResponse = async (ai: GoogleGenAI, { grade, history, language, topic }: any): Promise<string> => {
    let langInstruction = "Respond in clear and simple English.";
    switch (language) {
        case 'English+Tamil':
            langInstruction = "Respond in a mix of English and Tamil (Tanglish).";
            break;
        case 'English+Malayalam':
            langInstruction = "Respond in a mix of English and Malayalam (Manglish).";
            break;
        case 'English+Hindi':
            langInstruction = "Respond in a mix of English and Hindi (Hinglish).";
            break;
        case 'English+Telugu':
            langInstruction = "Respond in a mix of English and Telugu (Tenglish).";
            break;
        case 'English+Kannada':
            langInstruction = "Respond in a mix of English and Kannada (Kanglish).";
            break;
    }

    const systemInstruction = `You are 'Curio', a friendly science tutor for a Grade ${grade} student in India. The topic is "${topic}".
**Core Rules:**
1.  **One Message at a Time:** You MUST send only one message and then wait for the user to reply. Do not send multiple messages in a row.
2.  **Strict Language:** You MUST respond in the following language mixture: ${language}. Do not use any other languages.
3.  **Be Brief:** Your responses MUST be very short (one or two sentences). Guide the student with simple questions. Do not give long lectures.
4.  **Be a Tutor:** Your goal is to teach by guiding, not just giving answers. Use simple analogies. Be encouraging. Stay on topic.
5.  **Wait for the User:** After your initial greeting, wait for the user to ask the first question.`;
    const response = await ai.models.generateContent({ 
        model: "gemini-2.5-flash", 
        contents: history, 
        config: { 
            systemInstruction,
            safetySettings,
        } 
    });
    return response.text;
};

const generateGreeting = async (ai: GoogleGenAI, { grade, language, topic }: any): Promise<string> => {
    let langInstruction = "clear and simple English";
    switch (language) {
        case 'English+Tamil':
            langInstruction = "a mix of English and Tamil (Tanglish)";
            break;
        case 'English+Malayalam':
            langInstruction = "a mix of English and Malayalam (Manglish)";
            break;
        case 'English+Hindi':
            langInstruction = "a mix of English and Hindi (Hinglish)";
            break;
        case 'English+Telugu':
            langInstruction = "a mix of English and Telugu (Tenglish)";
            break;
        case 'English+Kannada':
            langInstruction = "a mix of English and Kannada (Kanglish)";
            break;
    }
    
    const prompt = `You are a friendly AI science tutor 'Curio'.
**Task:** Provide a very short, welcoming opening message for a Grade ${grade} student starting a session about '${topic}'.
**Language:** The message MUST be in ${langInstruction}.
**Length:** Keep it to one or two friendly sentences. Do not ask a question, just welcome them.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: { safetySettings }
    });
    return response.text;
};

const generateTextForMode = async (ai: GoogleGenAI, { mode, userInput, grade, topic }: any): Promise<GenerativeTextResult> => {
    let systemInstruction = "You are a helpful and engaging AI science expert.";
    let contents = `My question: "${userInput}"`;
    let useSearch = mode === 'real_world_links';

    if (mode === 'story_weaver') {
        systemInstruction = `You are a master storyteller for young adults, skilled at weaving scientific concepts into compelling narratives. Your goal is to create an engaging story, not a lesson.`;
        contents = `Create a short story for a Grade ${grade} student based on the chapter "${topic}". The story should be inspired by the user's idea: "${userInput}".
        
CRITICAL INSTRUCTION: The scientific principles from the chapter should be a central part of the plot or the world. DO NOT explain the science like a textbook. Instead, SHOW the science in action through the characters' experiences, the setting, or the challenges they overcome. The narrative and characters are the priority.`;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents, 
        config: {
            systemInstruction, 
            tools: useSearch ? [{ googleSearch: {} }] : undefined,
            safetySettings,
        }
    });
    return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
};

const explainImageWithText = async (ai: GoogleGenAI, { base64Image, mimeType, prompt }: any): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }] },
        config: { safetySettings },
    });
    return response.text;
};

const generateScienceFairIdeas = async (ai: GoogleGenAI, { userInput }: any): Promise<ScienceFairIdea[]> => {
    const prompt = `Brainstorm 3 unique and engaging science fair project ideas based on the student's interest in: "${userInput}". For each, provide a catchy 'title' and a detailed 'description'.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            safetySettings,
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { ideas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] } } }, required: ['ideas'] },
        }
    });
    const data = JSON.parse(response.text) as { ideas: ScienceFairIdea[] };
    return data.ideas;
};

const generateScienceFairPlan = async (ai: GoogleGenAI, { projectTitle, projectDescription }: any): Promise<{ stepTitle: string; instructions: string }[]> => {
    const prompt = `Create a detailed, 5-step plan for a science fair project.
Project Title: "${projectTitle}"
Project Description: "${projectDescription}"
For each of the 5 steps, provide:
1.  A short, clear "stepTitle".
2.  Detailed "instructions" for the student to follow.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            safetySettings,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    plan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                stepTitle: { type: Type.STRING },
                                instructions: { type: Type.STRING },
                            },
                            required: ['stepTitle', 'instructions']
                        }
                    }
                },
                required: ['plan']
            },
        }
    });
    const data = JSON.parse(response.text) as { plan: { stepTitle: string; instructions: string }[] };
    return data.plan;
};

const generateScientistGreeting = async (ai: GoogleGenAI, { scientist }: any): Promise<string> => {
    const prompt = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Provide a short, welcoming opening message to start a chat session with a student. Speak in the first person.`;
    const response = await ai.models.generateContent({ 
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: { safetySettings },
    });
    return response.text;
};

const getHistoricalChatResponse = async (ai: GoogleGenAI, { scientist, history }: any): Promise<string> => {
    const systemInstruction = `You are role-playing as ${scientist.name}, the famous ${scientist.field}.
**Core Rules:**
1.  **One Message at a Time:** You MUST send only one message and then wait for the user to reply. Do not send multiple messages in a row.
2.  **Stay in Character:** Act and speak as this person from their historical perspective and personality.
3.  **Be Brief:** Your responses MUST be very short and conversational (one or two sentences). Your goal is to be engaging, not to give long lectures.
4.  **Wait for the User:** After your initial greeting, wait for the user's first question.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: history, 
        config: { 
            systemInstruction,
            safetySettings,
        }
    });
    return response.text;
};

const analyzeGenerationFailure = async (ai: GoogleGenAI, { errorMessage }: any): Promise<string> => {
    const prompt = `A user's attempt to generate content failed in my web application. Here is the technical error message: "${errorMessage}". Please analyze this error and provide a simple, user-friendly explanation (in one or two sentences) of what likely went wrong and what they can try next. Do not provide code or technical jargon. Address the user directly.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: { safetySettings },
    });
    return response.text;
};