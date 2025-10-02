import type { Handler, HandlerEvent } from "@netlify/functions";

/**
 * This serverless function securely provides the Gemini API key to the client-side
 * application only when it's needed for services that cannot be proxied,
 * like the 'live' WebSocket connection for the Voice Tutor.
 * The key is read from server-side environment variables and is never exposed in the source code.
 */
const handler: Handler = async (event: HandlerEvent) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error('API_KEY environment variable is not set on the server.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured on the server.' }),
    };
  }

  // Return the key in a JSON object
  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey }),
    headers: { 'Content-Type': 'application/json' }
  };
};

export { handler };
