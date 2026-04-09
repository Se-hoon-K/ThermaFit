-- ThermaFit — initial schema
-- Run this in the Supabase dashboard: SQL Editor → New Query → paste and run.

-- ─── Preferences ─────────────────────────────────────────────────────────────
-- One row per user. Stores calibrated sensitivity + display units.
-- updated_at lets the client resolve conflicts (server vs local) on first sync.

CREATE TABLE IF NOT EXISTS public.preferences (
  user_id    UUID      PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sensitivity SMALLINT  NOT NULL DEFAULT 0
                        CHECK (sensitivity BETWEEN -2 AND 2),
  units      TEXT      NOT NULL DEFAULT 'metric'
                        CHECK (units IN ('metric', 'imperial')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Feedback entries ─────────────────────────────────────────────────────────
-- One row per "How was it?" answer. The id comes from the client (UUID generated
-- locally) so we can safely upsert without creating duplicates on retry.

CREATE TABLE IF NOT EXISTS public.feedback_entries (
  id                  UUID        PRIMARY KEY,
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at         TIMESTAMPTZ NOT NULL,
  temp_c              REAL        NOT NULL,
  sensitivity_at_time SMALLINT    NOT NULL,
  outcome             TEXT        NOT NULL CHECK (outcome IN ('cold', 'ok', 'warm')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_recorded
  ON public.feedback_entries (user_id, recorded_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Each user can only read and write their own rows.

ALTER TABLE public.preferences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_preferences" ON public.preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own_feedback" ON public.feedback_entries
  FOR ALL USING (auth.uid() = user_id);

-- ─── Helper: auto-update updated_at on preferences ───────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER preferences_updated_at
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
