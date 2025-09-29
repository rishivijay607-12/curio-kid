import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, ChatMessage, Language, NoteSection, AppMode, GroundingChunk, GenerativeTextResult, ScienceFairIdea, ScienceFairPlanStep, Scientist, DiagramIdea } from '../types';

// This placeholder value is meant to be replaced by a CI/CD pipeline (like GitHub Actions) during deployment.
// In your GitHub repository settings, create a secret (e.g., `GEMINI_API_KEY`).
// Your deployment workflow should then use a script to find and replace "__API_KEY_PLACEHOLDER__" with the value of your secret.
const apiKey = "__API_KEY_PLACEHOLDER__";

const getApiKey = (): string => {
    if (apiKey === "__API_KEY_PLACEHOLDER__" || !apiKey) {
        console.warn("Gemini API key not provided. AI features will not work. Please configure your deployment pipeline.");
        return 'MISSING_API_KEY'; // Return a non-functional key to avoid crashing the app.
    }
    return apiKey;
};


// --- Singleton AI Instance ---
const ai = new GoogleGenAI({ apiKey: getApiKey() });


// --- Safety Settings (now synchronous) ---
function getSafetySettings() {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ];
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        type: {
            type: Type.STRING,
            description: "The type of question. Must be one of: 'MCQ', 'True/False', 'Assertion/Reason', 'Q&A'.",
        },
        question: {
            type: Type.STRING,
            description: "The main question text. For 'Assertion/Reason' type, this is the Assertion (A)."
        },
        reason: {
            type: Type.STRING,
            description: "The Reason (R) text. This is ONLY required for 'Assertion/Reason' type questions."
        },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of possible answers. For 'True/False', this must be ['True', 'False']. For 'Assertion/Reason', provide the standard A/R options. For 'Q&A', this must be an empty array []."
        },
        answer: { type: Type.STRING },
        explanation: {
            type: Type.STRING,
            description: "A brief and simple explanation of why the answer is correct, or a more detailed version of the answer for Q&A. Tailored for the student's grade level."
        },
    },
    required: ['type', 'question', 'options', 'answer', 'explanation'],
};

const worksheetSchema = {
    type: Type.ARRAY,
    items: questionSchema,
};

const notesSchema = {
    type: Type.OBJECT,
    properties: {
        notes: {
            type: Type.ARRAY,
            description: "An array of note sections. Each section should have a title and a list of bullet points.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the note section (sub-topic)." },
                    points: {
                        type: Type.ARRAY,
                        description: "An array of 3-5 key bullet points for this section.",
                        items: { type: Type.STRING }
                    }
                },
                required: ['title', 'points']
            }
        }
    },
    required: ['notes'],
};


