-- create directories table
create table directories (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid, -- optional: belongs to a user_collections
  parent_directory_id uuid, -- optional: belongs to a parent directories
  name text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),

  -- foreign key constraints
  constraint fk_directory_collection foreign key (collection_id) references user_collections(id) on delete cascade,
  constraint fk_directory_parent foreign key (parent_directory_id) references directories(id) on delete cascade,

  -- ensure either collection_id or parent_directory_id is set, but not both
  constraint chk_directory_parent_or_collection check (
    (collection_id is not null and parent_directory_id is null) or
    (collection_id is null and parent_directory_id is not null)
  )
);

-- enable row level security
alter table
  directories enable row level security;

-- policy to allow read access only for directories owners
create policy "allow read access for directories owners" on directories for
select
  to authenticated
  using (exists (
    select 1
    from user_collections
    where user_collections.id = directories.collection_id
    and user_collections.user_id = auth.uid()
  ) or exists (
    select 1
    from directories parent -- self referencing join to check parent directories ownership
    join user_collections on parent.collection_id = user_collections.id
    where parent.id = directories.parent_directory_id
    and user_collections.user_id = auth.uid()
  ));

-- policy to allow users to insert their own directories
create policy "allow insert for directories owners" on directories for
insert
  with check (exists (
    select 1
    from user_collections
    where user_collections.id = directories.collection_id
    and user_collections.user_id = auth.uid()
  ) or exists (
    select 1
    from directories parent
    join user_collections on parent.collection_id = user_collections.id
    where parent.id = directories.parent_directory_id
    and user_collections.user_id = auth.uid()
  ));

-- policy to allow users to update their own directories
create policy "allow update for directories owners" on directories for
update
  using (exists (
    select 1
    from user_collections
    where user_collections.id = directories.collection_id
    and user_collections.user_id = auth.uid()
  ));

-- policy to allow users to delete their own directories
create policy "allow delete for directories owners" on directories for
delete
  using (exists (
    select 1
    from user_collections
    where user_collections.id = directories.collection_id
    and user_collections.user_id = auth.uid()
  ));
