import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.nexos.ai/v1/credits', {
      headers: {
        Authorization: `Bearer ${process.env.NEXOS_API_KEY ?? ''}`,
      },
    });

    if (!res.ok) throw new Error('Nexos API error');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Return mock structure if Nexos key not configured
    return NextResponse.json(
      { error: 'NEXOS_API_KEY not configured or API unavailable' },
      { status: 502 }
    );
  }
}
