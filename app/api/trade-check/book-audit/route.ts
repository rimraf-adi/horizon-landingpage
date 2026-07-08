import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, contactMethod, note } = body;

    if (!email || !contactMethod) {
      return NextResponse.json(
        { error: 'Please provide your email and preferred contact method.' },
        { status: 400 }
      );
    }

    // Log the booking (visible in Vercel function logs)
    console.log('[AUDIT BOOKING]', JSON.stringify({
      email: email.toLowerCase().trim(),
      contactMethod,
      note: note || '',
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: 'Your Pro Audit request has been received. We\'ll be in touch within 24 hours.',
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to submit your request. Please try again.' },
      { status: 500 }
    );
  }
}
