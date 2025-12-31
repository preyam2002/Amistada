-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL, -- Emoji or URL
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for badges"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "Public read access for user_badges"
  ON user_badges FOR SELECT
  USING (true);

-- Insert initial badges
INSERT INTO badges (name, icon, description) VALUES
  ('Early Adopter', '🚀', 'Joined Amistala in the early days.'),
  ('Chatterbox', '🗣️', 'Sent over 100 messages.'),
  ('Vibe Master', '✨', 'Received 10 Kudos from other users.')
ON CONFLICT (name) DO NOTHING;
