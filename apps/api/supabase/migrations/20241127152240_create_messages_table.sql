-- create messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null,
  role varchar not null,
  content jsonb not null,
  created_at timestamp not null default now(),
	updated_at timestamp with time zone default now(),

  -- foreign key constraint to chats
  constraint fk_messages_chat foreign key (chat_id) references public.chats(id) on delete cascade
);

-- create index for faster queries on chat_id
create index idx_messages_chat_id on messages(chat_id);

-- enable row level security
alter table
  messages enable row level security;

-- policy to allow users to read messages in chats they own
create policy "allow read access for chat owners" on messages for
select
  to authenticated
  using (exists (
    select 1
    from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));

-- policy to allow users to insert messages into their own chats
create policy "allow insert for chat owners" on messages for
insert
  with check (exists (
    select 1
    from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));

-- policy to allow users to update their own messages (optional, if required)
create policy "allow update for message owners" on messages for
update
  using (exists (
    select 1
    from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));

-- policy to allow users to delete their own messages
create policy "allow delete for chat owners" on messages for
delete
  using (exists (
    select 1
    from chats
    where chats.id = messages.chat_id
    and chats.user_id = auth.uid()
  ));

-- optional: trigger function to handle updates to messages if needed
create
or replace function update_messages_updated_at() returns trigger as $$ begin
  new.updated_at = now();
return new;
end;
$$ language plpgsql;

-- trigger to update timestamps (add updated_at column if necessary)
-- Uncomment if an updated_at column is needed
-- alter table messages add column updated_at timestamp not null default now();
-- create trigger update_messages_updated_at before update on messages
-- for each row execute function update_messages_updated_at();
