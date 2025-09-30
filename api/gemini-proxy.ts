// This serverless function is not used in the client-side architecture.
// It can be safely removed if you are not using a server-based hosting provider like Vercel.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(404).json({ message: "This endpoint is not in use for the current application architecture." });
}
