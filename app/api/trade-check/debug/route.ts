import { NextResponse } from 'next/server';

// Temporary debug endpoint — remove after confirming env vars work
export async function GET() {
  const groqRaw = [
    process.env.GROQ_API_KEY_0, process.env.GROQ_API_KEY_1, process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3, process.env.GROQ_API_KEY_4, process.env.GROQ_API_KEY_5,
    process.env.GROQ_API_KEY_6, process.env.GROQ_API_KEY_7, process.env.GROQ_API_KEY_8,
    process.env.GROQ_API_KEY_9
  ];
  const geminiRaw = [
    process.env.GEMINI_API_KEY_0, process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3, process.env.GEMINI_API_KEY_4, process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6, process.env.GEMINI_API_KEY_7, process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9
  ];

  const groqKeys: string[] = [];
  const geminiKeys: string[] = [];
  
  groqRaw.forEach((gk, i) => {
    if (gk) groqKeys.push(`GROQ_${i}: ${gk.substring(0, 8)}...${gk.substring(gk.length - 4)}`);
  });
  
  geminiRaw.forEach((gm, i) => {
    if (gm) geminiKeys.push(`GEMINI_${i}: ${gm.substring(0, 8)}...${gm.substring(gm.length - 4)}`);
  });

  return NextResponse.json({
    primaryProvider: process.env.LLM_PRIMARY_PROVIDER || '(not set, defaults to groq)',
    groqKeysFound: groqKeys.length,
    geminiKeysFound: geminiKeys.length,
    groqKeyPreviews: groqKeys,
    geminiKeyPreviews: geminiKeys,
    vercelEnv: process.env.VERCEL_ENV || '(not on Vercel)',
    nodeEnv: process.env.NODE_ENV,
  });
}
