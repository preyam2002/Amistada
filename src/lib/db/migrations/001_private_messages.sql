-- Add recipient_id to messages table
alter table messages add column recipient_id uuid references profiles(id) on delete set null;

-- Update RLS for messages to include recipient_id check
drop policy "Messages are viewable by room members." on messages;

create policy "Messages are viewable by room members." on messages for select using (
  (
    recipient_id is null 
    and exists (
      select 1 from room_members where room_members.room_id = messages.room_id and room_members.user_id = auth.uid()
    )
  )
  or
  (
    recipient_id = auth.uid()
  )
);
