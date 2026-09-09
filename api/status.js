export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const groqConfigured = Boolean(process.env.GROQ_API_KEY);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const supabaseConfigured = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      groqConfigured,
      geminiConfigured,
      supabaseConfigured,
      defaultModel: 'llama-3.3-70b-versatile'
    }
  });
}
