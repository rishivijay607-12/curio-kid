import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * This serverless function securely streams a generated video file to the client.
 * It takes a 'uri' from Google's video generation service, appends the secret API key,
 * fetches the video content on the server, and then pipes the stream back to the client.
 * This prevents the API_KEY from ever being exposed on the client-side.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { uri } = req.query;

    if (!uri || typeof uri !== 'string') {
        return res.status(400).send('Bad Request: Missing "uri" query parameter.');
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error('[GET_VIDEO_ERROR] API_KEY environment variable is not set.');
        return res.status(500).send('Server configuration error.');
    }

    try {
        const videoUrl = `${uri}&key=${apiKey}`;
        const videoResponse = await fetch(videoUrl);

        if (!videoResponse.ok || !videoResponse.body) {
            const errorText = await videoResponse.text();
            console.error(`[GET_VIDEO_ERROR] Upstream fetch failed with status ${videoResponse.status}: ${errorText}`);
            return res.status(videoResponse.status).send(`Failed to fetch video from source: ${videoResponse.statusText}`);
        }
        
        // Set headers for streaming video and caching
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // Cache for 1 day

        // Pipe the video stream from the source directly to the client response
        videoResponse.body.pipe(res);

    } catch (error) {
        console.error('[GET_VIDEO_ERROR] Unhandled error while fetching video:', error);
        res.status(500).send('Internal Server Error: Failed to fetch video.');
    }
}