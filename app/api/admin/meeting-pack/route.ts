import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { client_slug, notes } = await req.json();

  // Fetch client data
  const { data: client, error } = await supabaseAdmin()
    .from('clients')
    .select('*')
    .eq('slug', client_slug)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const payload = {
    event: 'generate_meeting_pack',
    client_id: client.id,
    slug: client_slug,
    business_name: client.business_name,
    answers: client.answers,
    notes,
    requested_at: new Date().toISOString(),
  };

  const res = await fetch('https://openclaw-q0m0.srv1857647.hstgr.cloud/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
