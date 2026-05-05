create extension if not exists pgcrypto;

create table if not exists public.dividend_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  session_token_hash text not null default '',
  session_token_issued_at timestamptz,
  session_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dividend_users_email_idx on public.dividend_users (lower(email));
create index if not exists dividend_users_username_idx on public.dividend_users (lower(username));

create or replace function public.set_dividend_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_dividend_users_updated_at on public.dividend_users;
create trigger set_dividend_users_updated_at
before update on public.dividend_users
for each row
execute function public.set_dividend_users_updated_at();

alter table public.dividend_users disable row level security;
