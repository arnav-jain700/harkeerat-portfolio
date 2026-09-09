import { loadData } from './data.js';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Build dynamic system prompt containing the candidate's live portfolio facts
 */
export function buildLivePortfolioContext() {
  const db = loadData();
  const profile = db.profile || {};
  const skills = (db.skills || []).map(s => `${s.name} (${s.category}, ${s.level}%)`).join(', ');
  const projects = (db.projects || []).map(p => `- ${p.title} [Category: ${p.category}]: ${p.description}. Tech: ${p.tags.join(', ')} (Demo: ${p.demoUrl}, GitHub: ${p.githubUrl})`).join('\n');
  const journey = (db.journey || []).map(j => `- ${j.role} at ${j.company} (${j.date}) [${j.type}]: ${j.description}`).join('\n');
  const certs = (db.certificates || []).map(c => `- ${c.title} by ${c.issuer} (${c.year})`).join('\n');
  const platforms = (db.codingPlatforms || []).map(p => `- ${p.platform} (${p.handle}): Rating ${p.rating} [${p.badge}], ${p.totalSolved} Problems Solved (${p.easySolved} Easy, ${p.mediumSolved} Medium, ${p.hardSolved} Hard), ${p.contestsCount} Contests, ${p.ranking}`).join('\n');

  return `You are the AI Co-Pilot & Technical Representative for ${profile.name || 'the developer'}.
Candidate Headline: ${profile.role}
Location: ${profile.location}
Email: ${profile.email}
GitHub: ${profile.github}
LinkedIn: ${profile.linkedin}
Bio: ${profile.bio}

SKILLS & PROFICIENCIES:
${skills}

FEATURED PROJECTS:
${projects}

CAREER & ACADEMIC JOURNEY:
${journey}

CERTIFICATIONS:
${certs}

COMPETITIVE PROGRAMMING & CODING PLATFORMS:
${platforms}

INSTRUCTIONS:
1. Speak as a helpful, technically sharp AI assistant representing ${profile.name}. Do not claim to be the human himself; you are his AI Co-Pilot.
2. Answer visitor inquiries accurately based on the portfolio facts above.
3. Be concise, polite, professional, and highlight relevant engineering achievements, architectures, and metrics.
4. If asked about something not in the portfolio, state that you do not have that specific record, but offer related strengths or invite them to reach out via the contact form.`;
}

/**
 * Universal AI Caller (Direct Groq -> Serverless Proxy -> Offline Fallback)
 */
export async function callAI(messages, temperature = 0.7, maxTokens = 1024) {
  const db = loadData();
  const directApiKey = db.settings?.groqApiKey?.trim();

  // 1. Direct Groq API call if user entered key in settings
  if (directApiKey && directApiKey.startsWith('gsk_')) {
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${directApiKey}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return { reply: content, source: 'groq-direct' };
      }
    } catch (err) {
      console.warn('[AI] Direct Groq API failed, attempting serverless fallback:', err.message);
    }
  }

  // 2. Serverless Proxy Endpoint (/api/gemini)
  try {
    const proxyResp = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (proxyResp.ok) {
      const data = await proxyResp.json();
      if (data.reply) return { reply: data.reply, source: `proxy-${data.provider || 'cloud'}` };
    }
  } catch (err) {
    // serverless not available (e.g. running purely local Vite without Vercel backend)
  }

  // 3. Built-in Offline Fallback
  const userMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  const offlineReply = generateOfflineResponse(userMsg);
  return { reply: offlineReply, source: 'offline-engine' };
}

/**
 * Floating Chatbot Controller
 */
export async function chatWithPortfolioAI(userMessage, conversationHistory = []) {
  const systemPrompt = buildLivePortfolioContext();
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6),
    { role: 'user', content: userMessage }
  ];

  const result = await callAI(messages, 0.7, 800);
  return result;
}

/**
 * AI Email Reply Drafter
 */