export const generateQuizQuestions = async (
    topic: string,
    grade: Grade,
    difficulty: Difficulty,
    count: number,
    onProgress: (progress: { current: number; total: number }) => void
): Promise<QuizQuestion[]> => {
    const maxRetries = 3;
    const questions: QuizQuestion[] = [];
    const BATCH_SIZE = 5; // Generate questions in batches for speed

    onProgress({ current: 0, total: count });

    const numBatches = Math.ceil(count / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
        const remaining = count - questions.length;
        const batchCount = Math.min(BATCH_SIZE, remaining);

        if (batchCount <= 0) break;

        let lastError: unknown;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const prompt = `You are an expert quiz creator for middle and high school students in India.
Generate a set of ${batchCount} unique, multiple-choice science quiz questions based on the content from the India NCERT Grade ${grade} Science textbook, focusing on the chapter: "${topic}".

Each question must be of **${difficulty}** difficulty.
- For 'Easy' difficulty: Questions should cover fundamental concepts.
- For 'Medium' difficulty: Questions should be at the standard grade level.
- For 'Hard' difficulty: Questions should be challenging and require critical thinking.

The questions should be different from each other and from any of these previous questions: ${questions.map(q => `"${q.question}"`).join(', ')}

For each question:
- The type must be "MCQ".
- Provide a clear question and 4 plausible options.
- The correct answer must be one of the provided options.
- Provide a brief, easy-to-understand explanation for why the correct answer is correct.`;

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: worksheetSchema, // Re-using worksheet schema which is an array of questions
                    },
                });

                const jsonText = response.text.trim();
                const newQuestions = JSON.parse(jsonText);

                if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
                    throw new Error("Received malformed or empty batch of questions from API.");
                }

                for(const q of newQuestions) {
                    if (!q || typeof q.question !== 'string') {
                         console.warn("Skipping a malformed question object in the batch:", q);
                         continue;
                    }
                    questions.push({ ...q, type: 'MCQ' });
                }

                onProgress({ current: questions.length, total: count });
                lastError = null; // Success, reset error
                break; // Exit retry loop

            } catch (error) {
                lastError = error;
                const errorString = JSON.stringify(error).toLowerCase();
                console.error(`Error generating quiz batch ${batchIndex + 1} (attempt ${attempt}/${maxRetries}):`, error);

                if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                    if (attempt < maxRetries) {
                        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                        console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                        await delay(waitTime);
                        continue;
                    }
                }
                break; // for non-retriable errors
            }
        }
        if (lastError) {
             console.error(`Failed to generate batch ${batchIndex + 1} after ${maxRetries} retries. Continuing with next batch.`, lastError);
        }
    }

    if (questions.length === 0 && count > 0) {
        throw new Error("Failed to generate any quiz questions. Please try again.");
    }

    return questions.slice(0, count); // Ensure we don't over-return
};

export const generateWorksheet = async (
    topic: string, 
    grade: Grade, 
    difficulty: Difficulty, 
    count: number,
    onProgress: (progress: { current: number, total: number }) => void
): Promise<QuizQuestion[]> => {
    const maxRetries = 3;
    onProgress({ current: 0, total: count });
    
    const allQuestions: QuizQuestion[] = [];

    const numTypes = 4;
    const baseCount = Math.floor(count / numTypes);
    const remainder = count % numTypes;
    const counts = Array(numTypes).fill(baseCount);
    for (let i = 0; i < remainder; i++) {
        counts[i]++;
    }
    const [numMCQ, numTF, numAR, numQA] = counts;

    const questionTypesToGenerate: { type: 'MCQ' | 'True/False' | 'Assertion/Reason' | 'Q&A', count: number, instructions: string }[] = [];

    if (numMCQ > 0) {
        questionTypesToGenerate.push({
            type: 'MCQ', count: numMCQ, instructions: `For 'MCQ':
- type: "MCQ"
- Provide a clear question and 4 plausible options.`
        });
    }
    if (numTF > 0) {
        questionTypesToGenerate.push({
            type: 'True/False', count: numTF, instructions: `For 'True/False':
- type: "True/False"
- Provide a statement that is either true or false.
- The options array must be exactly ["True", "False"].`
        });
    }
    if (numAR > 0) {
        questionTypesToGenerate.push({
            type: 'Assertion/Reason', count: numAR, instructions: `For 'Assertion/Reason':
- type: "Assertion/Reason"
- The 'question' field should contain the Assertion (A).
- The 'reason' field should contain the Reason (R).
- The options must be the standard four choices:
    - "Both A and R are true and R is the correct explanation of A."
    - "Both A and R are true but R is not the correct explanation of A."
    - "A is true but R is false."
    - "A is false but R is true."
- The 'answer' must be one of these four options.`
        });
    }
    if (numQA > 0) {
        questionTypesToGenerate.push({
            type: 'Q&A', count: numQA, instructions: `For 'Q&A':
- type: "Q&A"
- Provide a direct question that requires a short text answer.
- The 'options' array must be an empty array: [].
- The 'answer' field must contain the correct, concise answer.
- The 'explanation' should be a slightly more detailed version of the answer if needed.`
        });
    }

    for (const { type, count, instructions } of questionTypesToGenerate) {
        if (count === 0) continue;
        
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const prompt = `You are an expert worksheet creator for middle and high school students in India.
Generate a set of ${count} unique science questions of type "${type}" based on the content from the India NCERT Grade ${grade} Science textbook, focusing on the chapter: "${topic}".
All questions must be of **${difficulty}** difficulty.

Follow these instructions for each question:
${instructions}

For every question, you must provide a brief, easy-to-understand explanation for the correct answer.`;

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: worksheetSchema,
                    },
                });

                const jsonText = response.text.trim();
                const questions = JSON.parse(jsonText);

                if (Array.isArray(questions)) {
                    allQuestions.push(...questions);
                    onProgress({ current: allQuestions.length, total: count });
                } else {
                     console.warn(`Expected an array for ${type}, but received a different type. Skipping this batch.`);
                }
                
                lastError = null; // Success
                break; // Exit retry loop
            } catch (error) {
                lastError = error;
                const errorString = JSON.stringify(error).toLowerCase();
                console.error(`Error generating worksheet batch ${type} (attempt ${attempt}/${maxRetries}):`, error);

                if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                    if (attempt < maxRetries) {
                        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                        console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                        await delay(waitTime);
                        continue;
                    }
                }
                break; // for non-retriable errors
            }
        }
        if (lastError) {
            console.error(`Failed to generate questions for type ${type} after retries.`, lastError);
        }
    }

    if (allQuestions.length === 0 && count > 0) {
        throw new Error("Received no questions from the API. The model might be unable to generate content for this topic.");
    }
    
    return allQuestions as QuizQuestion[];
};

