import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'API key not configured on the server. Please set the API_KEY environment variable.' });
    }

    const { endpoint, params } = req.body;

    if (!endpoint || !params) {
        return res.status(400).json({ error: 'Missing endpoint or params in request body' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        switch (endpoint) {
            case 'generateContent': {
                const response = await ai.models.generateContent(params);
                return res.status(200).json(response);
            }
            case 'generateImages': {
                const response = await ai.models.generateImages(params);
                return res.status(200).json(response);
            }
            case 'generateVideos': {
                const response = await ai.models.generateVideos(params);
                return res.status(200).json(response);
            }
             case 'getVideosOperation': {
                const response = await ai.operations.getVideosOperation(params);
                return res.status(200).json(response);
            }
            default:
                return res.status(400).json({ error: `Invalid endpoint: ${endpoint}` });
        }
    } catch (error) {
        console.error(`Error calling Gemini API endpoint "${endpoint}":`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return res.status(500).json({ error: `An error occurred while processing your request: ${errorMessage}` });
    }
}