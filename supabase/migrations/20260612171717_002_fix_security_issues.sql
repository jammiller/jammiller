-- Fix 1: Set secure search_path on the function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix 2: Drop overly permissive authenticated policies
DROP POLICY IF EXISTS services_authenticated_write ON services;
DROP POLICY IF EXISTS courses_authenticated_all ON courses;
DROP POLICY IF EXISTS course_modules_authenticated_all ON course_modules;
DROP POLICY IF EXISTS testimonials_authenticated_all ON testimonials;
DROP POLICY IF EXISTS contact_inquiries_authenticated_all ON contact_inquiries;
DROP POLICY IF EXISTS newsletter_authenticated_all ON newsletter_subscribers;
DROP POLICY IF EXISTS team_members_authenticated_all ON team_members;

-- Fix 3: Add proper INSERT policies for public forms
-- Contact inquiries: anyone can submit, but no read access for public
CREATE POLICY "contact_inquiries_public_insert" ON contact_inquiries FOR INSERT
  TO public WITH CHECK (true);

-- Newsletter: anyone can subscribe, but no read access for public
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT
  TO public WITH CHECK (true);

-- Note: Admin operations (SELECT/UPDATE/DELETE on contact_inquiries, newsletter_subscribers,
-- and full CRUD on services, courses, testimonials, team_members) are handled via
-- service role which bypasses RLS. This is the intended pattern for admin dashboards.