export const generateNotes = async (topic: string, grade: Grade): Promise<NoteSection[]> => {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const prompt = `You are an expert academic content creator for middle and high school students in India.
Please generate a comprehensive, structured set of study notes for the chapter "${topic}" from the India NCERT Grade ${grade} Science textbook.

The notes should be organized into logical sections.
First, identify the main sub-topics within the chapter.
For each sub-topic, create a section with a clear 'title'.
Under each title, provide 3-5 key bullet points that summarize the most important concepts, definitions, and formulas for that sub-topic.
The language used should be clear, simple, and easy for a Grade ${grade} student to understand and review quickly.
`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: notesSchema,
                },
            });

            const jsonText = response.text.trim();
            const parsedResponse = JSON.parse(jsonText);

            if (!parsedResponse.notes || !Array.isArray(parsedResponse.notes) || parsedResponse.notes.length === 0) {
                 throw new Error("Received malformed notes data from API.");
            }

            // Add validation for the new structure
            for (const section of parsedResponse.notes) {
                if (typeof section.title !== 'string' || !Array.isArray(section.points)) {
                    throw new Error("Received malformed note section data from API.");
                }
            }

            return parsedResponse.notes as NoteSection[];

        } catch (error) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            console.error(`Error generating notes (attempt ${attempt}/${maxRetries}):`, error);

            if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                if (attempt < maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                    await delay(waitTime);
                    continue;
                } else {
                    throw new Error("The server is busy. Please wait a moment and try again.");
                }
            }
            break; // for non-retriable errors
        }
    }
    console.error("Failed to generate notes after retries:", lastError);
    throw new Error("Failed to generate the notes. Please try again.");
};

export const generateGreeting = async (grade: Grade, language: Language, topic: string): Promise<string> => {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            let langInstruction = '';
            switch (language) {
                case 'English+Tamil':
                    langInstruction = "in a mix of English and Tamil (Tanglish), using the English alphabet. For example: 'Vanakkam! Eppadi irukeenga? Let's start learning science!'";
                    break;
                case 'English+Malayalam':
                    langInstruction = "in a mix of English and Malayalam (Manglish), using the English alphabet. For example: 'Namaskaram! Sukhamaano? Let's start learning science!'";
                    break;
                case 'English+Hindi':
                    langInstruction = "in a mix of English and Hindi (Hinglish), using the English alphabet. For example: 'Namaste! Kaise ho aap? Let's start learning science!'";
                    break;
                case 'English+Telugu':
                    langInstruction = "in a mix of English and Telugu (Tenglish), using the English alphabet. For example: 'Namaskaram! Ela unnaru? Let's start learning science!'";
                    break;
                case 'English+Kannada':
                    langInstruction = "in a mix of English and Kannada (Kanglish), using the English alphabet. For example: 'Namaskara! Hegiddeera? Let's start learning science!'";
                    break;
                default: // English
                    langInstruction = "in clear and simple English.";
            }

            const prompt = `You are a friendly and encouraging AI science tutor named 'Curio' for a Grade ${grade} student.
Your task is to provide a very short, welcoming opening message to start a doubt-solving session.
The message should be **${langInstruction}**
Keep it to one or two sentences. For example: "Hello! I'm Curio, your science tutor. Ask me anything about the chapter '${topic}'!"
`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            return response.text;

        } catch (error) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            console.error(`Error generating greeting (attempt ${attempt}/${maxRetries}):`, error);

            if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                if (attempt < maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                    await delay(waitTime);
                    continue;
                } else {
                    throw new Error("The server is busy. Please wait a moment and try again.");
                }
            }
            break; // for non-retriable errors
        }
    }
    console.error("Failed to generate greeting after retries:", lastError);
    throw new Error("Failed to generate a greeting. Please try again.");
};

