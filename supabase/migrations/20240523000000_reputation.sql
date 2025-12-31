-- Create reputation_scores table
CREATE TABLE IF NOT EXISTS reputation_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reputation_events table
CREATE TABLE IF NOT EXISTS reputation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

-- Policies for reputation_scores
CREATE POLICY "Public read access for reputation_scores"
  ON reputation_scores FOR SELECT
  USING (true);

-- Policies for reputation_events
CREATE POLICY "Public read access for reputation_events"
  ON reputation_events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reputation_events"
  ON reputation_events FOR INSERT
  WITH CHECK (auth.uid() = giver_id);
