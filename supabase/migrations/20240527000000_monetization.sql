-- Create transactions table for gifts and super likes
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id), -- Can be null if system purchase
  type TEXT NOT NULL, -- 'gift', 'super_like', 'subscription'
  item_id TEXT, -- 'coffee', 'rose', 'gold_tier'
  amount INTEGER DEFAULT 0, -- Cost in virtual currency (or cents)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own transactions (sent or received)
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to insert their own transactions (sender must be auth user)
CREATE POLICY "Users can create transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
