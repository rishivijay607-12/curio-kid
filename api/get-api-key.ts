import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // This endpoint is only for fetching the key for client-side services like the Voice Tutor.
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            console.error('API_KEY environment variable is not set on the server.');
            return res.status(500).json({ message: 'API key is not configured on the server. The administrator needs to set it up.' });
        }

        // Return the key to the client for it to initialize the live connection.
        return res.status(200).json({ apiKey });
        
    } catch (error) {
        console.error('Error in get-api-key endpoint:', error);
        return res.status(500).json({ message: 'An internal server error occurred while retrieving the API key.' });
    }
}