export const getChatResponse = async (grade: Grade, history: ChatMessage[], language: Language, topic: string): Promise<string> => {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            let langInstruction = '';
            switch (language) {
                case 'English+Tamil':
                    langInstruction = "Respond in a mix of English and Tamil (Tanglish), using the English alphabet. For example, 'That's a great question! Intha concept name...'";
                    break;
                case 'English+Malayalam':
                    langInstruction = "Respond in a mix of English and Malayalam (Manglish), using the English alphabet. For example, 'Sathyam! Aa chodyam nallathanu...'";
                    break;
                case 'English+Hindi':
                    langInstruction = "Respond in a mix of English and Hindi (Hinglish), using the English alphabet. For example, 'Bilkul! Yeh question bahut accha hai...'";
                    break;
                case 'English+Telugu':
                    langInstruction = "Respond in a mix of English and Telugu (Tenglish), using the English alphabet. For example, 'Avunu! Ee prashna chala bagundi...'";
                    break;
                case 'English+Kannada':
                    langInstruction = "Respond in a mix of English and Kannada (Kanglish), using the English alphabet. For example, 'Khandita! Ee prashne chennagide...'";
                    break;
                default: // English
                    langInstruction = "Respond in clear and simple English.";
            }

            const systemInstruction = `You are a friendly and masterful science tutor for a Grade ${grade} student in India. Your name is 'Curio'.
The student wants to ask questions specifically about the chapter: "${topic}".
Your goal is to teach, not just to answer.
${langInstruction}

**Your Teaching Method (Very Important!):**
1.  **NEVER give the full answer at once.** Your primary method is to guide the student to the answer step-by-step.
2.  **Break it down:** When a student asks a question, give only the first, simplest step of the explanation.
3.  **Check for Understanding:** After explaining one small step, ALWAYS ask a simple question to check if they understood, like "Does that make sense so far?" or "Ready for the next step?".
4.  **Wait for their response:** Do not provide the next step until the student responds affirmatively (e.g., "yes", "okay", "got it").
5.  **Use Analogies:** Use simple analogies and real-world examples that a Grade ${grade} student can relate to.
6.  **Use Lists & Short Sentences:** Always prefer numbered lists (1., 2., 3.) and bullet points over paragraphs. Keep sentences short and clear.
7.  **Be Encouraging:** Maintain a positive, patient, and encouraging tone. Start your messages with phrases like "Excellent question!", "Let's explore that together.", or "That's a great place to start!".
8.  **Stay on Topic:** Stick to science topics related to the chapter "${topic}". If asked something else, gently guide them back.`;
            
            const contents = history;
            const safetySettings = getSafetySettings();

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    safetySettings,
                },
            });

            return response.text;
        } catch (error) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            console.error(`Error getting chat response (attempt ${attempt}/${maxRetries}):`, error);

            if (errorString.includes('blocked')) {
                throw new Error("The response was blocked due to safety settings. Please rephrase your question.");
            }

            // Check for rate limit error
            if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                if (attempt < maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // exponential backoff with jitter
                    console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                    await delay(waitTime);
                    continue; // retry
                } else {
                    // All retries failed for rate limiting
                    throw new Error("You're sending messages too quickly! Please wait a moment and try again.");
                }
            }
            
            // For other errors, break and throw a generic message
            break;
        }
    }

    // If loop finished due to a non-retriable error
    console.error("Failed to get chat response after retries:", lastError);
    throw new Error("Failed to get a response from the AI tutor. Please try again.");
};

