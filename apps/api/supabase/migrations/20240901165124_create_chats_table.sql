-- create chats table
create table chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  created_at timestamp not null default now(),
  updated_at timestamp with time zone default now()
);

-- add foreign key constraint
alter table
  chats
add
  constraint fk_chat_user foreign key (user_id) references public.users(id) on
delete
  cascade;

-- create index for faster queries
create index idx_chat_user_id on chats(user_id);

-- add rls policies
alter table
  chats enable row level security;

-- policy to allow read access for all authenticated users
create policy "allow read access for chat owners" on chats for
select
  using (auth.uid() = user_id);

-- policy to allow users to insert their own chat records
create policy "allow insert for authenticated users" on chats for
insert
  with check (auth.uid() = user_id);

-- policy to allow users to update their own chat records
create policy "allow update for chat owners" on chats for
update
  using (auth.uid() = user_id);

-- policy to allow users to delete their own chat records
create policy "allow delete for chat owners" on chats for
delete
  using (auth.uid() = user_id);

-- function to update the updated_at timestamp
create
or replace function update_chat_updated_at() returns trigger as $$ begin
  new.updated_at = now();

return new;

end;

$$ language plpgsql;

-- trigger to call the update_chat_updated_at function
create trigger update_chat_updated_at before
update
  on chats for each row execute function update_chat_updated_at();
