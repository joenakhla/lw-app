import { createClient } from '@supabase/supabase-js';

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
}
function getAnon() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';
}
function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key';
}

// Lazy singleton — not created until first call
let _supabase: ReturnType<typeof createClient> | null = null;
export function supabase() {
  if (!_supabase) _supabase = createClient(getUrl(), getAnon());
  return _supabase;
}

export function supabaseAdmin() {
  return createClient(getUrl(), getServiceKey());
}
