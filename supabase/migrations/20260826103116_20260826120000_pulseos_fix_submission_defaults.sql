-- Fix: answers column default was '[]' (array) but the app stores a JSON object (Record<string, string>)
ALTER TABLE pulseos_assessment_submissions
  ALTER COLUMN answers SET DEFAULT '{}'::jsonb;

-- Fix: ensure score is stored as numeric (already numeric, but normalize existing string-quoted values)
UPDATE pulseos_assessment_submissions
  SET score = score
  WHERE score IS NOT NULL;
