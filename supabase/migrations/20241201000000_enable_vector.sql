-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add a column to the profiles table to store the embedding
-- Using 1536 dimensions for OpenAI's text-embedding-3-small model
alter table profiles
add column if not exists embedding vector(1536);

-- Create a function to search for profiles
create or replace function match_profiles (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  exclude_user_id uuid
) returns table (
  id uuid,
  similarity float
) language plpgsql stable as $$
begin
  return query
  select
    profiles.id,
    1 - (profiles.embedding <=> query_embedding) as similarity
  from profiles
  where 1 - (profiles.embedding <=> query_embedding) > match_threshold
  and profiles.id != exclude_user_id
  order by profiles.embedding <=> query_embedding
  limit match_count;
end;
$$;
