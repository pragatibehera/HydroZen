-- Create households table
create table if not exists public.households (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  address text,
  members_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create household_members table
create table if not exists public.household_members (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references public.households on delete cascade not null,
  name text not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create water_quality table
create table if not exists public.water_quality (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references public.households on delete cascade not null,
  tds numeric(10,2) not null, -- Total Dissolved Solids in ppm
  water_quality text check (water_quality in ('excellent', 'good', 'fair', 'poor')) not null,
  water_flow numeric(10,2) not null, -- Flow rate in L/min
  ultrasonic_level numeric(5,2) not null, -- Tank level in percentage
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create water_usage table
create table if not exists public.water_usage (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references public.households on delete cascade not null,
  member_id uuid references public.household_members on delete set null,
  device_type text not null,
  usage_amount numeric(10,2) not null, -- Usage in liters
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create household_stats table
create table if not exists public.household_stats (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references public.households on delete cascade not null,
  daily_average numeric(10,2) not null,
  monthly_target numeric(10,2) not null,
  rewards_earned numeric(10,2) default 0,
  penalties_paid numeric(10,2) default 0,
  month date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(household_id, month)
);

-- Create usage_patterns table
create table if not exists public.usage_patterns (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references public.households on delete cascade not null,
  hour_of_day integer check (hour_of_day >= 0 and hour_of_day < 24),
  day_of_week integer check (day_of_week >= 0 and day_of_week < 7),
  average_usage numeric(10,2) not null,
  month date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rewards_penalties table
create table if not exists public.rewards_penalties (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references public.households on delete cascade not null,
  amount numeric(10,2) not null, -- Positive for rewards, negative for penalties
  reason text not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.water_quality enable row level security;
alter table public.water_usage enable row level security;
alter table public.household_stats enable row level security;
alter table public.usage_patterns enable row level security;
alter table public.rewards_penalties enable row level security;

-- Create policies
create policy "Users can view their own household data"
  on public.households for select
  using (auth.uid() = user_id);

create policy "Users can view their household members"
  on public.household_members for select
  using (
    exists (
      select 1 from public.households
      where households.id = household_members.household_id
      and households.user_id = auth.uid()
    )
  );

create policy "Users can view their water quality data"
  on public.water_quality for select
  using (
    exists (
      select 1 from public.households
      where households.id = water_quality.household_id
      and households.user_id = auth.uid()
    )
  );

create policy "Users can view their water usage data"
  on public.water_usage for select
  using (
    exists (
      select 1 from public.households
      where households.id = water_usage.household_id
      and households.user_id = auth.uid()
    )
  );

-- Function to calculate daily averages and update stats
create or replace function public.calculate_household_stats()
returns trigger as $$
declare
  avg_daily numeric;
  target numeric;
  reward_amount numeric;
  penalty_amount numeric;
begin
  -- Calculate daily average for the current month
  select avg(daily_total)
  into avg_daily
  from (
    select date_trunc('day', timestamp) as day, sum(usage_amount) as daily_total
    from public.water_usage
    where household_id = NEW.household_id
    and date_trunc('month', timestamp) = date_trunc('month', NEW.timestamp)
    group by date_trunc('day', timestamp)
  ) daily_totals;

  -- Set monthly target (10% less than average)
  target := avg_daily * 0.9;

  -- Calculate rewards or penalties
  if NEW.usage_amount < target then
    reward_amount := (target - NEW.usage_amount) * 2; -- Rs. 2 per liter saved
    penalty_amount := 0;
  else
    reward_amount := 0;
    penalty_amount := (NEW.usage_amount - target) * 10; -- Rs. 10 per liter excess
  end if;

  -- Update or insert household stats
  insert into public.household_stats (
    household_id,
    daily_average,
    monthly_target,
    rewards_earned,
    penalties_paid,
    month
  )
  values (
    NEW.household_id,
    avg_daily,
    target,
    reward_amount,
    penalty_amount,
    date_trunc('month', NEW.timestamp)
  )
  on conflict (household_id, month)
  do update set
    daily_average = EXCLUDED.daily_average,
    monthly_target = EXCLUDED.monthly_target,
    rewards_earned = household_stats.rewards_earned + EXCLUDED.rewards_earned,
    penalties_paid = household_stats.penalties_paid + EXCLUDED.penalties_paid,
    updated_at = now();

  -- Record reward or penalty
  if reward_amount > 0 then
    insert into public.rewards_penalties (
      household_id,
      amount,
      reason,
      date
    ) values (
      NEW.household_id,
      reward_amount,
      'Daily usage below target',
      date_trunc('day', NEW.timestamp)
    );
  elsif penalty_amount > 0 then
    insert into public.rewards_penalties (
      household_id,
      amount,
      reason,
      date
    ) values (
      NEW.household_id,
      -penalty_amount,
      'Daily usage above target',
      date_trunc('day', NEW.timestamp)
    );
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for stats calculation
create trigger on_water_usage_update
  after insert on public.water_usage
  for each row execute procedure public.calculate_household_stats();

-- Function to update usage patterns
create or replace function public.update_usage_patterns()
returns trigger as $$
begin
  insert into public.usage_patterns (
    household_id,
    hour_of_day,
    day_of_week,
    average_usage,
    month
  )
  select
    NEW.household_id,
    extract(hour from timestamp) as hour_of_day,
    extract(dow from timestamp) as day_of_week,
    avg(usage_amount) as average_usage,
    date_trunc('month', timestamp) as month
  from public.water_usage
  where household_id = NEW.household_id
  and date_trunc('month', timestamp) = date_trunc('month', NEW.timestamp)
  group by
    household_id,
    extract(hour from timestamp),
    extract(dow from timestamp),
    date_trunc('month', timestamp)
  on conflict (id) do update set
    average_usage = EXCLUDED.average_usage,
    created_at = now();

  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for usage pattern updates
create trigger on_water_usage_pattern_update
  after insert on public.water_usage
  for each row execute procedure public.update_usage_patterns(); 