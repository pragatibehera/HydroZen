-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (main table)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  points integer default 0,
  total_leakages_reported integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create points_history table
create table if not exists public.points_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  points integer not null,
  action text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create leakage_reports table
create table if not exists public.leakage_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  image_url text not null,
  location text,
  description text,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  verification_confidence numeric(4,3),
  verification_description text,
  points_awarded integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create achievements table
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  points_required integer not null,
  badge_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_achievements table
create table if not exists public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  achievement_id uuid references public.achievements on delete cascade not null,
  achieved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- Create indexes for better performance
create index if not exists idx_points_history_user_id on public.points_history(user_id);
create index if not exists idx_points_history_created_at on public.points_history(created_at desc);
create index if not exists idx_leakage_reports_user_id on public.leakage_reports(user_id);
create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.points_history enable row level security;
alter table public.leakage_reports enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- Create RLS policies

-- Users policies
create policy "Users can read their own data"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users
  for update
  using (auth.uid() = id);

-- Points history policies
create policy "Users can read their own points history"
  on public.points_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own points history"
  on public.points_history
  for insert
  with check (auth.uid() = user_id);

-- Leakage reports policies
create policy "Users can read their own leakage reports"
  on public.leakage_reports
  for select
  using (auth.uid() = user_id);

create policy "Users can create leakage reports"
  on public.leakage_reports
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own leakage reports"
  on public.leakage_reports
  for update
  using (auth.uid() = user_id);

-- Achievements policies
create policy "Anyone can read achievements"
  on public.achievements
  for select
  using (true);

-- User achievements policies
create policy "Users can read their own achievements"
  on public.user_achievements
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own achievements"
  on public.user_achievements
  for insert
  with check (auth.uid() = user_id);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, points, total_leakages_reported)
  values (new.id, new.email, 0, 0);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update user's total_leakages_reported
create or replace function public.update_total_leakages()
returns trigger as $$
begin
  if (new.status = 'verified' and old.status = 'pending') then
    update public.users
    set total_leakages_reported = total_leakages_reported + 1,
        updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updating total leakages
drop trigger if exists on_leakage_verified on public.leakage_reports;
create trigger on_leakage_verified
  after update on public.leakage_reports
  for each row execute procedure public.update_total_leakages();

-- Insert default achievements
insert into public.achievements (name, description, points_required, badge_url) values
  ('Novice Reporter', 'Report your first water leakage', 100, null),
  ('Active Citizen', 'Report 5 water leakages', 500, null),
  ('Water Warrior', 'Report 10 water leakages', 1000, null),
  ('Conservation Champion', 'Report 25 water leakages', 2500, null),
  ('Water Guardian', 'Earn 5000 points through various activities', 5000, null)
on conflict do nothing; 