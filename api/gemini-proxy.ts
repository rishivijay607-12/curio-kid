import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

// --- Type Definitions copied from ../types.ts to make the function self-contained for Vercel build ---
type Grade = 6 | 7 | 8 | 9 | 10;
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type AppMode =
  | 'home'
  | 'quiz'
  | 'worksheet'
  | 'notes'
  | 'diagram'
  | 'video'
  | 'doubt_solver'
  | 'chat_with_history'
  | 'concept_deep_dive'
  | 'virtual_lab'
  | 'real_world_links'
  | 'story_weaver'
  | 'what_if'
  | 'science_lens'
  | 'science_fair_buddy'
  | 'voice_tutor'
  | 'leaderboard'
  | 'profile';
type QuestionType = 'MCQ' | 'True/False' | 'Assertion/Reason' | 'Q&A';
interface QuizQuestion {
  type: QuestionType;
  question: string;
  reason?: string;
  options: string[];
  answer: string;
  explanation: string;
}
interface NoteSection {
  title: string;
  points: string[];
}
interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}
type Language =
  | 'English'
  | 'English+Tamil'
  | 'English+Malayalam'
  | 'English+Hindi'
  | 'English+Telugu'
  | 'English+Kannada';
interface Scientist {
  name: string;
  field: string;
  description: string;
}
interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}
interface GenerativeTextResult {
  text: string;
  sources?: GroundingChunk[];
}
interface DiagramIdea {
  id: string;
  prompt: string;
  description: string;
}
interface ScienceFairIdea {
    id?: string;
    title: string;
    description: string;
}
interface ScienceFairPlanStep {
    stepTitle: string;
    instructions: string;
    image: string; // base64 data URL
}
// --- End of copied Type Definitions ---


// Define minimal types for Vercel's request and response objects
// as we can't import from '@vercel/node'.
interface VercelRequest {
    method?: string;
    body: any;
}

interface VercelResponse {
    status: (code: number) => {
        json: (data: any) => void;
    };
}