interface DiagramIdeaResponse {
    prompt: string;
    description: string;
}

const diagramIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        diagrams: {
            type: Type.ARRAY,
            description: "An array of exactly 8 diagram ideas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    prompt: {
                        type: Type.STRING,
                        description: "A detailed, descriptive prompt for an image generation model to create a clear, simple, black and white scientific diagram. The style should be like a textbook line drawing. For example: 'A simple line drawing of the water cycle, showing evaporation, condensation, precipitation, and collection. Use clear labels and arrows.'"
                    },
                    description: {
                        type: Type.STRING,
                        description: "A simple, one-sentence explanation of the diagram for the student."
                    }
                },
                required: ['prompt', 'description']
            }
        }
    },
    required: ['diagrams'],
};

export const generateDiagramIdeas = async (topic: string, grade: Grade): Promise<DiagramIdea[]> => {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const prompt = `You are an expert science educator. Your task is to brainstorm 8 essential diagrams to help a Grade ${grade} student understand the chapter "${topic}" from the India NCERT Science textbook.

For each of the 8 diagrams, provide two things:
1.  A 'prompt': A detailed, effective prompt for an AI image generation model (like Imagen). The prompt must describe a simple, clear, scientific line drawing, like one found in a textbook. It should be black and white, with clear labels for all important parts.
2.  A 'description': A very short, one-sentence explanation of what the diagram shows, written for the student.

Generate exactly 8 diagram ideas.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: diagramIdeasSchema,
                },
            });

            const jsonText = response.text.trim();
            const parsedResponse = JSON.parse(jsonText);

            if (!parsedResponse.diagrams || !Array.isArray(parsedResponse.diagrams) || parsedResponse.diagrams.length !== 8) {
                 throw new Error("Received malformed diagram ideas from API. Expected 8 diagrams.");
            }

            // Add a unique ID to each idea for client-side state management.
            const ideasWithIds: DiagramIdea[] = parsedResponse.diagrams.map((idea: DiagramIdeaResponse) => ({
                ...idea,
                id: self.crypto.randomUUID(),
            }));

            return ideasWithIds;

        } catch (error) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            console.error(`Error generating diagram ideas (attempt ${attempt}/${maxRetries}):`, error);

            if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                if (attempt < maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                    await delay(waitTime);
                    continue;
                } else {
                    throw new Error("The server is busy. Please wait a moment and try again.");
                }
            }
            break; // for non-retriable errors
        }
    }
    console.error("Failed to generate diagram ideas after retries:", lastError);
    throw new Error("Failed to generate diagram ideas. Please try again.");
};

export const generateDiagramImage = async (prompt: string): Promise<string> => {
    const maxRetries = 3;
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/png',
                  aspectRatio: '1:1',
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error("Image generation returned no images.");
            }

            return response.generatedImages[0].image.imageBytes;

        } catch(error) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            console.error(`Error generating diagram image (attempt ${attempt}/${maxRetries}):`, error);

            if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                if (attempt < maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                    await delay(waitTime);
                    continue;
                } else {
                    throw new Error("The server is too busy to generate images right now. Please try again later.");
                }
            }
            // For other errors, re-throw immediately so the calling function can handle it (e.g., skip the image).
            throw error; 
        }
    }
    // This code is unreachable if the loop always throws or returns, but it's good practice for type safety.
    console.error("Failed to generate diagram image after retries:", lastError);
    throw new Error("Failed to generate diagram image. Please try again.");
};


export const generateTextForMode = async (
    mode: AppMode,
    userInput: string,
    grade?: Grade,
    topic?: string
): Promise<GenerativeTextResult> => {
    let systemInstruction = "You are a helpful and engaging AI science expert.";
    let contents = `My question: "${userInput}"`;
    let useSearch = false;

    if (grade && topic) {
        systemInstruction = `You are a helpful and engaging AI science expert for a Grade ${grade} student in India. The student is currently studying the chapter "${topic}".`;
        contents = `Chapter: "${topic}"\nGrade: ${grade}\nMy question: "${userInput}"`;
    }

    switch (mode) {
        case 'concept_deep_dive':
            systemInstruction += "\nYour task is to provide a detailed, in-depth explanation of the concept the student asks about. Use simple language, analogies, and break down complex ideas into easy-to-understand steps. Use lists and bold text to structure your answer clearly.";
            break;
        case 'virtual_lab':
            systemInstruction += "\nYour task is to act as a virtual lab assistant. The student will name an experiment. You must provide clear, step-by-step instructions on how to perform this experiment virtually. List the materials needed (virtual), the procedure, and what observations the student should expect. Start with a safety warning.";
            break;
        case 'real_world_links':
            systemInstruction += "\nYour task is to connect science concepts from the student's question to the real world. Provide 2-3 clear and interesting examples of how the concept applies in everyday life or technology. Use Google Search to find relevant and up-to-date examples and information.";
            useSearch = true;
            break;
        case 'story_weaver':
            systemInstruction += `\nYou are a creative storyteller. Your task is to weave a short, fun, and educational story based on the science concept the student provides. The story should be engaging${grade ? ` for a Grade ${grade} student` : ''} and accurately explain the science concept within the narrative.`;
            break;
        case 'what_if':
            systemInstruction += "\nYou are a creative and scientific thinker. Your task is to answer the student's hypothetical 'What if...?' questions. Provide a scientifically plausible, yet imaginative and engaging explanation.";
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                tools: useSearch ? [{ googleSearch: {} }] : undefined,
            },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        return {
            text: response.text,
            sources: sources as GroundingChunk[] | undefined,
        };
    } catch (error) {
        console.error(`Error in generateTextForMode (mode: ${mode})`, error);
        throw new Error("Failed to get a response from the AI. Please try again.");
    }
};

export const explainImageWithText = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error in explainImageWithText:", error);
        throw new Error("Failed to analyze the image. Please try another image or prompt.");
    }
};

const scienceFairIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            description: "An array of exactly 3 science fair project ideas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy and descriptive title for the project." },
                    description: { type: Type.STRING, description: "A detailed, 3-4 sentence paragraph describing the project, its goals, and why it's interesting." }
                },
                required: ['title', 'description']
            }
        }
    },
    required: ['ideas'],
};

export const generateScienceFairIdeas = async (userInput: string): Promise<ScienceFairIdea[]> => {
    const prompt = `You are a helpful and creative science fair assistant. The student is interested in the following topics: "${userInput}".
Brainstorm 3 unique and engaging science fair project ideas based on their interests.
For each idea, provide a unique, catchy 'title' and a detailed 'description' (3-4 sentences) explaining the project, what the student will investigate, and why it's a good project.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scienceFairIdeasSchema,
            },
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
            throw new Error("API returned malformed data for science fair ideas.");
        }
        return parsed.ideas;
    } catch (error) {
        console.error("Error generating science fair ideas:", error);
        throw new Error("Failed to brainstorm project ideas. Please try again.");
    }
};


