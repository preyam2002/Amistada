-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Create match_profiles function for vector similarity search
-- This function finds similar users based on embedding cosine similarity
create or replace function match_profiles(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  exclude_user_id uuid
)
returns table (
  id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    profiles.id,
    1 - (profiles.embedding <=> query_embedding) as similarity
  from profiles
  where profiles.id != exclude_user_id
    and profiles.embedding is not null
    and (1 - (profiles.embedding <=> query_embedding)) > match_threshold
  order by profiles.embedding <=> query_embedding
  limit match_count;
end;
$$;
