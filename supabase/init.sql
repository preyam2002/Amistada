-- Amistala Database Init Script
-- Consolidated from all migration files
-- Assumes no existing data, creates all tables from scratch

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID extension for ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_color TEXT,
  bio TEXT,
  interests TEXT[],
  persona TEXT[],
  looking_for TEXT[],
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROOMS TABLE
CREATE TYPE room_type AS ENUM ('AI_DM', 'INTRO_GROUP');

CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  is_main_ai_room BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  type room_type NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROOM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS room_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  left_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  UNIQUE(room_id, user_id)
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- For private/DM messages
  is_ai BOOLEAN DEFAULT FALSE,
  content TEXT NOT NULL,
  media_url TEXT, -- For rich media support
  media_type TEXT, -- 'image', 'audio', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- REPUTATION SYSTEM
-- ============================================================================

-- REPUTATION SCORES TABLE
CREATE TABLE IF NOT EXISTS reputation_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REPUTATION EVENTS TABLE
CREATE TABLE IF NOT EXISTS reputation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROGRESSIVE REVEAL SYSTEM
-- ============================================================================

-- PROFILE REVEALS TABLE
CREATE TABLE IF NOT EXISTS profile_reveals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1, -- 1 = basic, 2 = full
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, viewer_id)
);

-- ============================================================================
-- BADGES SYSTEM
-- ============================================================================

-- BADGES TABLE
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL, -- Emoji or URL
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER BADGES TABLE
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================================================
-- MONETIZATION SYSTEM
-- ============================================================================

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id), -- Can be null if system purchase
  type TEXT NOT NULL, -- 'gift', 'super_like', 'subscription'
  item_id TEXT, -- 'coffee', 'rose', 'gold_tier'
  amount INTEGER DEFAULT 0, -- Cost in virtual currency (or cents)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone." ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- ROOMS POLICIES
CREATE POLICY "Rooms are viewable by members." ON rooms 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = rooms.id 
        AND room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms." ON rooms 
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ROOM MEMBERS POLICIES
CREATE POLICY "Room members are viewable by members." ON room_members 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members rm 
      WHERE rm.room_id = room_members.room_id 
        AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms." ON room_members 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their membership." ON room_members 
  FOR UPDATE USING (auth.uid() = user_id);

-- MESSAGES POLICIES
CREATE POLICY "Messages are viewable by room members." ON messages 
  FOR SELECT USING (
    (
      recipient_id IS NULL 
      AND EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.room_id = messages.room_id 
          AND room_members.user_id = auth.uid()
      )
    )
    OR (recipient_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in their rooms." ON messages 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_members 
      WHERE room_members.room_id = messages.room_id 
        AND room_members.user_id = auth.uid()
    )
  );

-- REPUTATION POLICIES
CREATE POLICY "Public read access for reputation_scores" 
  ON reputation_scores FOR SELECT USING (true);

CREATE POLICY "Public read access for reputation_events" 
  ON reputation_events FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reputation_events" 
  ON reputation_events FOR INSERT 
  WITH CHECK (auth.uid() = giver_id);

-- PROFILE REVEALS POLICIES
CREATE POLICY "Users can see reveals they are involved in" 
  ON profile_reveals FOR SELECT 
  USING (auth.uid() = owner_id OR auth.uid() = viewer_id);

CREATE POLICY "System can insert reveals" 
  ON profile_reveals FOR INSERT 
  WITH CHECK (true);

-- BADGES POLICIES
CREATE POLICY "Public read access for badges" 
  ON badges FOR SELECT USING (true);

CREATE POLICY "Public read access for user_badges" 
  ON user_badges FOR SELECT USING (true);

-- TRANSACTIONS POLICIES
CREATE POLICY "Users can view their own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to search for similar profiles using vector embeddings
CREATE OR REPLACE FUNCTION match_profiles (
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT,
  exclude_user_id UUID
) RETURNS TABLE (
  id UUID,
  similarity FLOAT
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    profiles.id,
    1 - (profiles.embedding <=> query_embedding) AS similarity
  FROM profiles
  WHERE 1 - (profiles.embedding <=> query_embedding) > match_threshold
    AND profiles.id != exclude_user_id
  ORDER BY profiles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert initial badges
INSERT INTO badges (name, icon, description) VALUES
  ('Early Adopter', '🚀', 'Joined Amistala in the early days.'),
  ('Chatterbox', '🗣️', 'Sent over 100 messages.'),
  ('Vibe Master', '✨', 'Received 10 Kudos from other users.')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Storage Bucket Setup (for chat media):
-- Note: Storage buckets must be created via Supabase Dashboard or API
-- Create a bucket named 'chat-media' with public access or signed URLs
-- 
-- Migration History:
-- - Consolidated from schema.sql, 001_private_messages.sql,
--   20240523000000_reputation.sql, 20240524000000_progressive_reveal.sql,
--   20240525000000_badges.sql, 20240526000000_rich_media.sql,
--   20240527000000_monetization.sql, 20241201000000_enable_vector.sql
-- 
-- ============================================================================
