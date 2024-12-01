BEGIN;

-- Step 1: Remove the `title` column from the `pages` table
ALTER TABLE pages DROP COLUMN title;

COMMIT;
