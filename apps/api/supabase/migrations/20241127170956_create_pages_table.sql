-- create pages table
create table pages (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid, -- optional: belongs to a user_collections
  directory_id uuid, -- optional: belongs to a parent directories
  title text not null,
  content text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),

  -- foreign key constraints
  constraint fk_page_collection foreign key (collection_id) references user_collections(id) on delete cascade,
  constraint fk_page_directory foreign key (directory_id) references directories(id) on delete cascade,

  -- ensure either collection_id or directory_id is set, but not both
  constraint chk_page_parent_or_collection check (
    (collection_id is not null and directory_id is null) or
    (collection_id is null and directory_id is not null)
  )
);

-- enable row level security
alter table
  pages enable row level security;

-- policy to allow read access only for page owners
create policy "allow read access for page owners" on pages for
select
  to authenticated
  using (exists (
    select 1
    from user_collections
    where user_collections.id = pages.collection_id
    and user_collections.user_id = auth.uid()
  ) or exists (
    select 1
    from directories
    join user_collections on directories.collection_id = user_collections.id
    where directories.id = pages.directory_id
    and user_collections.user_id = auth.uid()
  ));

-- policy to allow users to insert their own pages
create policy "allow insert for page owners" on pages for
insert
  with check (exists (
    select 1
    from user_collections
    where user_collections.id = pages.collection_id
    and user_collections.user_id = auth.uid()
  ) or exists (
    select 1
    from directories
    join user_collections on directories.collection_id = user_collections.id
    where directories.id = pages.directory_id
    and user_collections.user_id = auth.uid()
  ));

-- policy to allow users to update their own pages
create policy "allow update for page owners" on pages for
update
  using (exists (
    select 1
    from user_collections
    where user_collections.id = pages.collection_id
    and user_collections.user_id = auth.uid()
  ));

-- policy to allow users to delete their own pages
create policy "allow delete for page owners" on pages for
delete
  using (exists (
    select 1
    from user_collections
    where user_collections.id = pages.collection_id
    and user_collections.user_id = auth.uid()
  ));
