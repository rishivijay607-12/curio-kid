import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, RedisClientType } from 'redis';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import type { QuizQuestion, Grade, Difficulty, MultiplayerRoom, PlayerScore } from '../types';

let redisClient: RedisClientType | null = null;
const getRedisClient = async (): Promise<RedisClientType> => {
    if (redisClient && redisClient.isOpen) return redisClient;
    if (!process.env.REDIS_URL) throw new Error('Database (Redis) is not configured correctly.');
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    return redisClient;
};

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    if (!process.env.API_KEY) return res.status(500).json({ error: "AI service API key is missing on the server." });
    
    const { action, params } = req.body;
    if (!action) return res.status(400).json({ error: 'Missing action.' });

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let result: any;
        switch (action) {
            case 'createRoom':
                result = await createRoom(ai, params);
                break;
            case 'joinRoom':
                result = await joinRoom(params);
                break;
            case 'getRoomState':
                result = await getRoomState(params.roomId);
                break;
            case 'startGame':
                result = await startGame(params.roomId, params.username);
                break;
            case 'submitAnswer':
                result = await submitAnswer(params);
                break;
            case 'nextQuestion':
                result = await nextQuestion(params.roomId, params.username);
                break;
            default:
                return res.status(400).json({ error: 'Invalid action.' });
        }
        return res.status(200).json(result);
    } catch (error: any) {
        console.error(`[MULTIPLAYER_API_ERROR] Action: "${action}" failed:`, error);
        return res.status(error.status || 500).json({ error: error.message || 'An internal server error occurred.' });
    }
}

// --- Service Functions ---

const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getQuizQuestions = async (ai: GoogleGenAI, { topic, grade, difficulty, count }: any): Promise<QuizQuestion[]> => {
    const prompt = `Generate ${count} unique, multiple-choice science quiz questions for Grade ${grade} on "${topic}" with ${difficulty} difficulty. For each: type must be "MCQ", provide a question, 4 options, the correct answer, and a brief explanation.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['type', 'question', 'options', 'answer', 'explanation'] } },
        },
    });
    return JSON.parse(response.text) as QuizQuestion[];
};

const createRoom = async (ai: GoogleGenAI, { config, host }: { config: any, host: string }): Promise<MultiplayerRoom> => {
    const client = await getRedisClient();
    const roomId = generateRoomId();
    const questions = await getQuizQuestions(ai, config);

    const roomData = {
        ...config,
        roomId,
        host,
        status: 'lobby',
        currentQuestionIndex: -1,
        questions: JSON.stringify(questions),
    };

    const multi = client.multi();
    multi.hSet(`room:${roomId}`, roomData);
    multi.sAdd(`room:${roomId}:players`, host);
    multi.zAdd(`room:${roomId}:scores`, { score: 0, value: host });
    multi.expire(`room:${roomId}`, 7200); // 2-hour TTL for all room keys
    multi.expire(`room:${roomId}:players`, 7200);
    multi.expire(`room:${roomId}:scores`, 7200);
    await multi.exec();

    return await getRoomState(roomId);
};

const joinRoom = async ({ roomId, username }: { roomId: string, username: string }): Promise<MultiplayerRoom> => {
    const client = await getRedisClient();
    roomId = roomId.toUpperCase();
    const roomExists = await client.exists(`room:${roomId}`);
    if (!roomExists) throw { status: 404, message: 'Room not found.' };

    const status = await client.hGet(`room:${roomId}`, 'status');
    if (status !== 'lobby') throw { status: 403, message: 'This quiz is already in progress.' };

    const multi = client.multi();
    multi.sAdd(`room:${roomId}:players`, username);
    multi.zAdd(`room:${roomId}:scores`, { score: 0, value: username });
    await multi.exec();
    
    return await getRoomState(roomId);
};

const getRoomState = async (roomId: string): Promise<MultiplayerRoom> => {
    const client = await getRedisClient();
    roomId = roomId.toUpperCase();
    const roomData = await client.hGetAll(`room:${roomId}`);
    if (!roomData.host) throw { status: 404, message: 'Room not found.' };

    const [players, scoresWithValues] = await Promise.all([
        client.sMembers(`room:${roomId}:players`),
        client.zRangeWithScores(`room:${roomId}:scores`, 0, -1, { REV: true })
    ]);
    
    const scores = scoresWithValues.map(s => ({ username: s.value, score: s.score }));

    return {
        roomId,
        host: roomData.host,
        grade: Number(roomData.grade) as Grade,
        topic: roomData.topic,
        difficulty: roomData.difficulty as Difficulty,
        quizLength: Number(roomData.quizLength),
        status: roomData.status as 'lobby' | 'in-progress' | 'finished',
        players,
        questions: JSON.parse(roomData.questions),
        currentQuestionIndex: Number(roomData.currentQuestionIndex),
        scores,
    };
};

const startGame = async (roomId: string, username: string): Promise<MultiplayerRoom> => {
    const client = await getRedisClient();
    roomId = roomId.toUpperCase();
    const host = await client.hGet(`room:${roomId}`, 'host');
    if (host !== username) throw { status: 403, message: 'Only the host can start the game.' };
    
    await client.hSet(`room:${roomId}`, 'status', 'in-progress');
    await client.hSet(`room:${roomId}`, 'currentQuestionIndex', '0');
    
    return getRoomState(roomId);
};

const submitAnswer = async ({ roomId, username, questionIndex, isCorrect, timeTaken }: { roomId: string, username: string, questionIndex: number, isCorrect: boolean, timeTaken: number }): Promise<void> => {
    if (!isCorrect) return; // No points for wrong answers
    // Score calculation: max 1000 points, decreasing with time.
    const score = Math.max(10, 1000 - Math.floor(timeTaken * 40));
    
    const client = await getRedisClient();
    roomId = roomId.toUpperCase();
    await client.zIncrBy(`room:${roomId}:scores`, score, username);
};

const nextQuestion = async (roomId: string, username: string): Promise<MultiplayerRoom> => {
    const client = await getRedisClient();
    roomId = roomId.toUpperCase();
    const [host, currentIndexStr, quizLengthStr] = await client.hmGet(`room:${roomId}`, ['host', 'currentQuestionIndex', 'quizLength']);
    
    if (host !== username) throw { status: 403, message: 'Only the host can move to the next question.' };
    
    const currentIndex = Number(currentIndexStr);
    const quizLength = Number(quizLengthStr);

    if (currentIndex >= quizLength - 1) {
        await client.hSet(`room:${roomId}`, 'status', 'finished');
    } else {
        await client.hIncrBy(`room:${roomId}`, 'currentQuestionIndex', 1);
    }
    
    return getRoomState(roomId);
};
