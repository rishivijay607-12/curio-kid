
import type { CommunityMessage } from '../types.ts';

// Custom error class
export class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function callChatApi<T>(action: string, params: object = {}): Promise<T> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
    });

    if (!response.ok) {
        throw new ApiError(`Server Error: ${response.status}`, response.status);
    }
    
    return await response.json() as T;
}

export const getMessages = (): Promise<CommunityMessage[]> => {
    return callChatApi<CommunityMessage[]>('getMessages');
};

export const sendMessage = (username: string, text: string): Promise<{ success: boolean, message: CommunityMessage }> => {
    return callChatApi('sendMessage', { username, text });
};
