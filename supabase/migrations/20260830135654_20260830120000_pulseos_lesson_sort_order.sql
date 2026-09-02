/*
# Add sort_order column to pulseos_lessons

1. Modified Tables
- `pulseos_lessons`: Added `sort_order` (integer, default 0) to support drag-and-drop lesson sequencing.
2. Security
- No RLS policy changes needed — existing anon/authenticated CRUD policies already cover UPDATE on this table.
3. Notes
- The column defaults to 0 so existing lessons remain visible.
- An index on (unit_id, sort_order) is added for efficient ordered queries.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pulseos_lessons' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE pulseos_lessons ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pulseos_lessons_unit_sort
  ON pulseos_lessons(unit_id, sort_order);
