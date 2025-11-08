
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import { createClient, RedisClientType } from 'redis';
import type { QuizQuestion, Grade, MultiplayerGameState, MultiplayerPlayer } from '../types.ts';

const QUIZ_ROUND_DURATION_MS = 20000; // 20 seconds per question

let redisClient: RedisClientType | null = null;

const getRedisClient = async (): Promise<RedisClientType> => {
    if (redisClient && redisClient.isOpen) return redisClient;
    if (!process.env.REDIS_URL) throw new Error('Database is not configured correctly on the server.');
    
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    return redisClient;
};

class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

const generateGameId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Main Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { action, params } = req.body;
    if (!action) return res.status(400).json({ error: 'Missing action.' });

    try {
        let result: any;
        switch (action) {
            case 'createGame': result = await createGame(params.username, params.isPublic); break;
            case 'joinGame': result = await joinGame(params.gameId, params.username); break;
            case 'getGameState': result = await getGameState(params.gameId); break;
            case 'getPublicGames': result = await getPublicGames(); break;
            case 'startGame': result = await startGame(params.gameId, params.grade, params.topic, params.quizLength); break;
            case 'submitAnswer': result = await submitAnswer(params.gameId, params.username, params.questionIndex, params.answer, params.timeTaken); break;
            case 'nextQuestion': result = await nextQuestion(params.gameId); break;
            default: throw new ApiError('Invalid action.', 400);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error(`[MULTIPLAYER_ERROR] Action "${action}" failed:`, error);
        const status = error instanceof ApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : 'An internal server error occurred.';
        return res.status(status).json({ error: message });
    }
}

// --- Service Functions ---

const createGame = async (username: string, isPublic: boolean): Promise<MultiplayerGameState> => {
    const client = await getRedisClient();
    let gameId = '';
    let attempts = 0;
    while(attempts < 10) {
        gameId = generateGameId();
        if (!(await client.exists(`game:${gameId}`))) break;
        attempts++;
    }
    if (attempts >= 10) throw new ApiError('Could not create a unique game ID.', 500);

    const newPlayer: MultiplayerPlayer = { username, score: 0, answeredThisRound: false };
    const gameState: MultiplayerGameState = {
        gameId,
        host: username,
        players: [newPlayer],
        status: 'lobby',
        questions: [],
        currentQuestionIndex: -1,
        roundEndTime: 0,
        isPublic,
        grade: 6,
        topic: 'The Wonderful World of Science',
        quizLength: 5,
    };
    
    const multi = client.multi();
    multi.set(`game:${gameId}`, JSON.stringify(gameState), { EX: 7200 }); // 2-hour expiry
    if (isPublic) {
        multi.zAdd('public_games', { score: Date.now(), value: gameId });
    }
    await multi.exec();
    
    return gameState;
};

const joinGame = async (gameId: string, username: string): Promise<MultiplayerGameState> => {
    const client = await getRedisClient();
    const gameJson = await client.get(`game:${gameId}`);
    if (!gameJson) throw new ApiError('Game not found.', 404);

    const gameState: MultiplayerGameState = JSON.parse(gameJson);
    if (gameState.status !== 'lobby') throw new ApiError('Game has already started.', 403);
    if (gameState.players.find(p => p.username === username)) { // Player is rejoining
        return gameState;
    }
    if (gameState.players.length >= 8) throw new ApiError('Game lobby is full.', 403);

    const newPlayer: MultiplayerPlayer = { username, score: 0, answeredThisRound: false };
    gameState.players.push(newPlayer);
    await client.set(`game:${gameId}`, JSON.stringify(gameState), { KEEPTTL: true });
    return gameState;
};

const getGameState = async (gameId: string): Promise<MultiplayerGameState | null> => {
    const client = await getRedisClient();
    const gameJson = await client.get(`game:${gameId}`);
    if (!gameJson) return null;
    
    const gameState: MultiplayerGameState = JSON.parse(gameJson);

    // Auto-transition from in_progress to round_over if time is up
    if (gameState.status === 'in_progress' && Date.now() > gameState.roundEndTime) {
        gameState.status = 'round_over';
        await client.set(`game:${gameId}`, JSON.stringify(gameState), { KEEPTTL: true });
    }

    return gameState;
};

