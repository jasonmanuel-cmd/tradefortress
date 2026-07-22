create table if not exists public.client_modules (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  module text not null check (module in ('core', 'lead_engine', 'construction_collections', 'grants')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, module)
);

create table if not exists public.orchestrator_checks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  system text not null check (system in ('command_center', 'telephony', 'lead_engine', 'construction_collections', 'grants')),
  status text not null check (status in ('healthy', 'degraded', 'action_required')),
  response_ms integer,
  detail text,
  checked_at timestamptz not null default now()
);

create index if not exists idx_client_modules_client on public.client_modules(client_id);
create index if not exists idx_orchestrator_checks_client_time on public.orchestrator_checks(client_id, checked_at desc);
alter table public.client_modules enable row level security;
alter table public.orchestrator_checks enable row level security;
create policy "clients read own modules" on public.client_modules for select using (auth.uid() = client_id);
create policy "clients read own checks" on public.orchestrator_checks for select using (auth.uid() = client_id);