const scienceFairPlanSchema = {
    type: Type.OBJECT,
    properties: {
        plan: {
            type: Type.ARRAY,
            description: "An array of exactly 5 steps for the science fair project plan.",
            items: {
                type: Type.OBJECT,
                properties: {
                    stepTitle: { type: Type.STRING, description: "The title for this step (e.g., 'Step 1: Research and Hypothesis')." },
                    instructions: { type: Type.STRING, description: "Detailed, paragraph-form instructions for this step, including materials needed, procedure, and what to document. Written clearly for a student." }
                },
                required: ['stepTitle', 'instructions']
            }
        }
    },
    required: ['plan'],
};

export const generateScienceFairPlan = async (
    projectTitle: string,
    projectDescription: string,
    onProgress: (progress: { current: number; total: number; message: string }) => void
): Promise<ScienceFairPlanStep[]> => {
    onProgress({ current: 0, total: 5, message: "Generating project plan text..." });

    // 1. Generate the text for all 5 steps first
    const textPlanPrompt = `You are an expert science fair mentor. A student has chosen the project:
Title: "${projectTitle}"
Description: "${projectDescription}"
Create a detailed, 5-step plan to guide the student through this project. For each of the 5 steps, provide a 'stepTitle' and detailed 'instructions'. The instructions should be a paragraph covering what to do, materials needed, and how to document the work. The language must be clear and encouraging for a middle or high school student.`;

    let textSteps: { stepTitle: string; instructions: string }[] = [];
    try {
        const textResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: textPlanPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scienceFairPlanSchema,
            },
        });
        const jsonText = textResponse.text.trim();
        const parsed = JSON.parse(jsonText);
        if (!parsed.plan || !Array.isArray(parsed.plan) || parsed.plan.length !== 5) {
            throw new Error("API returned a malformed project plan.");
        }
        textSteps = parsed.plan;
    } catch (error) {
        console.error("Error generating science fair plan text:", error);
        throw new Error("Failed to generate the project plan steps. Please try again.");
    }

    // 2. Generate an image for each step
    const finalPlan: ScienceFairPlanStep[] = [];
    for (let i = 0; i < textSteps.length; i++) {
        const step = textSteps[i];
        onProgress({ current: i, total: 5, message: `Generating visual for step ${i + 1}/5...` });
        
        try {
            const imagePrompt = `Photorealistic image of a student diligently working on a science fair project. The current step is "${step.stepTitle}". The scene should visually represent the instructions: "${step.instructions.substring(0, 200)}...". The setting is a well-lit home study area or a school lab. The tone is focused and inspiring.`;
            const imageBytes = await generateDiagramImage(imagePrompt);
            finalPlan.push({
                ...step,
                image: `data:image/png;base64,${imageBytes}`
            });
        } catch(imgError) {
             console.error(`Failed to generate image for step ${i+1}. Using a placeholder.`, imgError);
             // In a real app, you might have a generic placeholder image base64 string
             finalPlan.push({ ...step, image: '' });
        }
    }
    
    onProgress({ current: 5, total: 5, message: "Plan generated successfully!" });
    return finalPlan;
};