const getPublicGames = async (): Promise<MultiplayerGameState[]> => {
    const client = await getRedisClient();
    // Get game IDs from the last hour, up to 50 games
    const oneHourAgo = Date.now() - 3600 * 1000;
    const gameIds = await client.zRange('public_games', oneHourAgo, Date.now(), { BY: 'SCORE', REV: true, COUNT: 50 });

    if (gameIds.length === 0) return [];

    const gameKeys = gameIds.map(id => `game:${id}`);
    const gameJsons = await client.mGet(gameKeys);

    const publicGames: MultiplayerGameState[] = [];
    const staleGameIds: string[] = [];

    gameJsons.forEach((json, index) => {
        if (json) {
            const game: MultiplayerGameState = JSON.parse(json);
            if (game.status === 'lobby' && game.isPublic && game.players.length < 8) {
                publicGames.push(game);
            }
        } else {
            // The game key expired but the public_games entry remains. Mark for cleanup.
            staleGameIds.push(gameIds[index]);
        }
    });
    
    // Cleanup stale entries from the sorted set
    if (staleGameIds.length > 0) {
        await client.zRem('public_games', staleGameIds);
    }

    return publicGames;
};

const startGame = async (gameId: string, grade: Grade, topic: string, quizLength: number): Promise<MultiplayerGameState> => {
    if (!process.env.API_KEY) throw new ApiError("AI service is not configured.", 500);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const client = await getRedisClient();
    const gameJson = await client.get(`game:${gameId}`);
    if (!gameJson) throw new ApiError('Game not found.', 404);

    const gameState: MultiplayerGameState = JSON.parse(gameJson);
    if (gameState.status !== 'lobby') throw new ApiError('Game has already started.', 403);
    
    // Generate questions
    const prompt = `Generate ${quizLength} unique, multiple-choice science quiz questions for Grade ${grade} on the topic "${topic}". Each question must have a 'question', 4 'options', a correct 'answer', and a brief 'explanation'.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['question', 'options', 'answer', 'explanation'] } },
        },
    });
    const questions = JSON.parse(response.text) as QuizQuestion[];

    gameState.questions = questions;
    gameState.grade = grade;
    gameState.quizLength = quizLength;
    gameState.status = 'in_progress';
    gameState.currentQuestionIndex = 0;
    gameState.roundEndTime = Date.now() + QUIZ_ROUND_DURATION_MS;

    const multi = client.multi();
    multi.set(`game:${gameId}`, JSON.stringify(gameState), { KEEPTTL: true });
    // Remove from public listing once started
    if(gameState.isPublic) {
        multi.zRem('public_games', gameId);
    }
    await multi.exec();

    return gameState;
};

const submitAnswer = async (gameId: string, username: string, questionIndex: number, answer: string, timeTaken: number): Promise<void> => {
    const client = await getRedisClient();
    const gameJson = await client.get(`game:${gameId}`);
    if (!gameJson) return;

    const gameState: MultiplayerGameState = JSON.parse(gameJson);
    if (gameState.status !== 'in_progress' || gameState.currentQuestionIndex !== questionIndex) return;

    const player = gameState.players.find(p => p.username === username);
    const question = gameState.questions[questionIndex];
    if (!player || !question || player.answeredThisRound) return;

    player.answeredThisRound = true;
    if (answer === question.answer) {
        const scoreForRound = 10;
        player.score += scoreForRound;
    }

    await client.set(`game:${gameId}`, JSON.stringify(gameState), { KEEPTTL: true });
};

const nextQuestion = async (gameId: string): Promise<MultiplayerGameState> => {
    const client = await getRedisClient();
    const gameJson = await client.get(`game:${gameId}`);
    if (!gameJson) throw new ApiError('Game not found.', 404);

    const gameState: MultiplayerGameState = JSON.parse(gameJson);
    if (gameState.status !== 'round_over') throw new ApiError('Not ready for next question.', 403);

    if (gameState.currentQuestionIndex >= gameState.questions.length - 1) {
        gameState.status = 'finished';
    } else {
        gameState.currentQuestionIndex++;
        gameState.status = 'in_progress';
        gameState.roundEndTime = Date.now() + QUIZ_ROUND_DURATION_MS;
        gameState.players.forEach(p => p.answeredThisRound = false);
    }
    
    await client.set(`game:${gameId}`, JSON.stringify(gameState), { KEEPTTL: true });
    return gameState;
};
