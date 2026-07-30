import { createClient } from '@supabase/supabase-js';

// Server-only (runtime) — not inlined at build time
function getUrl() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('SUPABASE_URL env var is not set');
  return url;
}

export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is not set');
  return createClient(getUrl(), key);
}
