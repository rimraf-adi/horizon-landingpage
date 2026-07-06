import { NextRequest, NextResponse } from 'next/server';
import { sendAnalysisEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, analysis, stats } = body;

    if (!email || !analysis || !stats) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    await sendAnalysisEmail(email, analysis, stats);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Trade Check Email] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}
