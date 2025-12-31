-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_color text,
  bio text,
  interests text[],
  persona text[],
  looking_for text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROOMS
create type room_type as enum ('AI_DM', 'INTRO_GROUP');

create table rooms (
  id uuid default uuid_generate_v4() primary key,
  name text,
  is_main_ai_room boolean default false,
  created_by uuid references profiles(id),
  type room_type not null,
  archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROOM MEMBERS
create table room_members (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  left_at timestamp with time zone,
  is_archived boolean default false,
  unique(room_id, user_id)
);

-- MESSAGES
create table messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete set null, -- null for AI if we want, or use a special AI user
  recipient_id uuid references profiles(id) on delete set null, -- null for public messages
  is_ai boolean default false,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Basic)
alter table profiles enable row level security;
alter table rooms enable row level security;
alter table room_members enable row level security;
alter table messages enable row level security;

-- Profiles: Public read, self update
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Rooms: Viewable if member
create policy "Rooms are viewable by members." on rooms for select using (
  exists (
    select 1 from room_members where room_members.room_id = rooms.id and room_members.user_id = auth.uid()
  )
);
create policy "Users can create rooms." on rooms for insert with check (auth.uid() = created_by);

-- Room Members: Viewable if member or self
create policy "Room members are viewable by members." on room_members for select using (
  exists (
    select 1 from room_members rm where rm.room_id = room_members.room_id and rm.user_id = auth.uid()
  )
);
create policy "Users can join rooms." on room_members for insert with check (auth.uid() = user_id);
create policy "Users can update their membership." on room_members for update using (auth.uid() = user_id);

-- Messages: Viewable if member
create policy "Messages are viewable by room members." on messages for select using (
  exists (
    select 1 from room_members where room_members.room_id = messages.room_id and room_members.user_id = auth.uid()
  )
);
create policy "Users can insert messages in their rooms." on messages for insert with check (
  exists (
    select 1 from room_members where room_members.room_id = messages.room_id and room_members.user_id = auth.uid()
  )
);

-- REALTIME
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table messages;
