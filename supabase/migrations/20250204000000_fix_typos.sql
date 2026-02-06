-- Fix typo in room_members table
ALTER TABLE room_members RENAME COLUMN is_archived TO is_archived;

-- Fix TIMESTAMPTZ typo in transactions table
ALTER TABLE transactions ALTER COLUMN created_at TYPE TIMESTAMPTZ;
