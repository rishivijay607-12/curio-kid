// This function is deprecated and should not be used.
// The active function for Vercel is at /api/gemini-proxy.ts.
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "This Netlify function is deprecated and not in use." }),
  };
}
