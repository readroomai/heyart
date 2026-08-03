-- HiArt initial schema.
-- Run in the Supabase SQL editor, or apply with `npm run db:push`.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  display_name text,
  email text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists users_clerk_user_id_key on users (clerk_user_id);

create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  name text not null,
  description text not null default '',
  target_audience text not null default '',
  personality text not null default '',
  desired_impression text not null default '',
  primary_platform text not null default '',
  primary_colours jsonb not null default '[]'::jsonb,
  secondary_colours jsonb not null default '[]'::jsonb,
  positive_words jsonb not null default '[]'::jsonb,
  negative_words jsonb not null default '[]'::jsonb,
  logo_storage_path text,
  reference_storage_path text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists brand_profiles_user_id_idx on brand_profiles (user_id);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  mode text not null,
  title text not null,
  visual_type text not null default '',
  platform text not null default '',
  target_audience text not null default '',
  goal text not null default '',
  desired_impression text not null default '',
  context text not null default '',
  brand_profile_id uuid references brand_profiles (id) on delete set null,
  result jsonb,
  model text not null default '',
  confidence real,
  is_favourite boolean not null default false,
  status text not null default 'processing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists analyses_user_id_idx on analyses (user_id);
create index if not exists analyses_user_created_idx on analyses (user_id, created_at desc);

create table if not exists analysis_images (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null,
  image_role text not null default 'primary',
  created_at timestamptz not null default now()
);
create index if not exists analysis_images_analysis_id_idx on analysis_images (analysis_id);

create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  analysis_id uuid not null references analyses (id) on delete cascade,
  slug text not null,
  reveal_images boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create unique index if not exists share_links_slug_key on share_links (slug);
create index if not exists share_links_analysis_id_idx on share_links (analysis_id);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  event_type text not null,
  model text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists usage_events_user_created_idx on usage_events (user_id, created_at desc);

-- All access runs through the server using the service role. Row level
-- security stays on so the anon key can never read user rows directly.
alter table users enable row level security;
alter table brand_profiles enable row level security;
alter table analyses enable row level security;
alter table analysis_images enable row level security;
alter table share_links enable row level security;
alter table usage_events enable row level security;

-- Private image bucket. Files are only ever served through short-lived
-- signed URLs generated on the server.
insert into storage.buckets (id, name, public)
values ('hiart-uploads', 'hiart-uploads', false)
on conflict (id) do nothing;
