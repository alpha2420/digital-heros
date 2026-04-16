-- Supabase Schema for Charity/Draw Application

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Profile)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Subscriptions Table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan text check (plan in ('monthly', 'yearly')) not null,
  status text check (status in ('active', 'cancelled', 'lapsed')) not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Scores Table
create table public.scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  score integer check (score >= 1 and score <= 45) not null,
  played_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, played_date)
);

-- 4. Charities Table
create table public.charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  is_featured boolean default false,
  events jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Charity Selections Table
create table public.charity_selections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  charity_id uuid references public.charities(id) on delete cascade not null,
  contribution_percent integer default 10 check (contribution_percent >= 0 and contribution_percent <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Draws Table
create table public.draws (
  id uuid default uuid_generate_v4() primary key,
  month text not null,
  status text check (status in ('draft', 'simulated', 'published')) default 'draft' not null,
  draw_numbers integer[] check (array_length(draw_numbers, 1) > 0),
  jackpot_amount numeric(15, 2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Draw Entries Table
create table public.draw_entries (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  matched_numbers integer[],
  match_count integer default 0,
  prize_amount numeric(15, 2) default 0
);

-- 8. Winners Table
create table public.winners (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  match_type text,
  prize_amount numeric(15, 2) default 0,
  proof_url text,
  status text check (status in ('pending', 'approved', 'rejected', 'paid')) default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Prize Pools Table
create table public.prize_pools (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  total_pool numeric(15, 2) default 0,
  five_match_pool numeric(15, 2) default 0,
  four_match_pool numeric(15, 2) default 0,
  three_match_pool numeric(15, 2) default 0,
  jackpot_carried_over numeric(15, 2) default 0
);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.charity_selections enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;
alter table public.prize_pools enable row level security;

-- Admin Check Function
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );
end;
$$ language plpgsql security definer;

-- RLS Policies

-- Users
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id or is_admin());
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id or is_admin());

-- Subscriptions
create policy "Users can view their own subscriptions" on public.subscriptions for select using (auth.uid() = user_id or is_admin());
create policy "Admins can manage subscriptions" on public.subscriptions for all using (is_admin());

-- Scores
create policy "Users can view their own scores" on public.scores for select using (auth.uid() = user_id or is_admin());
create policy "Users can insert their own scores" on public.scores for insert with check (auth.uid() = user_id or is_admin());
create policy "Users can update their own scores" on public.scores for update using (auth.uid() = user_id or is_admin());

-- Charities
create policy "Anyone can view charities" on public.charities for select using (true);
create policy "Admins can manage charities" on public.charities for all using (is_admin());

-- Charity Selections
create policy "Users can view their own selections" on public.charity_selections for select using (auth.uid() = user_id or is_admin());
create policy "Users can manage their own selections" on public.charity_selections for all using (auth.uid() = user_id or is_admin());

-- Draws
create policy "Anyone can view draws" on public.draws for select using (true);
create policy "Admins can manage draws" on public.draws for all using (is_admin());

-- Draw Entries
create policy "Users can view their own entries" on public.draw_entries for select using (auth.uid() = user_id or is_admin());
create policy "Admins can manage entries" on public.draw_entries for all using (is_admin());

-- Winners
create policy "Anyone can view winners" on public.winners for select using (true);
create policy "Admins can manage winners" on public.winners for all using (is_admin());

-- Prize Pools
create policy "Anyone can view prize pools" on public.prize_pools for select using (true);
create policy "Admins can manage prize pools" on public.prize_pools for all using (is_admin());

-- Auth Sync Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
