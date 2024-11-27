-- create user_collections table
create table user_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamp not null default now(),
  updated_at timestamp with time zone default now(),
  
  -- foreign key constraint to Users
  constraint fk_collection_user foreign key (user_id) references public.users(id) on delete cascade
);

-- enable row level security
alter table
  user_collections enable row level security;

-- policy to allow read access only for user_collections owners
create policy "allow read access for user_collections owners" on user_collections for
select
  to authenticated
  using (auth.uid() = user_id);

-- policy to allow users to insert their own collections
create policy "allow insert for user_collections owners" on user_collections for
insert
  with check (auth.uid() = user_id);

-- policy to allow users to update their own collections
create policy "allow update for user_collections owners" on user_collections for
update
  using (auth.uid() = user_id);

-- policy to allow users to delete their own collections
create policy "allow delete for user_collections owners" on user_collections for
delete
  using (auth.uid() = user_id);

-- function to update the updated_at timestamp
create
or replace function update_collection_updated_at() returns trigger as $$ begin
  new.updated_at = now();
return new;
end;
$$ language plpgsql;

-- trigger to call the update_collection_updated_at function
create trigger update_collection_updated_at before
update
  on user_collections for each row execute function update_collection_updated_at();
