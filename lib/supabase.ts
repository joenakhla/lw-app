import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(url, anon);

export function supabaseAdmin() {
  return createClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key'
  );
}
