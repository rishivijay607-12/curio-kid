import type { Grade, Difficulty, MultiplayerRoom } from '../types';

class MultiplayerApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MultiplayerApiError';
    }
}

async function callMultiplayerApi<T>(action: string, params: object): Promise<T> {
    const response = await fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new MultiplayerApiError(data.error || `Server Error: ${response.status}`);
    }
    return data as T;
}

export const createRoom = (config: {
    grade: Grade;
    topic: string;
    difficulty: Difficulty;
    quizLength: number;
}, host: string): Promise<MultiplayerRoom> => {
    return callMultiplayerApi('createRoom', { config, host });
};

export const joinRoom = (roomId: string, username: string): Promise<MultiplayerRoom> => {
    return callMultiplayerApi('joinRoom', { roomId, username });
};

export const getRoomState = (roomId: string): Promise<MultiplayerRoom> => {
    return callMultiplayerApi('getRoomState', { roomId });
};

export const startGame = (roomId: string, username: string): Promise<MultiplayerRoom> => {
    return callMultiplayerApi('startGame', { roomId, username });
};

export const submitAnswer = (
    roomId: string,
    username: string,
    questionIndex: number,
    isCorrect: boolean,
    timeTaken: number // in seconds
): Promise<void> => {
    return callMultiplayerApi('submitAnswer', { roomId, username, questionIndex, isCorrect, timeTaken });
};

export const nextQuestion = (roomId: string, username: string): Promise<MultiplayerRoom> => {
    return callMultiplayerApi('nextQuestion', { roomId, username });
};
