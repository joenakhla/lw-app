import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
  const keySet = !!(process.env.SUPABASE_SERVICE_ROLE_KEY);

  let queryResult = null;
  try {
    const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await db.from('clients').select('slug, business_name, company_name, status').order('created_at', { ascending: false }).limit(10);
    queryResult = { data, error: error?.message };
  } catch (e) {
    queryResult = { error: String(e) };
  }

  return NextResponse.json({ supabase_url: url, service_role_key_set: keySet, clients: queryResult });
}
