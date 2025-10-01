export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on the server. Please set the API_KEY environment variable.' });
  }

  return res.status(200).json({ apiKey });
}