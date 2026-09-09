export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, temperature = 0.7, max_tokens = 1024 } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages array required' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 1. Try Groq (llama-3.3-70b-versatile)
  if (groqApiKey) {
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature,
          max_tokens
        })
      });

      if (groqResponse.ok) {
        const data = await groqResponse.json();
        const reply = data.choices?.[0]?.message?.content || '';
        return res.status(200).json({ reply, provider: 'groq' });
      } else {
        const errText = await groqResponse.text();
        console.warn('Groq upstream returned non-200:', groqResponse.status, errText);
      }
    } catch (err) {
      console.error('Groq call failed, trying fallback:', err.message);
    }
  }

  // 2. Fallback to Gemini if configured
  if (geminiApiKey) {
    try {
      // Map OpenAI messages format to Gemini contents format
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const systemInstruction = messages.find(m => m.role === 'system');

      const geminiBody = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: max_tokens
        }
      };

      if (systemInstruction) {
        geminiBody.systemInstruction = {
          parts: [{ text: systemInstruction.content }]
        };
      }

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody)
        }
      );

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ reply, provider: 'gemini' });
      }
    } catch (err) {
      console.error('Gemini call failed:', err.message);
    }
  }

  return res.status(503).json({
    error: 'No operational serverless AI keys found. Client offline fallback will be engaged.',
    provider: 'offline'
  });
}
