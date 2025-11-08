import type { MultiplayerGameState, Grade } from '../types.ts';

// Custom error for client-side logic
export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function callMultiplayerApi<T>(action: string, params: object = {}): Promise<T> {
    const response = await fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
    });

    if (!response.ok) {
        let errorMessage = `Server Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                errorMessage = errorData.error;
            }
        } catch (e) {
            // Ignore if error response is not JSON
        }
        throw new ApiError(errorMessage, response.status);
    }
    
    const data = await response.json();
    return data as T;
}

export const createGame = (username: string, isPublic: boolean): Promise<MultiplayerGameState> => {
    return callMultiplayerApi('createGame', { username, isPublic });
};

export const joinGame = (gameId: string, username: string): Promise<MultiplayerGameState> => {
    return callMultiplayerApi('joinGame', { gameId, username });
};

export const getGameState = (gameId: string): Promise<MultiplayerGameState> => {
    return callMultiplayerApi('getGameState', { gameId });
};

export const getPublicGames = (): Promise<MultiplayerGameState[]> => {
    return callMultiplayerApi('getPublicGames');
};

export const startGame = (gameId: string, grade: Grade, topic: string, quizLength: number): Promise<MultiplayerGameState> => {
    return callMultiplayerApi('startGame', { gameId, grade, topic, quizLength });
};

export const submitAnswer = (gameId: string, username: string, questionIndex: number, answer: string, timeTaken: number): Promise<void> => {
    return callMultiplayerApi('submitAnswer', { gameId, username, questionIndex, answer, timeTaken });
};

export const nextQuestion = (gameId: string): Promise<MultiplayerGameState> => {
    return callMultiplayerApi('nextQuestion', { gameId });
};