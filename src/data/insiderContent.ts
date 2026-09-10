export interface InsiderPrompt {
  id: string;
  title: string;
  category: string;
  platform: string;
  promptText: string;
  useCase: string;
}

export const insiderPrompts: InsiderPrompt[] = [
  {
    id: 'social-search-caption',
    title: 'Social Search Optimized Instagram Caption',
    category: 'Caption Writing',
    platform: 'Instagram',
    promptText: `Act as a social search engine optimization specialist. Write a keyword-first Instagram caption for [business type/niche] solving [specific customer pain point]. Front-load the exact target query '[primary long-tail search phrase]' within the first 65 characters before the fold. Structure the body using conversational, natural language incorporating 3 secondary semantic keywords: [keyword 1], [keyword 2], and [keyword 3]. Ensure the post answers a direct user question, avoids hashtag blocks entirely, and closes with a question to generate comment velocity.`,
    useCase: 'Use this prompt when publishing feed posts or Reels designed to rank in Instagram\'s internal search ecosystem instead of relying on expiring hashtags.',
  },
  {
    id: 'b2b-document-carousel',
    title: 'B2B Educational Document Carousel',
    category: 'Content Creation',
    platform: 'LinkedIn',
    promptText: `Draft an 8-slide LinkedIn document carousel script breaking down [complex B2B topic/process] for [target job title]. Slide 1 must feature a contrarian hook and direct outcome promise under 10 words. Slides 2 through 7 must deliver one actionable step per slide using under 25 words each, structured as: bold subhead, practical action, and one concrete metric or example. Slide 8 must be a clean call to action directing readers to save the PDF. Provide exact slide text and layout design guidance.`,
    useCase: 'Use this prompt to generate high-dwell-time PDF carousels that drive profile views and document saves from decision-makers.',
  },
  {
    id: 'raw-lofi-storytelling',
    title: 'Raw Lo-Fi Storytelling Video Script',
    category: 'Content Creation',
    platform: 'TikTok',
    promptText: `Create a 45-second low-production storytelling script for TikTok about [founder or brand mistake/lesson] in [industry]. Frame the visual direction as an unpolished, handheld front-facing camera recording while doing [casual background activity, e.g., packing an order, walking to a client]. Open with a 3-second tension hook: '[provocative opening phrase]'. Write the script in natural spoken cadence with pauses, avoiding polished corporate phrases. Conclude with an open-ended prompt asking viewers how they handle [specific operational challenge].`,
    useCase: 'Use this prompt to shoot quick, unedited founder-led videos that cut through synthetic AI feeds with authentic narrative trust.',
  },
  {
    id: 'serialized-answer-engine',
    title: 'Serialized Answer-Engine Content Pillar',
    category: 'Strategy',
    platform: 'General',
    promptText: `Develop a 4-part serialized weekly social media content series for [business name/industry] focused on [core topic]. Optimize each episode to satisfy platform search intent and AI answer engines. For each of the 4 installments, provide: 1) a searchable question-based title matching '[target problem query]', 2) the primary format (Short-form video, Carousel, or Text), 3) the core educational takeaway in under 50 words, and 4) a recurring episodic hook phrase that encourages binge-consumption across episodes.`,
    useCase: 'Use this prompt when building an episodic content framework that turns sporadic views into a dedicated, recurring community.',
  },
  {
    id: 'thought-leadership-matrix',
    title: 'Long-Form Thought Leadership to Micro-Asset Matrix',
    category: 'Repurposing',
    platform: 'X/Twitter',
    promptText: `Take the core thesis from this source material: [paste key takeaways or article URL]. Repurpose it into a high-authority 6-post X thread. Post 1 must be a strong hook stating a counter-intuitive finding without using buzzwords. Posts 2 through 5 must detail four distinct frameworks or lessons with specific data points. Post 6 must summarize the takeaway into a single actionable principle and ask [target audience niche] for their perspective. Keep each post under 220 characters.`,
    useCase: 'Use this prompt when translating long-form case studies, interviews, or articles into punchy, scroll-stopping threads.',
  },
  {
    id: 'customer-intent-mining',
    title: 'Customer Intent & Social Query Mining',
    category: 'Audience Research',
    platform: 'General',
    promptText: `Analyze the perspective of [target customer persona] shopping for [product or service]. Generate 10 natural-language search queries they type directly into TikTok, Instagram, or YouTube search bars when seeking recommendations. Group them into three intent buckets: Problem Discovery, Alternative Comparison, and Purchase Validation. For each query, provide the exact wording used, the underlying hesitation or frustration, and one organic post concept that directly answers the question in the opening sentence.`,
    useCase: 'Use this prompt during monthly planning to uncover real user questions and build search-led organic content schedules.',
  },
];

export interface InsiderCategory {
  key: string;
  label: string;
  count: number;
  description: string;
  icon: string;
}

export const insiderCategories: InsiderCategory[] = [
  { key: 'calendar', label: 'Content Calendar', count: 8, description: 'Posts, topics & dates across platforms', icon: 'CalendarDays' },
  { key: 'prompts', label: 'AI Prompts', count: 6, description: 'Ready-to-use prompt text for marketing', icon: 'Sparkles' },
  { key: 'trends', label: 'Social Trends', count: 6, description: 'Trends & insights worth tracking', icon: 'TrendingUp' },
  { key: 'templates', label: 'Templates', count: 6, description: 'Caption, post & hook templates', icon: 'FileText' },
  { key: 'training', label: 'Strategy Training', count: 5, description: 'Articles, courses & learning links', icon: 'GraduationCap' },
  { key: 'optimization', label: 'Optimization Sessions', count: 1, description: 'Monthly review sessions', icon: 'Target' },
  { key: 'resources', label: 'Marketing Resources', count: 5, description: 'Guides, checklists & tool lists', icon: 'ClipboardCheck' },
];
