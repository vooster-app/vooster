/* ─────────────────────────────
 1.  Remove interview_answers
 ────────────────────────────*/
DROP TRIGGER IF EXISTS trg_interview_answers_updated_at ON public.interview_answers;

DROP POLICY IF EXISTS answers_select_owner ON public.interview_answers;

DROP POLICY IF EXISTS answers_insert_owner ON public.interview_answers;

DROP POLICY IF EXISTS answers_update_owner ON public.interview_answers;

DROP POLICY IF EXISTS answers_delete_owner ON public.interview_answers;

DROP INDEX IF EXISTS ix_answers_latest;

DROP TABLE IF EXISTS public.interview_answers CASCADE;

/* ─────────────────────────────
 2.  Add answer columns to interview_turns
 ────────────────────────────*/
ALTER TABLE
	public.interview_turns
ADD
	COLUMN answer_text text,
ADD
	COLUMN answered_at timestamp,
ADD
	COLUMN answer_version integer NOT NULL DEFAULT 1;

/* ─────────────────────────────
 3.  Refresh UPDATE policy on interview_turns
 ────────────────────────────*/
DROP POLICY IF EXISTS turns_update_owner ON public.interview_turns;

CREATE POLICY turns_update_owner ON public.interview_turns FOR
UPDATE
	USING (
		EXISTS (
			SELECT
				1
			FROM
				public.interviews s
			WHERE
				s.id = interview_turns.interview_id
				AND s.user_id = auth.uid()
		)
	);