import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ClientDashboard from './ClientDashboard';

export const dynamic = 'force-dynamic';

async function getClient(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

async function getReports(clientId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from('reports')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function ClientPortalPage({ params }: { params: { slug: string } }) {
  const client = await getClient(params.slug);
  if (!client) notFound();

  const reports = await getReports(client.id);

  return <ClientDashboard client={client} reports={reports} />;
}
