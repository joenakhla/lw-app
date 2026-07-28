-- Run this in Supabase SQL Editor

-- Clients table
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text not null,
  answers jsonb default '{}',
  status text default 'onboarded' check (status in ('onboarded', 'active', 'paused', 'churned')),
  created_at timestamptz default now()
);

-- Reports table (populated by Analytics Reporter agent weekly)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  week_label text not null,                  -- e.g. "Jul 21, 2025"
  content_items jsonb default '[]',          -- array of {title, type, status, url?}
  seo_rankings jsonb default '[]',           -- array of {keyword, position, change}
  performance jsonb default '{}',            -- {leads_generated, emails_sent, open_rate, reply_rate, meetings_booked}
  next_steps jsonb default '[]',             -- array of strings
  created_at timestamptz default now()
);

-- Tool requests log
create table if not exists tool_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'done', 'rejected')),
  created_at timestamptz default now()
);

-- Agent logs (for auditing AI actions)
create table if not exists agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent_name text,
  event text,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS Policies
alter table clients enable row level security;
alter table reports enable row level security;
alter table tool_requests enable row level security;
alter table agent_logs enable row level security;

-- Clients: service role only (no public access)
create policy "Service role full access on clients"
  on clients for all using (auth.role() = 'service_role');

-- Reports: service role full access; clients can read their own via slug match
create policy "Service role full access on reports"
  on reports for all using (auth.role() = 'service_role');

-- Tool requests: service role only
create policy "Service role full access on tool_requests"
  on tool_requests for all using (auth.role() = 'service_role');

-- Agent logs: service role only
create policy "Service role full access on agent_logs"
  on agent_logs for all using (auth.role() = 'service_role');

-- Indexes
create index if not exists clients_slug_idx on clients(slug);
create index if not exists reports_client_id_idx on reports(client_id);
create index if not exists reports_created_at_idx on reports(created_at desc);
