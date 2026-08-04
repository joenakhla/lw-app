import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DELIVERY_BASE = 'https://webhook.srv1857647.hstgr.cloud';
const DELIVERY_TOKEN = 'yuesHqzPLB3U9AwBXFafNy8HknHstv0r';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  try {
    const res = await fetch(`${DELIVERY_BASE}/list/${slug}?token=${DELIVERY_TOKEN}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();

    // Normalise to a flat string array regardless of response shape
    const raw: unknown[] = Array.isArray(data) ? data
      : Array.isArray(data?.files) ? data.files
      : [];

    const files: string[] = raw
      .map((f: unknown) => typeof f === 'string' ? f : (f as Record<string, string>).name || (f as Record<string, string>).filename || '')
      .filter(Boolean);

    return NextResponse.json({ files });
  } catch (err) {
    console.error('Deliverables fetch error:', err);
    return NextResponse.json({ files: [], error: String(err) });
  }
}
