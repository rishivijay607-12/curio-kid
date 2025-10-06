
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * This serverless function securely provides the Gemini API key to the client-side
 * application only when it's needed for services that cannot be proxied,
 * like the 'live' WebSocket connection for the Voice Tutor.
 * The key is read from server-side environment variables and is never exposed in the source code.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    // Log a detailed error on the server for debugging
    console.error('[GET_KEY_ERROR] The API_KEY (or NEXT_PUBLIC_API_KEY) environment variable is not set on the server.');
    
    // Provide a user-friendly message to the client
    const userMessage = "The voice tutor is not configured correctly on the server. Please contact support.";
    return res.status(500).json({ error: userMessage });
  }

  // Return the key in a JSON object
  return res.status(200).json({ apiKey });
}
