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

export interface InsiderTrend {
  id: string;
  title: string;
  platform: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  spottedDate: string;
  description: string;
  action: string;
}

export const insiderTrends: InsiderTrend[] = [
  {
    id: 'kinda-chic-reel',
    title: '"Kinda chic to..." reel format',
    platform: 'Instagram',
    type: 'Format',
    priority: 'High',
    spottedDate: 'Sep 9',
    description: 'Reframe mundane, unglamorous day-to-day business operations into relatable, stylish moments using the trending butter-yellow font template paired with Steve Lacy\'s track \'oh yeah?\'.',
    action: 'Film a Reel showing behind-the-scenes tasks (hand-packing boxes, doing inventory) with the overlay \'kinda chic to [unpolished small business habit]\' to humanize your brand.',
  },
  {
    id: 'different-hours-ghosting',
    title: '"Different Hours" ghosting twist hook',
    platform: 'TikTok',
    type: 'Format',
    priority: 'High',
    spottedDate: 'Sep 9',
    description: 'Hook viewers with tension and curiosity — start with a disappointing letdown or apology before revealing an exciting product launch or big order fulfillment.',
    action: 'Film casual B-roll of work in progress, overlay text like \'Sorry I\'ve been ghosting you, I was busy...\', then cut to your finished product, restock, or major client win.',
  },
  {
    id: 'reali-tea-raw',
    title: '"Reali-Tea" raw production style',
    platform: 'TikTok',
    type: 'Insight',
    priority: 'High',
    spottedDate: 'Sep 9',
    description: 'High-production marketing videos are losing organic reach to low-fidelity, unpolished, transparent storytelling that answers real buyer questions and builds trust.',
    action: 'Record a direct-to-camera, unscripted 30-second response to a customer question — no studio lighting — and share a real mistake or hurdle you solved.',
  },
  {
    id: 'social-search-optimization',
    title: 'Social Search Optimization (SSO)',
    platform: 'TikTok',
    type: 'Topic',
    priority: 'High',
    spottedDate: 'Sep 9',
    description: 'Users increasingly treat TikTok as a search engine, favoring keyword-rich educational clips with clear solutions over pure entertainment.',
    action: 'Make a \'3 mistakes when buying [your product]\' video and include your primary search phrase in the spoken audio, on-screen captions, and the first two lines of your caption.',
  },
  {
    id: 'b2b-document-carousels',
    title: 'B2B document carousels & data teardowns',
    platform: 'LinkedIn',
    type: 'Format',
    priority: 'Medium',
    spottedDate: 'Sep 9',
    description: 'Document-style PDF carousels outpace standard single-image posts by driving dwell time and giving people something saveable and reference-worthy.',
    action: 'Repurpose one client success story into a 5-slide PDF breakdown — problem, failed attempt, the unexpected fix, data proof, and one implementation tip.',
  },
  {
    id: 'realtime-commentary-threads',
    title: 'Real-time direct commentary threads',
    platform: 'X/Twitter',
    type: 'Topic',
    priority: 'Medium',
    spottedDate: 'Sep 9',
    description: 'Text-first platforms reward rapid, concise commentary and industry news breakdowns with zero production friction.',
    action: 'Post a tight 4-tweet thread breaking down a recent industry development with your take and one actionable takeaway for your audience.',
  },
];

export interface InsiderTraining {
  id: string;
  title: string;
  category: string;
  type: 'Course' | 'Guide' | 'Article';
  description: string;
  summary: string;
  link: string;
  linkLabel: string;
}

