/* =======================================================================
 1. ENUM  ──────────────────────────────────────────────────────────── */
CREATE TYPE interview_status AS ENUM ('IN_PROGRESS', 'DONE', 'ABORTED');

/* =======================================================================
 2. MAIN TABLE  (one row per guided Q‑and‑A run)                       */
CREATE TABLE public.interviews (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	-- optional link into the items tree (null = standalone)
	item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
	seed_input text NOT NULL,
	started_at timestamp NOT NULL DEFAULT now(),
	finished_at timestamp,
	status interview_status NOT NULL DEFAULT 'IN_PROGRESS',
	total_token_cost numeric(12, 4),
	model_used text,
	metadata jsonb,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_interviews_updated_at BEFORE
UPDATE
	ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

/* =======================================================================
 3. AI‑GENERATED QUESTION (“turn”)                                     */
CREATE TABLE public.interview_turns (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	interview_id uuid NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
	turn_no integer NOT NULL,
	question_text text NOT NULL,
	example_answer_text text,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	UNIQUE (interview_id, turn_no)
);

CREATE INDEX ix_turns_interview_order ON public.interview_turns (interview_id, turn_no);

CREATE TRIGGER trg_interview_turns_updated_at BEFORE
UPDATE
	ON public.interview_turns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

/* =======================================================================
 4. USER ANSWERS (versioned)                                            */
CREATE TABLE public.interview_answers (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	turn_id uuid NOT NULL REFERENCES public.interview_turns(id) ON DELETE CASCADE,
	answer_text text NOT NULL,
	answered_at timestamp NOT NULL DEFAULT now(),
	version integer NOT NULL DEFAULT 1,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	UNIQUE (turn_id, version)
);

-- Fast lookup for the “latest” answer in a turn
CREATE UNIQUE INDEX ix_answers_latest ON public.interview_answers(turn_id)
WHERE
	version = 1;

CREATE TRIGGER trg_interview_answers_updated_at BEFORE
UPDATE
	ON public.interview_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

/* =======================================================================
 5.  FOLDER TREE ✓  – add ‘interview’ as a valid item type             */
ALTER TABLE
	public.items DROP CONSTRAINT chk_item_type,
ADD
	CONSTRAINT chk_item_type CHECK (type IN ('folder', 'request', 'interview'));

/* =======================================================================
 6.  ROW‑LEVEL SECURITY (mirrors existing style)                       */
/* ---- interviews ---------------------------------------------------- */
ALTER TABLE
	public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interviews_select_owner" ON public.interviews FOR
SELECT
	TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "interviews_insert_owner" ON public.interviews FOR
INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interviews_update_owner" ON public.interviews FOR
UPDATE
	USING (auth.uid() = user_id);

CREATE POLICY "interviews_delete_owner" ON public.interviews FOR DELETE USING (auth.uid() = user_id);

/* ---- interview_turns ---------------------------------------------- */
ALTER TABLE
	public.interview_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "turns_select_owner" ON public.interview_turns FOR
SELECT
	TO authenticated USING (
		EXISTS (
			SELECT
				1
			FROM
				public.interviews
			WHERE
				interviews.id = interview_turns.interview_id
				AND interviews.user_id = auth.uid()
		)
	);

CREATE POLICY "turns_insert_owner" ON public.interview_turns FOR
INSERT
	WITH CHECK (
		EXISTS (
			SELECT
				1
			FROM
				public.interviews
			WHERE
				interviews.id = interview_turns.interview_id
				AND interviews.user_id = auth.uid()
		)
	);

/* updates / deletes follow the same pattern */
CREATE POLICY "turns_update_owner" ON public.interview_turns FOR
UPDATE
	USING (
		EXISTS (
			SELECT
				1
			FROM
				public.interviews
			WHERE
				interviews.id = interview_turns.interview_id
				AND interviews.user_id = auth.uid()
		)
	);

CREATE POLICY "turns_delete_owner" ON public.interview_turns FOR DELETE USING (
	EXISTS (
		SELECT
			1
		FROM
			public.interviews
		WHERE
			interviews.id = interview_turns.interview_id
			AND interviews.user_id = auth.uid()
	)
);

/* ---- interview_answers -------------------------------------------- */
ALTER TABLE
	public.interview_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "answers_select_owner" ON public.interview_answers FOR
SELECT
	TO authenticated USING (
		EXISTS (
			SELECT
				1
			FROM
				public.interview_turns t
				JOIN public.interviews s ON s.id = t.interview_id
			WHERE
				t.id = interview_answers.turn_id
				AND s.user_id = auth.uid()
		)
	);

CREATE POLICY "answers_insert_owner" ON public.interview_answers FOR
INSERT
	WITH CHECK (
		EXISTS (
			SELECT
				1
			FROM
				public.interview_turns t
				JOIN public.interviews s ON s.id = t.interview_id
			WHERE
				t.id = interview_answers.turn_id
				AND s.user_id = auth.uid()
		)
	);

/* updates / deletes mirror the same EXISTS pattern */
CREATE POLICY "answers_update_owner" ON public.interview_answers FOR
UPDATE
	USING (
		EXISTS (
			SELECT
				1
			FROM
				public.interview_turns t
				JOIN public.interviews s ON s.id = t.interview_id
			WHERE
				t.id = interview_answers.turn_id
				AND s.user_id = auth.uid()
		)
	);

CREATE POLICY "answers_delete_owner" ON public.interview_answers FOR DELETE USING (
	EXISTS (
		SELECT
			1
		FROM
			public.interview_turns t
			JOIN public.interviews s ON s.id = t.interview_id
		WHERE
			t.id = interview_answers.turn_id
			AND s.user_id = auth.uid()
	)
);

/* =======================================================================
 7.  GRANTS  (same as existing tables)                                 */
GRANT ALL ON TABLE public.interviews TO anon,
authenticated,
service_role;

GRANT ALL ON TABLE public.interview_turns TO anon,
authenticated,
service_role;

GRANT ALL ON TABLE public.interview_answers TO anon,
authenticated,
service_role;

/* =======================================================================
 Done.  The new feature is integrated without touching existing docs.  */