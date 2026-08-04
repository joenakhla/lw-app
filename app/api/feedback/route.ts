import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_slug, deliverable_name, deliverable_type, comment, author, status, parent_id } = body;

    if (!client_slug || !deliverable_name || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getSupabase();

    const { data, error } = await db
      .from('feedback')
      .insert({
        client_slug,
        deliverable_name,
        deliverable_type: deliverable_type || 'general',
        comment,
        author: author || 'client',
        status: status || 'open',
        parent_id: parent_id || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Fetch client email for webhook
    let clientEmail = '';
    try {
      const { data: client } = await db
        .from('clients')
        .select('email, company_name, business_name')
        .eq('slug', client_slug)
        .single();
      clientEmail = client?.email || '';
    } catch { /* non-blocking */ }

    // Notify webhook bridge
    let webhookStatus: number | null = null;
    let webhookBody: string | null = null;
    const webhookPayload = {
      type: 'client_feedback',
      client_slug,
      client_email: clientEmail,
      deliverable_name,
      subject: `Feedback: ${deliverable_name}`,
      body: comment,
      requires_revision: status === 'revision-requested',
    };
    try {
      console.log('[feedback] Posting to webhook bridge:', JSON.stringify(webhookPayload));
      const webhookRes = await fetch('https://webhook.srv1857647.hstgr.cloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer yuesHqzPLB3U9AwBXFafNy8HknHstv0r',
        },
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(8000),
      });
      webhookStatus = webhookRes.status;
      webhookBody = await webhookRes.text();
      if (!webhookRes.ok) {
        console.error(`[feedback] Webhook bridge returned ${webhookStatus}:`, webhookBody);
      } else {
        console.log(`[feedback] Webhook bridge OK ${webhookStatus}:`, webhookBody);
      }
    } catch (webhookErr) {
      console.error('[feedback] Webhook bridge fetch failed:', webhookErr instanceof Error ? webhookErr.message : String(webhookErr));
      webhookBody = String(webhookErr);
    }

    return NextResponse.json({ success: true, feedback: data, webhook: { status: webhookStatus, body: webhookBody } });
  } catch (err: unknown) {
    console.error('Feedback POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('client_slug');
    const deliverable = req.nextUrl.searchParams.get('deliverable_name');
    const all = req.nextUrl.searchParams.get('all');

    const db = getSupabase();
    let query = db.from('feedback').select('*').order('created_at', { ascending: true });

    if (all !== 'true') {
      if (slug) query = query.eq('client_slug', slug);
      if (deliverable) query = query.eq('deliverable_name', deliverable);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    console.error('Feedback GET error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
