
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createClient, RedisClientType } from 'redis';
import type { CommunityMessage } from '../types';

let redisClient: RedisClientType | null = null;

const getRedisClient = async (): Promise<RedisClientType> => {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }
    if (!process.env.REDIS_URL) {
        throw new Error('Database is not configured correctly on the server.');
    }
    redisClient = createClient({
        url: process.env.REDIS_URL,
    });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    return redisClient;
};

// --- AI Sanitization Logic ---
const sanitizeMessage = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) return text; // Fail open if no key, or fail closed? Let's return original to not break chat, but typically fail closed is safer.
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are a strict content moderator for a children's science app. 
        Your task is to rewrite the following user message to ensure it is safe.
        
        Rules:
        1. Replace any profanity, hate speech, sexual content, or bullying with asterisks (***).
        2. Replace any personally identifiable information (phone numbers, emails, home addresses) with [REDACTED].
        3. Keep the rest of the message EXACTLY as it is. Do not add conversational filler like "Here is the sanitized text".
        4. If the message is completely safe, return it identical to the input.
        
        Message: "${text}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text?.trim() || text;
    } catch (error) {
        console.error("Sanitization failed:", error);
        return text; // Fallback to original text if AI fails
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, params } = req.body;

    try {
        const client = await getRedisClient();

        if (action === 'getMessages') {
            // Retrieve last 50 messages
            const messages = await client.lRange('global_chat_messages', 0, 49);
            // Redis stores newest on left (index 0) if we use lPush. 
            // If we want chronological order for the UI, we might need to reverse or store differently.
            // Let's assume lPush/lRange returns [newest, ..., oldest]. UI expects [oldest, ..., newest].
            const parsedMessages = messages.map(m => JSON.parse(m)).reverse();
            return res.status(200).json(parsedMessages);
        }

        if (action === 'sendMessage') {
            const { username, text } = params;
            if (!username || !text || !text.trim()) {
                return res.status(400).json({ error: 'Invalid message data.' });
            }

            // 1. Sanitize
            const sanitizedText = await sanitizeMessage(text.trim());

            // 2. Construct Message Object
            const message: CommunityMessage = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                username,
                text: sanitizedText,
                timestamp: new Date().toISOString(),
                isSanitized: sanitizedText !== text.trim()
            };

            // 3. Store in Redis (List)
            // LPush adds to the head. We keep the list capped at 100 messages to save space.
            await client.lPush('global_chat_messages', JSON.stringify(message));
            await client.lTrim('global_chat_messages', 0, 99);

            return res.status(200).json({ success: true, message });
        }

        return res.status(400).json({ error: 'Invalid action.' });

    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
