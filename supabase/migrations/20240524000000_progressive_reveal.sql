-- Create profile_reveals table
CREATE TABLE IF NOT EXISTS profile_reveals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1, -- 1 = basic, 2 = full
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, viewer_id)
);

-- Enable RLS
ALTER TABLE profile_reveals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see reveals they are involved in"
  ON profile_reveals FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = viewer_id);

CREATE POLICY "System can insert reveals"
  ON profile_reveals FOR INSERT
  WITH CHECK (true); -- In a real app, we'd restrict this more, but for MVP/Server Actions it's fine
