/*
# Create blog_posts table

## Summary
Adds a blog_posts table so Data Pulse Social can publish educational articles
and insights directly on the site. Each post has a title, slug, excerpt,
full HTML content, cover image, category, tags, author info, reading time,
and a published flag. Four seed posts are inserted to populate the blog
on first load.

## New Tables
- `blog_posts`
  - id (uuid, primary key)
  - title (text) — post headline
  - slug (text, unique) — URL-safe identifier
  - excerpt (text) — short teaser shown on card
  - content (text) — full HTML body of the post
  - cover_image_url (text) — Pexels hero image
  - author_name (text) — display name of the author
  - author_role (text) — author's job title
  - author_avatar (text) — avatar image URL
  - category (text) — e.g. "Curriculum Design", "Learning Science"
  - tags (text[]) — keyword tags
  - read_time_minutes (integer) — estimated reading time
  - is_published (boolean, default false) — controls public visibility
  - published_at (timestamptz) — display date
  - sort_order (integer) — manual ordering

## Security
- RLS enabled on blog_posts.
- Public (anon + authenticated) can SELECT published posts.
- Only authenticated users can INSERT/UPDATE/DELETE.

## Notes
- No auth is required to read posts — uses anon role policy.
- content field stores HTML so the frontend can render with dangerouslySetInnerHTML.
- updated_at trigger reuses the existing update_updated_at_column() function.
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Data Pulse Social',
  author_role TEXT,
  author_avatar TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  read_time_minutes INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_public_read" ON blog_posts;
CREATE POLICY "blog_posts_public_read" ON blog_posts FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "blog_posts_authenticated_insert" ON blog_posts;
CREATE POLICY "blog_posts_authenticated_insert" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "blog_posts_authenticated_update" ON blog_posts;
CREATE POLICY "blog_posts_authenticated_update" ON blog_posts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "blog_posts_authenticated_delete" ON blog_posts;
CREATE POLICY "blog_posts_authenticated_delete" ON blog_posts FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed posts
INSERT INTO blog_posts (title, slug, excerpt, content, cover_image_url, author_name, author_role, author_avatar, category, tags, read_time_minutes, is_published, published_at, sort_order) VALUES
(
  '5 Principles of Effective Curriculum Design',
  '5-principles-effective-curriculum-design',
  'Great curriculum doesn''t happen by accident. Discover the five foundational principles that separate transformative learning programs from forgettable ones.',
  '<p>Curriculum design is equal parts art and science. After working with hundreds of educators and institutions, we''ve distilled the process down to five principles that consistently separate high-impact programs from mediocre ones.</p><h3>1. Start With the End in Mind</h3><p>Backward design—popularized by Grant Wiggins and Jay McTighe—means defining your desired outcomes before you write a single lesson. Ask: what should learners <em>know</em>, <em>do</em>, and <em>believe</em> by the end? Every module, activity, and assessment then becomes a direct vehicle toward those outcomes, eliminating the drift that plagues content-first approaches.</p><h3>2. Design for the Learner, Not the Subject</h3><p>Too many curricula are organized around disciplinary logic (chapters 1 through 10 mirror the textbook) rather than learner logic. Conduct a learner needs analysis before you write. What prior knowledge does your audience bring? What misconceptions will you have to dismantle? What motivates them? The answers reshape everything from sequencing to vocabulary choices.</p><h3>3. Align Every Element</h3><p>Constructive alignment means your objectives, instructional activities, and assessments are in tight agreement. If an objective says "analyze," your activities should involve analysis and your assessments should measure analytical ability—not recall. Misalignment is the single biggest predictor of poor learning outcomes.</p><h3>4. Build in Spaced Practice</h3><p>Cognitive science is clear: massed practice (cramming) produces short-term retention; spaced practice produces long-term transfer. Structure your curriculum so key concepts resurface at intervals—through spiral design, low-stakes retrieval quizzes, or cross-module projects—and you dramatically increase the chance that learning sticks beyond the final exam.</p><h3>5. Treat the Curriculum as a Living Document</h3><p>The best curricula have a built-in feedback loop. Collect data from assessments, learner surveys, and instructor observations. Schedule formal reviews annually. Industries change, research advances, and learner demographics shift—a curriculum that isn''t revised eventually becomes a liability rather than an asset.</p><p>Implementing these five principles won''t guarantee a perfect program, but it will give you a defensible, learner-centered foundation that you can refine over time. That''s how the best educational organizations in the world operate—and it''s exactly how we approach every project at Data Pulse Social.</p>',
  'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?w=900',
  'Data Pulse Social',
  'Curriculum Design Team',
  'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?w=80',
  'Curriculum Design',
  ARRAY['curriculum', 'instructional design', 'learning outcomes', 'backward design'],
  6,
  true,
  '2026-07-01T09:00:00Z',
  1
),
(
  'How Multimedia Learning Boosts Retention by Up to 40%',
  'multimedia-learning-boosts-retention',
  'Richard Mayer''s multimedia learning theory has been validated by decades of research. Here''s how to apply it to your course content to maximize knowledge retention.',
  '<p>In 1991, cognitive psychologist Richard Mayer proposed that people learn more effectively from words and pictures together than from words alone. Thirty-plus years of controlled studies have since confirmed his Cognitive Theory of Multimedia Learning—and the implications for course designers are profound.</p><h3>Why Dual-Channel Processing Works</h3><p>The human brain processes verbal and visual information through separate cognitive channels. When you present a concept with both a well-designed graphic and a concise narration, learners can build two complementary mental models and connect them. When you present text alone, only one channel is engaged. The dual-channel approach isn''t just "prettier"—it''s neurologically more efficient.</p><h3>The Coherence and Redundancy Principles</h3><p>More media isn''t always better. Mayer''s coherence principle warns against adding interesting-but-irrelevant visuals, music, or text. Every element that doesn''t serve the learning objective competes for limited working memory. The redundancy principle goes further: reading on-screen text aloud forces learners to split attention between the same information arriving through two channels simultaneously—reducing, not improving, retention.</p><h3>Practical Application in Course Design</h3><p>Here''s how we apply these findings at Data Pulse Social:</p><ul><li><strong>Replace bullet-heavy slides with explanatory diagrams.</strong> A process that takes eight bullets becomes a single annotated flowchart learners can scan, zoom, and reference later.</li><li><strong>Use narration to add context—not to repeat the slide.</strong> The slide shows the model; the narration explains why it matters and how to use it.</li><li><strong>Segment long videos into micro-modules under seven minutes.</strong> Working memory saturates quickly. Segmentation gives learners control and reduces cognitive overload.</li><li><strong>Add interactivity at decision points.</strong> A brief knowledge check or branching scenario every 10–12 minutes moves passive viewers into active processors.</li></ul><h3>The 40% Retention Claim</h3><p>Studies comparing text-only instruction to well-designed multimedia instruction consistently show retention gains in the 30–50% range on delayed post-tests. The key qualifier is "well-designed"—poorly executed multimedia (cluttered graphics, redundant narration, unnecessary animations) can actually perform worse than plain text. Good multimedia design is about reducing extraneous load, not adding visual interest.</p><p>If you''d like a review of your existing course materials against Mayer''s principles, our team would love to help. Reach out through the contact form below.</p>',
  'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?w=900',
  'Data Pulse Social',
  'Learning Science Team',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=80',
  'Learning Science',
  ARRAY['multimedia', 'cognitive science', 'retention', 'instructional design'],
  7,
  true,
  '2026-07-05T09:00:00Z',
  2
),
(
  'Aligning Assessments With Learning Objectives: A Practical Guide',
  'aligning-assessments-learning-objectives',
  'Assessments that don''t match your learning objectives create frustrated learners and meaningless data. Here''s a practical framework for getting alignment right every time.',
  '<p>Assessment misalignment is one of the most common—and most costly—mistakes in course design. An objective states that learners will "evaluate competing frameworks," but the quiz asks them to define terms. The test measures the wrong thing, the data is useless, and learners walk away feeling the course was unfair. Here''s how to prevent it.</p><h3>Bloom''s Taxonomy as Your Alignment Tool</h3><p>Bloom''s Taxonomy organizes cognitive tasks into six levels: Remember, Understand, Apply, Analyze, Evaluate, and Create. Its real power in assessment design is as a calibration instrument. Write your objective, identify its Bloom''s level, and then write an assessment task at that same level. The verb in the objective is usually your guide: "describe" sits at Understand; "construct" sits at Create.</p><h3>The Three Assessment Types and When to Use Each</h3><p>Not every assessment type is appropriate at every cognitive level:</p><ul><li><strong>Selected-response (MCQ, true/false)</strong> — efficient at measuring Remember and Understand, and can reach Apply and Analyze with well-crafted distractors and scenario stems. Rarely appropriate for Evaluate or Create.</li><li><strong>Constructed-response (short answer, essays)</strong> — well-suited for Apply through Evaluate. Requires a clear rubric to ensure reliability across graders.</li><li><strong>Performance tasks (projects, simulations, case studies)</strong> — the only reliable measure of Evaluate and Create, and of complex Apply. Time-intensive but irreplaceable for professional competency programs.</li></ul><h3>Writing an Alignment Matrix</h3><p>Before finalizing any assessment plan, build a two-column matrix: list every learning objective in the left column and its corresponding assessment item(s) in the right. Every objective should map to at least one assessment task. Any assessment task with no matching objective is either measuring something implicit (make it explicit) or is extraneous (cut it).</p><h3>Formative vs. Summative: Both Must Be Aligned</h3><p>Formative assessments—low-stakes checks that happen during learning—are often left out of alignment conversations. That''s a mistake. A formative quiz that measures recall while the objective targets application misleads learners about what they need to practice. Align formative tasks too; they''re your early-warning system and your learners'' rehearsal space.</p><p>Alignment is not a one-time event. As objectives evolve, revisit every associated assessment item. Our Assessment Design service includes a full alignment audit as a core deliverable—connect with us to learn more.</p>',
  'https://images.pexels.com/photos/5905545/pexels-photo-5905545.jpeg?w=900',
  'Data Pulse Social',
  'Assessment Design Team',
  'https://images.pexels.com/photos/3756155/pexels-photo-3756155.jpeg?w=80',
  'Assessment',
  ARRAY['assessment', 'Bloom''s taxonomy', 'learning objectives', 'alignment'],
  8,
  true,
  '2026-07-09T09:00:00Z',
  3
),
(
  'Building Scalable eLearning for Distributed Teams',
  'building-scalable-elearning-distributed-teams',
  'Remote and hybrid workforces have made scalable eLearning a strategic necessity. Here''s the architecture we use to build courses that work for 10 learners or 10,000.',
  '<p>When an organization grows from 50 employees to 500—or when a university moves a flagship course online—the instructional design requirements change fundamentally. Content that worked as a tight cohort experience breaks down at scale. Here''s the architecture we recommend for organizations that need to reach distributed learners reliably.</p><h3>Modular Design: The Foundation of Scalability</h3><p>Monolithic courses—one long narrative arc with embedded examples—are expensive to maintain and difficult to personalize. Modular design structures content as discrete units (typically 10–20 minutes each) that can be assembled, reassigned, updated, or retired independently. When a regulation changes or a process is updated, you replace one module rather than re-recording an entire course.</p><h3>LMS Selection and SCORM vs. xAPI</h3><p>Your choice of Learning Management System shapes what''s possible. For distributed teams, prioritize mobile responsiveness, offline capability, and robust reporting. On the technical standards side: SCORM 1.2 is the safe, universal choice for broad LMS compatibility; xAPI (Tin Can) adds the ability to track learning activities outside the LMS—simulations, informal learning, on-the-job tasks—which matters as learning increasingly happens in the flow of work.</p><h3>Localization and Accessibility From Day One</h3><p>At scale, you''re almost certainly serving learners who speak different languages or have different accessibility needs. Building in localization and accessibility after the fact is expensive and rarely done well. Our standard development process includes:</p><ul><li>Closed captions on all video content from the first draft.</li><li>Alt text for every image and diagram.</li><li>Color contrast ratios that meet WCAG 2.1 AA.</li><li>Text and transcript files structured for translation management systems.</li></ul><h3>Analytics That Actually Drive Decisions</h3><p>Scalable eLearning generates enormous amounts of data—completion rates, assessment scores, time-on-task, drop-off points. The temptation is to collect everything; the discipline is to define three to five key metrics before launch and build dashboards around them. Our preferred leading indicators are: module completion rate, assessment pass rate on first attempt, and post-training performance change (measured 30–90 days out). Completion rates alone tell you nothing about learning impact.</p><p>If you''re planning a distributed learning initiative and want to get the architecture right from the start, our consulting services team is ready to help you scope and plan.</p>',
  'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?w=900',
  'Data Pulse Social',
  'eLearning Strategy Team',
  'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?w=80',
  'eLearning',
  ARRAY['eLearning', 'LMS', 'remote learning', 'scalability', 'xAPI'],
  9,
  true,
  '2026-07-12T09:00:00Z',
  4
)
ON CONFLICT (slug) DO NOTHING;