export async function draftEmailReply(inquiry) {
  const db = loadData();
  const context = buildLivePortfolioContext();

  const prompt = `Draft a polite, professional email reply from ${db.profile.name} to the following inbound message.
Sender: ${inquiry.name} (${inquiry.email})
Subject: ${inquiry.subject}
Message Body:
"${inquiry.message}"

Keep the response concise (2-3 short paragraphs), warm, and suggest scheduling a brief technical sync or call.`;

  const messages = [
    { role: 'system', content: context },
    { role: 'user', content: prompt }
  ];

  try {
    const res = await callAI(messages, 0.7, 500);
    return res.reply;
  } catch (err) {
    return `Hi ${inquiry.name},\n\nThank you for reaching out regarding "${inquiry.subject}". I appreciate you connecting!\n\nI would be glad to discuss this further and explore synergies. Feel free to share a few time slots that suit you for a brief conversation.\n\nBest regards,\n${db.profile.name}\n${db.profile.role}`;
  }
}

/**
 * AI Project Description Suggestion
 */
export async function suggestProjectDescription(title, tags, category) {
  const prompt = `Write a concise 2-sentence architectural summary and impact statement for a software engineering portfolio project.
Project Title: ${title}
Category: ${category}
Technologies: ${tags}

Format: Return only the project description without commentary.`;

  try {
    const res = await callAI([{ role: 'user', content: prompt }], 0.6, 250);
    return res.reply.trim();
  } catch (err) {
    return `Architected a high-throughput, resilient ${category.toLowerCase()} platform leveraging ${tags}. Engineered with low-latency communication protocols, automated failover mechanisms, and sub-millisecond execution standards.`;
  }
}

/**
 * Built-in Intelligent Offline Fallback Generator
 */
function generateOfflineResponse(userMsg) {
  const db = loadData();
  const q = (userMsg || '').toLowerCase();
  const profile = db.profile || {};

  if (/skill|tech|stack|language|framework/i.test(q)) {
    const topSkills = (db.skills || []).slice(0, 8).map(s => s.name).join(', ');
    return `My technical toolkit centers on high-performance distributed systems, AI/LLM serving, and framework-less web engineering. Core proficiencies include: ${topSkills}, plus cloud infrastructure across Docker, Kubernetes, and AWS.`;
  }

  if (/project|portfolio|work|neuroflow|hyperscale|pulseos/i.test(q)) {
    const projList = (db.projects || []).slice(0, 3).map(p => `• **${p.title}** (${p.tags.slice(0, 3).join(', ')}): ${p.description}`).join('\n');
    return `Here are some of my featured engineering projects:\n\n${projList}\n\nYou can explore live demos and architectures directly in the Projects section!`;
  }

  if (/experience|career|job|background|journey|work history/i.test(q)) {
    const current = db.journey?.[0];
    return `I currently serve as ${current?.role || 'Senior AI Systems Architect'} at ${current?.company || 'NeuralMatrix Labs'}, where I lead distributed LLM inference clusters. Previously, I led full-stack infrastructure and telemetry systems for low-latency web platforms.`;
  }

  if (/contact|email|reach|hire|chat|meeting/i.test(q)) {
    return `You can reach me directly via email at **${profile.email || 'harkeerat.singh.dev@gmail.com'}** or by dispatching a note through the contact form below. I'm also active on [GitHub](${profile.github}) and [LinkedIn](${profile.linkedin}).`;
  }

  if (/resume|cv|pdf/i.test(q)) {
    return `You can view and print my ATS-compliant **[Resume](?print=resume)** or **[Curriculum Vitae](?print=cv)** directly through the browser! Use the action buttons in the hero section or top navigation.`;
  }

  if (/certificate|certification|cka|aws/i.test(q)) {
    const certList = (db.certificates || []).map(c => `• ${c.title} (${c.issuer})`).join('\n');
    return `My credentials include:\n${certList}\nYou can inspect proof verifications in the Certificates section.`;
  }

  if (/leetcode|codeforces|codechef|rating|dsa|problem solving|questions solved|competitive|codolio/i.test(q)) {
    const cpList = (db.codingPlatforms || []).map(p => `• **${p.platform}** (${p.badge}): Rating ${p.rating}, ${p.totalSolved} problems solved (${p.ranking})`).join('\n');
    return `Here are my competitive programming and problem-solving statistics across major coding platforms:\n\n${cpList}\n\nYou can inspect difficulty breakdowns and live profiles in the Coding Profiles section!`;
  }

  return `Hello! I am ${profile.name}'s AI Co-Pilot. I can answer questions about his distributed systems projects, LLM engineering expertise, technical toolkit, career milestones, or help you connect with him directly. What would you like to explore?`;
}
