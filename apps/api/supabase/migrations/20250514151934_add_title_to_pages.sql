/* ============================================================
 1.  ADD title COLUMN TO pages
 ============================================================ */
ALTER TABLE
	public.pages
ADD
	COLUMN title text NOT NULL DEFAULT '';