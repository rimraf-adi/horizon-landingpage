/**
 * LLM Client — Groq + Gemini with round-robin key rotation and provider fallback.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_MODEL = 'gemini-2.0-flash';

let groqKeyIndex = 0;
let geminiKeyIndex = 0;

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

import { systemPrompt as SYSTEM_PROMPT } from './prompt';

interface LLMResponse {
  content: string;
  provider: string;
  keyIndex: number;
}

async function callGroq(payload: object, keyIndex: number, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

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
  const timeout = setTimeout(() => controller.abort(), 30000);

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

  for (const provider of providers) {
    const startIndex = provider.getIndex();

    for (let attempt = 0; attempt < provider.keys.length; attempt++) {
      const keyIndex = (startIndex + attempt) % provider.keys.length;
      const apiKey = provider.keys[keyIndex];

      try {
        console.log(`[LLM] Calling ${provider.name} with key index ${keyIndex}`);
        const content = await provider.callFn(payload, keyIndex, apiKey);

        if (content) {
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
