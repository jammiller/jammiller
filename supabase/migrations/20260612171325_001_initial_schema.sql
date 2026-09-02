-- Create services table for curriculum development services
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create courses table for course content
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER,
  objectives TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create course modules
CREATE TABLE course_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create testimonials table
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create contact inquiries table
CREATE TABLE contact_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_interest TEXT,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'closed')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- Create team members table
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services (public read, authenticated write)
CREATE POLICY "services_public_read" ON services FOR SELECT
  TO public USING (is_active = true);

CREATE POLICY "services_authenticated_write" ON services FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for courses (public read published, authenticated full access)
CREATE POLICY "courses_public_read" ON courses FOR SELECT
  TO public USING (is_published = true);

CREATE POLICY "courses_authenticated_all" ON courses FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for course_modules
CREATE POLICY "course_modules_public_read" ON course_modules FOR SELECT
  TO public USING (EXISTS (
    SELECT 1 FROM courses WHERE courses.id = course_modules.course_id AND courses.is_published = true
  ));

CREATE POLICY "course_modules_authenticated_all" ON course_modules FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for testimonials (public read featured, authenticated full access)
CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT
  TO public USING (is_featured = true);

CREATE POLICY "testimonials_authenticated_all" ON testimonials FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for contact inquiries (authenticated only - sensitive data)
CREATE POLICY "contact_inquiries_authenticated_all" ON contact_inquiries FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for newsletter_subscribers (authenticated only - sensitive data)
CREATE POLICY "newsletter_authenticated_all" ON newsletter_subscribers FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for team_members (public read active, authenticated full access)
CREATE POLICY "team_members_public_read" ON team_members FOR SELECT
  TO public USING (is_active = true);

CREATE POLICY "team_members_authenticated_all" ON team_members FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created ON contact_inquiries(created_at DESC);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- Insert default services
INSERT INTO services (title, description, icon, features, sort_order) VALUES
('Curriculum Development', 'Comprehensive curriculum frameworks aligned with educational standards, learning objectives, and institutional goals. From K-12 to higher education.', 'Layers', ARRAY['Standards alignment mapping', 'Scope and sequence design', 'Learning pathway architecture', 'Competency frameworks'], 1),
('Course Content Creation', 'Engaging, multimedia-rich course materials designed for maximum learner engagement and knowledge retention across all delivery formats.', 'FileText', ARRAY['Interactive lesson plans', 'Video and audio production', 'Interactive simulations', 'Hands-on activities'], 2),
('Assessment Design', 'Valid, reliable assessment instruments that measure learning outcomes and provide actionable data for continuous improvement.', 'Target', ARRAY['Formative assessments', 'Summative evaluations', 'Rubric development', 'Performance tasks'], 3),
('Training & Support', 'Professional development and implementation support to ensure successful adoption and sustained impact of your educational programs.', 'Users', ARRAY['Faculty workshops', 'Implementation guides', 'Ongoing consultation', 'Resource libraries'], 4);

-- Insert sample testimonials
INSERT INTO testimonials (quote, author_name, author_role, avatar_url, rating, is_featured, sort_order) VALUES
('Data Pulse Social transformed our entire nursing curriculum. Their attention to pedagogical detail and industry alignment was exceptional. Student outcomes improved by 40% in the first year.', 'Dr. Sarah Mitchell', 'Dean of Nursing, Western Medical College', 'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?w=150', 5, true, 1),
('The team''s ability to translate complex technical concepts into engaging learning experiences is remarkable. They''ve become our go-to partner for all curriculum development needs.', 'James Chen', 'Director of Learning, TechForward Inc.', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150', 5, true, 2),
('Working with Data Pulse was seamless. They understood our nonprofit constraints and delivered high-quality materials that expanded our reach to thousands of learners.', 'Maria Santos', 'Executive Director, Education Access Foundation', 'https://images.pexels.com/photos/3756155/pexels-photo-3756155.jpeg?w=150', 5, true, 3);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();