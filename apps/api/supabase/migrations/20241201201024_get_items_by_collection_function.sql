CREATE OR REPLACE FUNCTION get_items_by_collection(pcollection_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  parent_item_id UUID,
  collection_id UUID
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE item_hierarchy AS (
    SELECT
      id,
      name,
      type,
      parent_item_id,
      collection_id
    FROM
      items
    WHERE
      collection_id = $1 AND parent_item_id IS NULL
    UNION ALL
    SELECT
      i.id,
      i.name,
      i.type,
      i.parent_item_id,
      i.collection_id
    FROM
      items i
      INNER JOIN item_hierarchy ih ON i.parent_item_id = ih.id
  )
  SELECT * FROM item_hierarchy;
END;
$$ LANGUAGE plpgsql;
