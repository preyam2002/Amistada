-- BADGES
create table badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  icon text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- USER BADGES
create table user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  badge_id uuid references badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- REPUTATION SCORES
create table reputation_scores (
  user_id uuid references profiles(id) on delete cascade primary key,
  score integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REPUTATION EVENTS
create table reputation_events (
  id uuid default uuid_generate_v4() primary key,
  giver_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS (for monetization)
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete set null,
  type text not null,
  item_id text,
  amount integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default badges
insert into badges (name, icon, description) values
  ('Chatterbox', '💬', 'Sent 100 messages'),
  ('Vibe Master', '✨', 'Received 10 kudos'),
  ('First Match', '🤝', 'Matched with your first person'),
  ('Gift Giver', '🎁', 'Sent a gift to someone'),
  ('Early Adopter', '🚀', 'Joined during beta');

-- RLS POLICIES
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table reputation_scores enable row level security;
alter table reputation_events enable row level security;
alter table transactions enable row level security;

-- Badges: Public read
create policy "Badges are viewable by everyone." on badges for select using (true);
create policy "Anyone can earn badges." on badges for insert with check (true);

-- User Badges: Viewable by self and badges are public
create policy "Badges are viewable by everyone." on user_badges for select using (true);
create policy "Users can insert their own badges." on user_badges for insert with check (auth.uid() = user_id);

-- Reputation Scores: Viewable by self, self can update via events
create policy "Users can view own reputation." on reputation_scores for select using (auth.uid() = user_id);
create policy "Users can update own reputation." on reputation_scores for update using (auth.uid() = user_id);

-- Reputation Events: Viewable by participants
create policy "Participants can view reputation events." on reputation_events for select using (
  auth.uid() = giver_id or auth.uid() = receiver_id
);
create policy "Users can create reputation events." on reputation_events for insert with check (
  auth.uid() = giver_id
);

-- Transactions: Viewable by sender, insert by self
create policy "Users can view own transactions." on transactions for select using (
  auth.uid() = sender_id
);
create policy "Users can create transactions." on transactions for insert with check (
  auth.uid() = sender_id
);
