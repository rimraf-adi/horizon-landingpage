/**
 * POST /api/trade-check/analyze
 * 
 * Self-contained analysis endpoint. No filesystem. No external LLM module.
 * Uses Edge Runtime for 30s timeout on Vercel Hobby plan.
 * Groq API call is inlined directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseTradeCSV, computeStats, buildLLMPayload } from '@/lib/trade-analyzer';

export const runtime = 'edge';

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

// Get all Groq keys from env (Edge runtime requires static access)
function getGroqKeys(): string[] {
  const keys = [
    process.env.GROQ_API_KEY_0,
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
    process.env.GROQ_API_KEY_6,
    process.env.GROQ_API_KEY_7,
    process.env.GROQ_API_KEY_8,
    process.env.GROQ_API_KEY_9,
  ];
  return keys.filter(Boolean) as string[];
}

// Direct Groq API call
async function callGroqDirect(payload: object, apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned empty response');
  return content;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const firmName = formData.get('firmName') as string;
    const phase = formData.get('phase') as string;
    const accountSize = parseFloat(formData.get('accountSize') as string);
    const maxDailyLoss = parseFloat(formData.get('maxDailyLoss') as string);
    const maxDrawdown = parseFloat(formData.get('maxDrawdown') as string);
    const profitTarget = parseFloat(formData.get('profitTarget') as string) || 0;
    const csvFile = formData.get('csvFile') as File | null;
    const questionnaireRaw = formData.get('questionnaire') as string;

    if (!firmName || !phase || !accountSize || !maxDailyLoss || !maxDrawdown) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all account details.' },
        { status: 400 }
      );
    }

    if (!csvFile) {
      return NextResponse.json(
        { error: 'Please upload your trade history CSV file.' },
        { status: 400 }
      );
    }

    // Parse CSV
    let csvContent: string;
    try {
      csvContent = await csvFile.text();
    } catch {
      return NextResponse.json({ error: 'Could not read the uploaded file.' }, { status: 400 });
    }

    if (!csvContent.includes(',') && !csvContent.includes('\t') && !csvContent.includes(';')) {
      return NextResponse.json({ error: 'Not a valid CSV file.' }, { status: 400 });
    }

    let trades;
    try {
      trades = parseTradeCSV(csvContent);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Failed to parse CSV.' }, { status: 400 });
    }

    const stats = computeStats(trades, {
      maxDailyLossPercent: maxDailyLoss,
      maxDrawdownPercent: maxDrawdown,
      accountSize,
    });

    let questionnaire: Record<string, string> = {};
    try { questionnaire = JSON.parse(questionnaireRaw || '{}'); } catch { questionnaire = {}; }

    const llmPayload = buildLLMPayload(stats, {
      firmName, phase, accountSize,
      maxDailyLossPercent: maxDailyLoss,
      maxDrawdownPercent: maxDrawdown,
      profitTargetPercent: profitTarget,
    }, questionnaire);

    // Call Groq — try all keys round-robin
    const groqKeys = getGroqKeys();

    if (groqKeys.length === 0) {
      return NextResponse.json(
        { error: 'Server configuration error: No API keys found. Contact support.' },
        { status: 500 }
      );
    }

    const errors: string[] = [];
    let analysis = '';
    let usedProvider = '';
    let usedKeyIndex = -1;

    for (let i = 0; i < groqKeys.length; i++) {
      try {
        analysis = await callGroqDirect(llmPayload, groqKeys[i]);
        usedProvider = 'groq';
        usedKeyIndex = i;
        break;
      } catch (e: any) {
        errors.push(`Key ${i}: ${e.message}`);
        continue;
      }
    }

    if (!analysis) {
      // All Groq keys failed — return the actual errors for debugging
      return NextResponse.json(
        { error: `Analysis failed. Errors: ${errors.join(' | ')}` },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      stats,
      provider: usedProvider,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}
