-- Drop existing policies for items table
DROP POLICY IF EXISTS "allow delete for directories owners" ON "public"."items";

DROP POLICY IF EXISTS "allow insert for directories owners" ON "public"."items";

DROP POLICY IF EXISTS "allow read access for directories owners" ON "public"."items";

DROP POLICY IF EXISTS "allow update for directories owners" ON "public"."items";

-- Create new simplified policies
CREATE POLICY "allow delete for directories owners" ON "public"."items" FOR DELETE USING (
	EXISTS (
		SELECT
			1
		FROM
			"public"."user_collections"
		WHERE
			"user_collections"."id" = "items"."collection_id"
			AND "user_collections"."user_id" = auth.uid()
	)
);

CREATE POLICY "allow insert for directories owners" ON "public"."items" FOR
INSERT
	WITH CHECK (
		EXISTS (
			SELECT
				1
			FROM
				"public"."user_collections"
			WHERE
				"user_collections"."id" = "items"."collection_id"
				AND "user_collections"."user_id" = auth.uid()
		)
	);

CREATE POLICY "allow read access for directories owners" ON "public"."items" FOR
SELECT
	TO authenticated USING (
		EXISTS (
			SELECT
				1
			FROM
				"public"."user_collections"
			WHERE
				"user_collections"."id" = "items"."collection_id"
				AND "user_collections"."user_id" = auth.uid()
		)
	);

CREATE POLICY "allow update for directories owners" ON "public"."items" FOR
UPDATE
	USING (
		EXISTS (
			SELECT
				1
			FROM
				"public"."user_collections"
			WHERE
				"user_collections"."id" = "items"."collection_id"
				AND "user_collections"."user_id" = auth.uid()
		)
	);