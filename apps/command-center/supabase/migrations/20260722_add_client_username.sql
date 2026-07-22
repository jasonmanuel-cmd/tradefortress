alter table public.clients
  add column if not exists username text;

alter table public.clients
  drop constraint if exists clients_username_format;

alter table public.clients
  add constraint clients_username_format
  check (username is null or username ~ '^[a-z0-9_]{3,32}$');

create unique index if not exists clients_username_lower_unique
  on public.clients (lower(username))
  where username is not null;

comment on column public.clients.username is
  'Case-insensitive login name. Supabase Auth email remains the internal authentication identity.';
