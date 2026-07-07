import { NextRequest, NextResponse } from 'next/server';
import { parseTradeCSV, computeStats, buildLLMPayload } from '@/lib/trade-analyzer';
import { callLLM } from '@/lib/llm-client';
import { storeSubmission, checkRateLimit, markIPUsed } from '@/lib/rate-limiter';
import { sendAnalysisEmail } from '@/lib/email';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // --- One-time use enforcement ---
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    const rateStatus = checkRateLimit('', clientIP);
    if (rateStatus === 'ip_used') {
      return NextResponse.json(
        { error: 'You have already used your free analysis. Contact us for additional audits.' },
        { status: 429 }
      );
    }

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

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address.' },
          { status: 400 }
        );
      }
    }

    if (!csvFile) {
      return NextResponse.json(
        { error: 'Please upload your trade history CSV file.' },
        { status: 400 }
      );
    }

    let csvContent: string;
    try {
      csvContent = await csvFile.text();
    } catch {
      return NextResponse.json(
        { error: 'Could not read the uploaded file. Please ensure it\'s a valid CSV file.' },
        { status: 400 }
      );
    }

    if (!csvContent.includes(',') && !csvContent.includes('\t') && !csvContent.includes(';')) {
      return NextResponse.json(
        { error: 'The uploaded file does not appear to be a valid CSV. Please export your trade history from MT4, MT5, or cTrader and try again.' },
        { status: 400 }
      );
    }

    let trades;
    try {
      trades = parseTradeCSV(csvContent);
    } catch (parseError: any) {
      return NextResponse.json(
        { error: parseError.message || 'Failed to parse the CSV file. Please check the format and try again.' },
        { status: 400 }
      );
    }

    const accountRules = {
      maxDailyLossPercent: maxDailyLoss,
      maxDrawdownPercent: maxDrawdown,
      accountSize: accountSize,
    };

    const stats = computeStats(trades, accountRules);

    let questionnaire: Record<string, string> = {};
    try {
      questionnaire = JSON.parse(questionnaireRaw || '{}');
    } catch {
      questionnaire = {};
    }

    const accountContext = {
      firmName,
      phase,
      accountSize,
      maxDailyLossPercent: maxDailyLoss,
      maxDrawdownPercent: maxDrawdown,
      profitTargetPercent: profitTarget,
    };

    const llmPayload = buildLLMPayload(stats, accountContext, questionnaire);

    let llmResult;
    try {
      llmResult = await callLLM(llmPayload);
    } catch (llmError: any) {
      console.error('[Trade Check] LLM call failed:', llmError.message);
      return NextResponse.json(
        { error: 'Our analysis service is temporarily unavailable. Please try again in a few minutes.' },
        { status: 503 }
      );
    }

    // Parse structured JSON from LLM response
    let parsedAnalysis: any;
    try {
      // Strip markdown code fences if the LLM wraps output
      let cleanContent = llmResult.content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      parsedAnalysis = JSON.parse(cleanContent);
    } catch {
      // Fallback: wrap raw text in a single info section
      console.warn('[Trade Check] LLM did not return valid JSON, falling back to raw text.');
      parsedAnalysis = {
        overallScore: null,
        overallVerdict: '',
        sections: [{
          id: 'raw_analysis',
          title: 'AI Risk Analysis',
          severity: 'info',
          score: null,
          summary: 'Full analysis report',
          detail: llmResult.content,
        }],
      };
    }

    // Mark this IP as used after successful analysis
    markIPUsed(clientIP);

    const timestamp = new Date().toISOString();
    storeSubmission({
      email,
      ip: clientIP,
      timestamp,
      accountContext,
      questionnaire,
      stats,
      llmResponse: llmResult.content,
      provider: llmResult.provider,
      keyIndex: llmResult.keyIndex,
    });

    if (email) {
      sendAnalysisEmail(email, llmResult.content, stats).catch(err => {
        console.error('[Trade Check] Failed to send email:', err);
      });
    }

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis,
      stats: stats,
      provider: llmResult.provider,
    });

  } catch (error: any) {
    console.error('[Trade Check] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