const getAi = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API key was not provided in the request from the client application.");
    }
    return new GoogleGenAI({ apiKey });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { action, payload, apiKey } = req.body;
        const ai = getAi(apiKey); // Initialize AI with the key from the client

        let result: any;

        const generateContent = (config: any) => {
             const safetySettings = [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ];
            return ai.models.generateContent({ ...config, config: { ...config.config, safetySettings } });
        };


        switch (action) {
            case 'generateQuizQuestions': {
                const { topic, grade, difficulty, count } = payload;
                const prompt = `You are an expert quiz creator for middle and high school students in India.
Generate a set of ${count} unique, multiple-choice science quiz questions based on the content from the India NCERT Grade ${grade} Science textbook, focusing on the chapter: "${topic}". Each question must be of **${difficulty}** difficulty. For each question: type must be "MCQ", provide a clear question and 4 plausible options, the correct answer, and a brief, easy-to-understand explanation.`;
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: 'ARRAY', items: { type: 'OBJECT', properties: { type: { type: 'STRING' }, question: { type: 'STRING' }, options: { type: 'ARRAY', items: { type: 'STRING' } }, answer: { type: 'STRING' }, explanation: { type: 'STRING' } }, required: ['type', 'question', 'options', 'answer', 'explanation'] } },
                    },
                });
                result = JSON.parse(response.text.trim());
                break;
            }

            case 'generateWorksheet': {
                const { topic, grade, difficulty, count } = payload;
                const prompt = `You are an expert worksheet creator for students in India.
Generate a mixed worksheet of ${count} science questions based on the India NCERT Grade ${grade} Science textbook chapter: "${topic}".
All questions must be of **${difficulty}** difficulty.
Include a mix of 'MCQ', 'True/False', 'Assertion/Reason', and 'Q&A' types.
For every question, provide a brief, easy-to-understand explanation for the correct answer. Ensure the output is a valid JSON array of question objects.`;
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                     config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: 'ARRAY', items: { type: 'OBJECT', properties: { type: { type: 'STRING' }, question: { type: 'STRING' }, reason: { type: 'STRING' }, options: { type: 'ARRAY', items: { type: 'STRING' } }, answer: { type: 'STRING' }, explanation: { type: 'STRING' } }, required: ['type', 'question', 'options', 'answer', 'explanation'] } },
                    },
                });
                result = JSON.parse(response.text.trim());
                break;
            }

            case 'generateNotes': {
                const { topic, grade } = payload;
                const prompt = `You are an expert academic content creator for students in India. Generate a comprehensive, structured set of study notes for the chapter "${topic}" from the India NCERT Grade ${grade} Science textbook. Organize into logical sections with a title and 3-5 key bullet points each.`;
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: 'OBJECT', properties: { notes: { type: 'ARRAY', items: { type: 'OBJECT', properties: { title: { type: 'STRING' }, points: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['title', 'points'] } } }, required: ['notes'] },
                    },
                });
                result = JSON.parse(response.text.trim()).notes;
                break;
            }
             case 'getChatResponse': {
                const { grade, history, language, topic } = payload;
                 let langInstruction = 'Respond in clear and simple English.';
                 const systemInstruction = `You are a friendly and masterful science tutor for a Grade ${grade} student in India. Your name is 'Curio'. The student wants to ask questions specifically about the chapter: "${topic}". Your goal is to teach, not just to answer. ${langInstruction} **Teaching Method:** NEVER give the full answer at once. Guide the student step-by-step. After one small step, ALWAYS ask a simple question to check for understanding. Use analogies, lists, and short sentences. Be encouraging. Stay on topic.`;

                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: history,
                    config: { systemInstruction },
                });
                result = response.text;
                break;
            }
            
            case 'generateGreeting': {
                const { grade, language, topic } = payload;
                 let langInstruction = "in clear and simple English.";
                const prompt = `You are a friendly AI science tutor 'Curio'. Provide a very short, welcoming opening message for a Grade ${grade} student to start a doubt-solving session about '${topic}'. The message should be **${langInstruction}** Keep it to one or two sentences.`;
                const response = await generateContent({ model: "gemini-2.5-flash", contents: prompt });
                result = response.text;
                break;
            }

            case 'generateDiagramIdeas': {
                const { topic, grade } = payload;
                const prompt = `You are an expert science educator. Brainstorm 8 essential diagrams to help a Grade ${grade} student understand the chapter "${topic}". For each, provide a 'prompt' for an AI image model (simple, clear, black and white textbook line drawing) and a short 'description' for the student.`;
                const response = await generateContent({
                    model: "gemini-2.5-flash", contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: 'OBJECT', properties: { diagrams: { type: 'ARRAY', items: { type: 'OBJECT', properties: { prompt: { type: 'STRING' }, description: { type: 'STRING' } }, required: ['prompt', 'description'] } } }, required: ['diagrams'] },
                    }
                });
                result = JSON.parse(response.text.trim()).diagrams;
                break;
            }

            case 'generateDiagramImage': {
                const { prompt } = payload;
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: prompt,
                    config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
                });
                if (!response.generatedImages || response.generatedImages.length === 0) {
                    throw new Error("Image generation returned no images.");
                }
                result = response.generatedImages[0].image.imageBytes;
                break;
            }
            
            case 'generateTextForMode': {
                 const { mode, userInput, grade, topic } = payload;
                 let systemInstruction = "You are a helpful and engaging AI science expert.";
                 let contents = `My question: "${userInput}"`;
                 let useSearch = false;
                 if (mode === 'real_world_links') useSearch = true;
                const response = await generateContent({
                    model: "gemini-2.5-flash", contents, config: { systemInstruction, tools: useSearch ? [{ googleSearch: {} }] : undefined }
                });
                result = { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
                break;
            }

            case 'explainImageWithText': {
                const { base64Image, mimeType, prompt } = payload;
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: { parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }] },
                });
                result = response.text;
                break;
            }
            
            case 'generateScienceFairIdeas': {
                const { userInput } = payload;
                const prompt = `Brainstorm 3 unique and engaging science fair project ideas based on the student's interest in: "${userInput}". For each, provide a catchy 'title' and a detailed 'description'.`;
                const response = await generateContent({
                    model: "gemini-2.5-flash", contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: 'OBJECT', properties: { ideas: { type: 'ARRAY', items: { type: 'OBJECT', properties: { title: { type: 'STRING' }, description: { type: 'STRING' } }, required: ['title', 'description'] } } }, required: ['ideas'] },
                    }
                });
                result = JSON.parse(response.text.trim()).ideas;
                break;
            }
            
            case 'generateScienceFairPlan': {
                const { projectTitle, projectDescription } = payload;
                const prompt = `Create a detailed, 5-step plan for a science fair project. Title: "${projectTitle}". Description: "${projectDescription}". For each step, provide a 'stepTitle' and detailed 'instructions'.`;
                const response = await generateContent({
                    model: "gemini-2.5-flash", contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: 'OBJECT', properties: { plan: { type: 'ARRAY', items: { type: 'OBJECT', properties: { stepTitle: { type: 'STRING' }, instructions: { type: 'STRING' } }, required: ['stepTitle', 'instructions'] } } }, required: ['plan'] },
                    }
                });
                result = JSON.parse(response.text.trim()).plan;
                break;
            }

             case 'generateScientistGreeting': {
                const { scientist } = payload;
                const prompt = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Provide a short, welcoming opening message to start a chat session with a student. Speak in the first person.`;
                const response = await generateContent({ model: "gemini-2.5-flash", contents: prompt });
                result = response.text;
                break;
            }

            case 'getHistoricalChatResponse': {
                const { scientist, history } = payload;
                const systemInstruction = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Act and speak as this person, from their historical perspective and personality. Keep responses concise and engaging.`;
                const response = await generateContent({ model: "gemini-2.5-flash", contents: history, config: { systemInstruction } });
                result = response.text;
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in gemini-proxy:', error);
        return res.status(500).json({ message: error instanceof Error ? error.message : "An internal server error occurred." });
    }
}