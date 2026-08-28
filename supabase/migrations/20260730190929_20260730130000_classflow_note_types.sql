/*
# ClassFlow — add note_type column and seed rubric/feedback-bank notes

1. Purpose
   The Notes view has three chips: "+ Lesson plan", "+ Rubric", "+ Feedback bank".
   Currently these are decorative. This migration adds a `note_type` column to
   `classflow_notes` so each note can be categorized, and seeds one rubric and
   one feedback-bank note so the Notes view has real content on first load.

2. Changes
   - ALTER TABLE classflow_notes: ADD COLUMN note_type text NOT NULL DEFAULT 'lesson'
     CHECK (note_type IN ('lesson', 'rubric', 'feedback'))
   - Seed one rubric note and one feedback-bank note.

3. Security
   No policy changes — existing anon+authenticated CRUD policies already cover
   the new column.
*/

ALTER TABLE classflow_notes
  ADD COLUMN IF NOT EXISTS note_type text NOT NULL DEFAULT 'lesson'
  CHECK (note_type IN ('lesson', 'rubric', 'feedback'));

-- Seed rubric note
INSERT INTO classflow_notes (title, body, note_type)
SELECT
  'Cellular Respiration — Short Answer Rubric',
  $rubric$Criteria & Points (10 total):

1. Identifies all stages (3 pts)
   - Glycolysis, pyruvate oxidation, Krebs cycle, ETC
   - 3 pts: all four named correctly
   - 2 pts: three named
   - 1 pt:  one to two named

2. Explains ATP location (4 pts)
   - Glycolysis (cytoplasm): 2 ATP
   - Krebs (mitochondrial matrix): 2 ATP (GTP)
   - ETC (inner membrane): ~28-34 ATP
   - Full 4 pts only if location AND yield are correct

3. Role of oxygen (3 pts)
   - Final electron acceptor in ETC (2 pts)
   - Explains why without it the chain stalls (1 pt)$rubric$,
  'rubric'
WHERE NOT EXISTS (SELECT 1 FROM classflow_notes WHERE note_type = 'rubric');

-- Seed feedback bank note
INSERT INTO classflow_notes (title, body, note_type)
SELECT
  'Feedback Bank — Common Comments',
  $feedback$Quick-insert comments (tap to add to a student's returned work):

Strengths:
- "Clear, well-structured answer — good use of terminology."
- "Strong diagram, correctly labeled each stage."
- "You explained the why, not just the what."

Growth areas:
- "Review where ATP is produced — check ETC vs glycolysis."
- "Add the specific enzyme name to strengthen your answer."
- "Connect the stage to its location in the cell."

Encouragement:
- "You're close — the concept is there, the detail needs tightening."
- "Great progress from last quiz — keep pushing on the mechanism."$feedback$,
  'feedback'
WHERE NOT EXISTS (SELECT 1 FROM classflow_notes WHERE note_type = 'feedback');
