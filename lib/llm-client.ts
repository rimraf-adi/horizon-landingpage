/**
 * LLM Client — Groq + Gemini with round-robin key rotation and provider fallback.
 * Keys are stored server-side only as environment variables.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_MODEL = 'gemini-2.0-flash';

// Round-robin indices (persisted in-memory per server instance)
let groqKeyIndex = 0;
let geminiKeyIndex = 0;

// Load all keys from env
function getGroqKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < 10; i++) {
    const key = process.env[`GROQ_API_KEY_${i}`];
    if (key) keys.push(key);
  }
  return keys;
}

function getGeminiKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key) keys.push(key);
  }
  return keys;
}

const SYSTEM_PROMPT = `You are a high-level trading risk analyst and prop firm evaluator reviewing a trader's performance statistics and self-reported behavior. You are NOT given raw trade-by-trade data — only pre-computed summary statistics. Base every claim strictly on the structured data provided below. Never invent specific trades, dates, prices, or any figure not present in the input. If a stat is missing, say so rather than estimating it.

Your goal is to provide a deeply insightful, detailed, and harsh but fair breakdown of why this trader might be struggling, why they might fail a prop firm challenge based on their current stats, and exactly what they need to change to secure a payout.

Cross-reference the trader's self-reported behavior answers against the computed statistics, and explicitly call out any contradictions (e.g., they report never sizing up after wins, but lot size data shows otherwise). Check the computed statistics against the account rules provided (max daily loss %, max drawdown %) and heavily critique how close the trader has come to violating them.

Write your response in exactly these sections, in this order:
1. Overall Verdict (2-3 sentences summarizing their current standing)
2. The Brutal Truth: Where You Are Going Wrong (2 detailed paragraphs breaking down their biggest mathematical and behavioral flaws based on the stats)
3. Prop Firm Failure Risks (1-2 paragraphs explicitly stating why these habits will lead to failing a challenge or losing a funded account, referencing their drawdowns and risk metrics)
4. Behavioral Contradictions (1 short paragraph identifying discrepancies between their self-reported behavior and the hard data)
5. The Roadmap to a Payout (3-4 bullet points offering a highly specific, actionable, step-by-step plan for what they need to fix in their next trading week to become consistently profitable)

Do not restate the raw stats as a bullet list — that will be shown separately in a table. Your job is synthesis, judgment, and deep guidance. Avoid generic filler; every sentence must tie back to their specific numbers, drawdowns, and behaviors.`;

interface LLMResponse {
  content: string;
  provider: string;
  keyIndex: number;
}

async function callGroq(payload: object, keyIndex: number, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000); // 50s timeout

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Here is the trader's data for analysis:\n\n${JSON.stringify(payload, null, 2)}` },
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } finally {
    clearTimeout(timeout);
  }
}

async function callGemini(payload: object, keyIndex: number, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000); // 50s timeout

  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${SYSTEM_PROMPT}\n\nHere is the trader's data for analysis:\n\n${JSON.stringify(payload, null, 2)}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 3000,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } finally {
    clearTimeout(timeout);
  }
}

export async function callLLM(payload: object): Promise<LLMResponse> {
  const primaryProvider = process.env.LLM_PRIMARY_PROVIDER || 'groq';
  const groqKeys = getGroqKeys();
  const geminiKeys = getGeminiKeys();

  console.log(`[LLM] Found ${groqKeys.length} Groq keys, ${geminiKeys.length} Gemini keys. Primary: ${primaryProvider}`);

  // Determine order: primary first, then fallback
  const providers = primaryProvider === 'groq'
    ? [
        { name: 'groq', keys: groqKeys, callFn: callGroq, getIndex: () => groqKeyIndex, setIndex: (i: number) => { groqKeyIndex = i; } },
        { name: 'gemini', keys: geminiKeys, callFn: callGemini, getIndex: () => geminiKeyIndex, setIndex: (i: number) => { geminiKeyIndex = i; } },
      ]
    : [
        { name: 'gemini', keys: geminiKeys, callFn: callGemini, getIndex: () => geminiKeyIndex, setIndex: (i: number) => { geminiKeyIndex = i; } },
        { name: 'groq', keys: groqKeys, callFn: callGroq, getIndex: () => groqKeyIndex, setIndex: (i: number) => { groqKeyIndex = i; } },
      ];

  const errors: string[] = [];

  if (groqKeys.length === 0 && geminiKeys.length === 0) {
    throw new Error('No API keys found. Check that GROQ_API_KEY_0 and/or GEMINI_API_KEY_0 are set in your Vercel environment variables.');
  }

  for (const provider of providers) {
    if (provider.keys.length === 0) {
      console.log(`[LLM] Skipping ${provider.name} — no keys configured`);
      continue;
    }

    const startIndex = provider.getIndex();

    // Try all keys for this provider (round-robin from current index)
    for (let attempt = 0; attempt < provider.keys.length; attempt++) {
      const keyIndex = (startIndex + attempt) % provider.keys.length;
      const apiKey = provider.keys[keyIndex];

      try {
        console.log(`[LLM] Calling ${provider.name} with key index ${keyIndex}`);
        const content = await provider.callFn(payload, keyIndex, apiKey);

        if (content) {
          // Advance the round-robin index for next request
          provider.setIndex((keyIndex + 1) % provider.keys.length);
          console.log(`[LLM] Success with ${provider.name} key index ${keyIndex}`);
          return { content, provider: provider.name, keyIndex };
        }
      } catch (error: any) {
        const msg = error?.message || 'Unknown error';
        console.error(`[LLM] ${provider.name} key ${keyIndex} failed: ${msg}`);
        errors.push(`${provider.name}[${keyIndex}]: ${msg}`);
        continue;
      }
    }

    console.log(`[LLM] All ${provider.name} keys exhausted, falling back...`);
  }

  throw new Error(`All LLM providers/keys failed. Errors:\n${errors.join('\n')}`);
}