const chatWithRetry = async (config: any): Promise<string> => {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent(config);
            return response.text;
        } catch (error) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            console.error(`Error in chat (attempt ${attempt}/${maxRetries}):`, error);

            if (errorString.includes('blocked')) {
                throw new Error("The response was blocked due to safety settings. Please rephrase your question.");
            }
            if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
                if (attempt < maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000;
                    console.log(`Rate limit exceeded. Retrying in ${waitTime.toFixed(0)}ms...`);
                    await delay(waitTime);
                    continue;
                }
            }
            break; 
        }
    }
    console.error("Failed chat request after retries:", lastError);
    throw new Error("Failed to get a response from the AI. Please try again.");
};


export const generateScientistGreeting = async (scientist: Scientist): Promise<string> => {
    const prompt = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Here is a brief bio: "${scientist.description}".
Provide a short, welcoming opening message to start a chat session with a student. Speak in the first person ("I"). Keep it to one or two charismatic sentences.`;
    
    const response = await chatWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response;
};

export const getHistoricalChatResponse = async (scientist: Scientist, history: ChatMessage[]): Promise<string> => {
    const systemInstruction = `You are role-playing as ${scientist.name}, the famous ${scientist.field}. Here is a brief bio: "${scientist.description}".
You must consistently act and speak as this person, in the first person ("I").
Answer the user's questions from their historical perspective, knowledge, and personality.
Maintain the persona throughout the conversation. Keep your responses concise and engaging for a student.`;

    const safetySettings = getSafetySettings();

    const response = await chatWithRetry({
        model: "gemini-2.5-flash",
        contents: history,
        config: { systemInstruction, safetySettings },
    });
    return response;
};

export const live = {
    connect: (options: any) => {
        return ai.live.connect(options);
    },
};