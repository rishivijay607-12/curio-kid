import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * This serverless function securely provides the Gemini API key to the client-side
 * application only when it's needed for services that cannot be proxied,
 * like the 'live' WebSocket connection for the Voice Tutor.
 * The key is read from server-side environment variables and is never exposed in the source code.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error('API_KEY environment variable is not set on the server.');
    return res.status(500).json({ error: 'API key not configured on the server.' });
  }

  // Return the key in a JSON object
  return res.status(200).json({ apiKey });
}
