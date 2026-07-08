import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Without a database, we can't reliably track IPs on Vercel serverless.
// Just return false so the form always shows.
export async function GET() {
  return NextResponse.json({ blocked: false });
}