export const insiderTrainings: InsiderTraining[] = [
  {
    id: 'hubspot-social-cert',
    title: 'Social Media Marketing Certification Course',
    category: 'Strategy',
    type: 'Course',
    description: 'HubSpot Academy\'s free certification course covering foundational to advanced social media marketing and inbound strategy execution.',
    summary: 'This certification program guides marketers through building an effective inbound social media framework. It teaches practical methods for creating engaging social content, measuring campaign ROI, and managing digital communities across channels.',
    link: 'https://academy.hubspot.com/courses/social-media-marketing',
    linkLabel: 'Open link',
  },
  {
    id: 'social-strategy-2026',
    title: 'Social Media Strategy: Step-by-Step Guide [2026]',
    category: 'Strategy',
    type: 'Guide',
    description: 'An actionable guide providing a structured roadmap to design, execute, and scale modern social media marketing plans.',
    summary: 'A tactical walkthrough focused on establishing actionable marketing frameworks and driving audience engagement. It outlines step-by-step processes to structure brand positioning, optimize multi-network publishing schedules, and track core conversion goals.',
    link: 'https://blog.hubspot.com/marketing/social-media-strategy-guide',
    linkLabel: 'Open link',
  },
  {
    id: 'free-courses-certificates',
    title: 'Free Social Media Marketing Courses with Certificates - The Only Guide You Actually Need',
    category: 'Content Creation',
    type: 'Guide',
    description: 'A comprehensive 2026 tactical guide exploring social SEO, video formats, content repurposing workflows, and analytics.',
    summary: 'This resource breaks down current operational tactics including social SEO captioning, long-form video, and cross-platform repurposing. It demonstrates how to transition vanity metrics into bottom-line conversions and social commerce sales.',
    link: 'https://www.digitalmarketingcommunity.com/social-media-marketing-courses/',
    linkLabel: 'Open link',
  },
  {
    id: 'best-courses-2026',
    title: '6 Best Social Media Marketing Courses for 2026 (Free & Paid)',
    category: 'Other',
    type: 'Article',
    description: 'A curated review and breakdown of top-rated modern training programs for digital and social media marketing.',
    summary: 'A detailed evaluation of professional training curricula covering audience targeting, paid social campaigns, and multimedia marketing capstones. It highlights specific coursework incorporating AI workflows such as ChatGPT for content ideation and campaign performance analysis.',
    link: 'https://www.growthrocket.com/blog/best-social-media-marketing-courses',
    linkLabel: 'Open link',
  },
  {
    id: 'paid-ads-mastery',
    title: 'Social Media Marketing MASTERY 2026 + 9 Social Ad Platforms!',
    category: 'Paid Ads',
    type: 'Course',
    description: 'A deep-dive training course focused on paid advertising deployment, multi-platform media buying, and analytics.',
    summary: 'This masterclass provides comprehensive training on paid ad setups across major platforms including Meta, LinkedIn, TikTok, and Pinterest. Marketers learn audience segmentation, performance tracking, ad copy optimization, and budget allocation to maximize campaign ROAS.',
    link: 'https://www.udemy.com/course/social-media-marketing-mastery/',
    linkLabel: 'Open link',
  },
];

export interface InsiderOptimizationSession {
  id: string;
  title: string;
  format: string;
  status: string;
  date: string;
  agenda: string;
}

export const insiderOptimizationSessions: InsiderOptimizationSession[] = [
  {
    id: 'sept-optimization-review',
    title: 'September monthly optimization review',
    format: 'Video Call',
    status: 'Scheduled',
    date: 'September 27, 2026',
    agenda: 'Review last month\'s content performance, identify top formats, and plan October\'s calendar. Bring analytics screenshots.',
  },
];

export interface InsiderResource {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  link: string;
  linkLabel: string;
}

export const insiderResources: InsiderResource[] = [
  {
    id: 'best-marketing-tools-2026',
    title: 'Best Marketing Tools for Small Business in 2026: The Complete AI-Powered Toolkit',
    type: 'Guide',
    category: 'SEO',
    description: 'A comprehensive guide outlining free tools like Google Search Console, Google Keyword Planner, and GA4 alongside budget-friendly AI alternatives for small businesses.',
    link: 'https://blog.hubspot.com/marketing/best-marketing-tools',
    linkLabel: 'Open resource',
  },
  {
    id: 'free-marketing-tools-2026',
    title: '15+ Free Marketing Tools Available in 2026',
    type: 'Tool List',
    category: 'Content',
    description: 'Curated selection of zero-cost marketing applications covering content generation, design mockups, infographics, and email marketing for small teams.',
    link: 'https://blog.hubspot.com/marketing/free-marketing-tools',
    linkLabel: 'Open resource',
  },
  {
    id: 'free-html-email-templates',
    title: 'Free HTML Email Templates',
    type: 'Template',
    category: 'Email Marketing',
    description: 'A library of over 1,000 customizable, responsive HTML email templates designed for outreach campaigns, newsletters, and lead follow-ups.',
    link: 'https://www.mailmunch.com/blog/free-html-email-templates',
    linkLabel: 'Open resource',
  },
  {
    id: 'small-business-marketing-2026',
    title: 'Small Business Marketing In 2026: The Ultimate Guide',
    type: 'Guide',
    category: 'Strategy',
    description: 'Actionable strategic walkthrough providing small business owners with frameworks to define audiences and select high-ROI digital channels.',
    link: 'https://blog.hubspot.com/marketing/small-business-marketing',
    linkLabel: 'Open resource',
  },
  {
    id: '25-marketing-ideas-2026',
    title: '25 Small Business Marketing Ideas That Actually Work in 2026 (Most Are Free)',
    type: 'Article',
    category: 'Social Media',
    description: 'Offers practical organic growth tactics such as carousel content frameworks, lead magnet creation, and zero-cost daily engagement routines.',
    link: 'https://blog.hubspot.com/marketing/small-business-marketing-ideas',
    linkLabel: 'Open resource',
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
