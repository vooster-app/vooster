BEGIN;

-- Step 1: Rename `directories` table to `items`
ALTER TABLE directories RENAME TO items;

-- Step 2: Add `type` column to `items` table
ALTER TABLE items
ADD COLUMN type TEXT NOT NULL DEFAULT 'folder',
ADD CONSTRAINT chk_item_type CHECK (type IN ('folder', 'request'));

-- Step 3: Rename `parent_directory_id` column in `items` to `parent_item_id`
ALTER TABLE items
RENAME COLUMN parent_directory_id TO parent_item_id;

-- Step 4: Update `pages` table to reference `items` instead of `directories`
ALTER TABLE pages
DROP CONSTRAINT fk_page_directory;

ALTER TABLE pages
ADD CONSTRAINT fk_page_item FOREIGN KEY (directory_id)
REFERENCES items (id)
ON DELETE CASCADE;

-- Rename `directory_id` column in `pages` to `item_id`
ALTER TABLE pages
RENAME COLUMN directory_id TO item_id;

-- Step 5: Adjust check constraints for `items` table
-- Drop old constraint (if exists, skip if not needed)
DO $$ BEGIN
  ALTER TABLE items DROP CONSTRAINT IF EXISTS chk_directory_parent_or_collection;
END $$;

-- Add updated constraint
ALTER TABLE items
ADD CONSTRAINT chk_item_parent_or_collection CHECK (
  (collection_id IS NOT NULL AND parent_item_id IS NULL AND type = 'folder') OR
  (parent_item_id IS NOT NULL AND collection_id IS NULL)
);

-- Step 6: Verify `type` column is correctly populated
-- Assuming existing data is structured correctly:
-- All items linked to `pages` are `request`, others are `folder`.
UPDATE items
SET type = 'request'
WHERE id IN (SELECT DISTINCT item_id FROM pages);

UPDATE items
SET type = 'folder'
WHERE type != 'request';

COMMIT;
