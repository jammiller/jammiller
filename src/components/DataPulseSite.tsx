import { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Cpu,
  Layers,
  Mail,
  Menu,
  Phone,
  Sparkles,
  Check,
  Users,
  CalendarDays,
  Target,
  X,
  CheckCircle2,
  GraduationCap,
  ClipboardCheck,
  Zap,
  TrendingUp,
  Droplets,
  Zap as ZapIcon,
  Copy,
  CheckCheck,
  Search,
  FileText,
  Lightbulb,
  Repeat,
  Megaphone,
  Lock,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { About } from './About';
import { Blog } from './Blog';
import { FAQ } from './FAQ';
import { AuthModal } from './AuthModal';
import { useInsiderAccess } from '../hooks/useInsiderAccess';
import { insiderCategories, insiderTrainings, insiderOptimizationSessions, insiderResources, insiderCalendar } from '../data/insiderContent';
export function DataPulseSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whyActive, setWhyActive] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [promptSearch, setPromptSearch] = useState('');
  const [activePromptCategory, setActivePromptCategory] = useState('All');
  const [trendSearch, setTrendSearch] = useState('');
  const [activeTrendPlatform, setActiveTrendPlatform] = useState('All');

  const insider = useInsiderAccess();
  const { auth, prompts: dbPrompts, trends: dbTrends, templates: dbTemplates, contentLoading } = insider;

  const trendPlatforms = ['All', ...Array.from(new Set(dbTrends.map((t) => t.platform)))];
  const filteredTrends = dbTrends.filter((t) => {
    const matchesPlatform = activeTrendPlatform === 'All' || t.platform === activeTrendPlatform;
    const matchesSearch = trendSearch === '' ||
      t.title.toLowerCase().includes(trendSearch.toLowerCase()) ||
      t.type.toLowerCase().includes(trendSearch.toLowerCase()) ||
      (t.previewDescription || '').toLowerCase().includes(trendSearch.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const platformColors: Record<string, string> = {
    'Instagram': 'bg-pink-100 text-pink-700',
    'TikTok': 'bg-slate-900 text-white',
    'LinkedIn': 'bg-blue-100 text-blue-700',
    'X/Twitter': 'bg-slate-200 text-slate-700',
  };

  const priorityColors: Record<string, string> = {
    'High': 'bg-red-100 text-red-700',
    'Medium': 'bg-amber-100 text-amber-700',
    'Low': 'bg-emerald-100 text-emerald-700',
  };

  const trainingTypeColors: Record<string, string> = {
    'Course': 'bg-blue-100 text-blue-700',
    'Guide': 'bg-emerald-100 text-emerald-700',
    'Article': 'bg-amber-100 text-amber-700',
  };

  const sessionStatusColors: Record<string, string> = {
    'Scheduled': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-emerald-100 text-emerald-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };

  const resourceTypeColors: Record<string, string> = {
    'Guide': 'bg-blue-100 text-blue-700',
    'Tool List': 'bg-emerald-100 text-emerald-700',
    'Template': 'bg-amber-100 text-amber-700',
    'Article': 'bg-purple-100 text-purple-700',
  };

  const [templateSearch, setTemplateSearch] = useState('');
  const [activeTemplatePlatform, setActiveTemplatePlatform] = useState('All');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const templatePlatforms = ['All', ...Array.from(new Set(dbTemplates.map((t) => t.platform)))];
  const filteredTemplates = dbTemplates.filter((t) => {
    const matchesPlatform = activeTemplatePlatform === 'All' || t.platform === activeTemplatePlatform;
    const matchesSearch = templateSearch === '' ||
      t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.type.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.platform.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const templateTypeColors: Record<string, string> = {
    'Caption': 'bg-pink-100 text-pink-700',
    'Post Hook': 'bg-amber-100 text-amber-700',
    'Carousel': 'bg-blue-100 text-blue-700',
  };

  const copyTemplate = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const [calendarPlatform, setCalendarPlatform] = useState('All');
  const [calendarStatus, setCalendarStatus] = useState('All');

  const calendarPlatforms = ['All', ...Array.from(new Set(insiderCalendar.map((e) => e.platform)))];
  const calendarStatuses = ['All', ...Array.from(new Set(insiderCalendar.map((e) => e.status)))];
  const filteredCalendar = insiderCalendar.filter((e) => {
    const matchesPlatform = calendarPlatform === 'All' || e.platform === calendarPlatform;
    const matchesStatus = calendarStatus === 'All' || e.status === calendarStatus;
    return matchesPlatform && matchesStatus;
  });

  const calendarPlatformColors: Record<string, string> = {
    'Instagram': 'bg-pink-100 text-pink-700',
    'TikTok': 'bg-slate-900 text-white',
    'LinkedIn': 'bg-blue-100 text-blue-700',
    'YouTube': 'bg-red-100 text-red-700',
    'Blog': 'bg-emerald-100 text-emerald-700',
  };

  const calendarStatusColors: Record<string, string> = {
    'Scheduled': 'bg-blue-100 text-blue-700',
    'Drafting': 'bg-amber-100 text-amber-700',
    'Idea': 'bg-slate-200 text-slate-700',
    'Published': 'bg-emerald-100 text-emerald-700',
  };

  const promptCategories = ['All', ...Array.from(new Set(dbPrompts.map((p) => p.category)))];
  const filteredPrompts = dbPrompts.filter((p) => {
    const matchesCategory = activePromptCategory === 'All' || p.category === activePromptCategory;
    const matchesSearch = promptSearch === '' ||
      p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(promptSearch.toLowerCase()) ||
      p.platform.toLowerCase().includes(promptSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryIcons: Record<string, typeof Search> = {
    'Caption Writing': Megaphone,
    'Content Creation': FileText,
    'Strategy': Lightbulb,
    'Repurposing': Repeat,
    'Audience Research': Search,
  };

  const commandCenterIcons: Record<string, typeof Search> = {
    'CalendarDays': CalendarDays,
    'Sparkles': Sparkles,
    'TrendingUp': TrendingUp,
    'FileText': FileText,
    'GraduationCap': GraduationCap,
    'Target': Target,
    'ClipboardCheck': ClipboardCheck,
  };

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const stripeCheckoutUrl = 'https://buy.stripe.com/fZu14oe699z41dj8dAe3e08';

  const closeMenu = () => setMenuOpen(false);

  const whyItems = [
    { icon: Layers, title: 'UbD-driven structure', short: 'Stage 1, 2, 3', desc: 'Every unit is built with Stage 1, 2, and 3 structure to support real competency development.', detail: 'Start with outcomes, design assessments, then build learning experiences — in that order.' },
    { icon: Sparkles, title: 'Reduced cognitive overload', short: 'Less noise', desc: 'Streamlined content design that helps learners absorb, retain, and apply skills.', detail: 'We strip filler content so learners focus on what actually builds competency.' },
    { icon: Target, title: 'Assessment-driven outcomes', short: 'Real readiness', desc: 'Assessments that measure real workforce readiness, not just memorization.', detail: 'Performance tasks mirror real-world challenges — not multiple-choice trivia.' },
    { icon: Cpu, title: 'Technology-focused curriculum', short: 'Future-ready', desc: 'Curriculum built for advanced technology and machine-driven environments.', detail: 'From data literacy to ML concepts, our curriculum prepares learners for the tools shaping their field.' },
  ];

  const flowSteps = [
    { icon: Target, label: 'Define Competency', sub: 'What should learners do?', color: 'text-gold-400', border: 'border-gold-400/30' },
    { icon: ClipboardCheck, label: 'Design Evidence', sub: 'How will we prove it?', color: 'text-gold-400', border: 'border-gold-400/30' },
    { icon: GraduationCap, label: 'Build Learning', sub: 'How do we get there?', color: 'text-gold-400', border: 'border-gold-400/30' },
    { icon: CheckCircle2, label: 'Workforce Ready', sub: 'Real-world transfer', color: 'text-emerald-400', border: 'border-emerald-400/30' },
  ];

  const impactStats = [
    { icon: TrendingUp, value: 'Measurable', label: 'Learning Outcomes', sub: 'Every unit tied to a competency' },
    { icon: Sparkles, value: 'Streamlined', label: 'Cognitive Load', sub: 'No filler, no fluff' },
    { icon: Cpu, value: 'Future-Proof', label: 'Technology Focus', sub: 'Built for machine-driven roles' },
  ];

  return (
    <div className="bg-white text-navy-900">
      <AuthModal
        open={insider.authModalOpen}
        mode={insider.authMode}
        error={insider.authError}
        loading={insider.authLoading}
        onClose={() => insider.setAuthModalOpen(false)}
        onModeChange={insider.setAuthMode}
        onSignIn={insider.signIn}
        onSignUp={insider.signUp}
      />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" onClick={closeMenu} className="flex items-center gap-3" aria-label="DATAPULSE SOCIAL home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-navy-950">
              <Layers className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold tracking-[0.08em]">DATAPULSE SOCIAL</span>
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            <a href="#about" className="text-sm text-slate-300 transition-colors hover:text-white">About</a>
            <a href="#services" className="text-sm text-slate-300 transition-colors hover:text-white">Services</a>
            <a href="#insider" className="text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300">Insider</a>
            <a href="#blog" className="text-sm text-slate-300 transition-colors hover:text-white">Insights</a>
            {auth.user && auth.isMember ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gold-400"><UserCircle className="h-4 w-4" /> Member</span>
                <button onClick={insider.signOut} className="flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : auth.user ? (
              <div className="flex items-center gap-3">
                <a href={stripeCheckoutUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-navy-950 transition-colors hover:bg-gold-400">Activate membership</a>
                <button onClick={insider.signOut} className="flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => insider.openAuth('signin')} className="text-sm text-slate-300 transition-colors hover:text-white">Sign in</button>
            )}
            <a href="#contact" className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400">Let's Talk</a>
          </nav>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/10 px-4 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {['about', 'services', 'insider', 'blog', 'contact'].map((section) => (
                <a key={section} href={'#' + section} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium capitalize text-slate-200 hover:bg-white/10">
                  {section === 'blog' ? 'Insights' : section === 'contact' ? "Let's Talk" : section === 'insider' ? 'Insider' : section}
                </a>
              ))}
              {auth.user && auth.isMember ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-gold-400">
                  <UserCircle className="h-4 w-4" /> Member
                  <button onClick={insider.signOut} className="ml-auto text-slate-300 hover:text-white">Sign out</button>
                </div>
              ) : auth.user ? (
                <div className="flex items-center gap-2 px-3 py-3">
                  <a href={stripeCheckoutUrl} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-navy-950">Activate membership</a>
                  <button onClick={insider.signOut} className="text-xs text-slate-300 hover:text-white">Sign out</button>
                </div>
              ) : (
                <button onClick={() => { closeMenu(); insider.openAuth('signin'); }} className="rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-200 hover:bg-white/10">
                  Sign in
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="blueprint-overlay relative overflow-hidden bg-navy-950 text-white">
          <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
            <div>
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                <span className="pulse-line inline-block w-12" /> UbD-Engineered Learning Systems
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                We engineer learning systems that <span className="text-gold-400">build workforce competencies.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                We engineer UbD-driven learning systems that reduce cognitive overload and build workforce competencies for technology-driven environments.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                  Explore our curriculum systems <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#apps" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300">
                  Explore our tools
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-gold-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">The learning pulse</p>
                    <p className="mt-1 text-lg font-semibold">From idea to impact</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-navy-950"><Target className="h-5 w-5" /></div>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'UbD-driven design', desc: 'Stage 1, 2, and 3 structure that builds every unit toward real workforce competencies.' },
                    { label: 'Reduced cognitive overload', desc: 'Streamlined content design that helps learners absorb, retain, and apply skills.' },
                    { label: 'Assessment-driven outcomes', desc: 'Assessments that measure real workforce readiness — not just test scores.' },
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gold-400/50 text-xs font-bold text-gold-300">0{index + 1}</span>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-slate-100">{item.label}</span>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-400">Our approach</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">We don't create curriculum — we engineer structured learning infrastructure designed to develop workforce-ready talent.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="apps" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">Built by DATAPULSE SOCIAL</span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Tools for the work that matters.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">Use our focused tools when you need them, then return to the bigger picture.</p>
            </div>
            <div className="grid gap-6 max-w-3xl">
              <div className="group flex flex-col rounded-3xl border border-slate-200 bg-softgray p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-navy-400 hover:shadow-xl sm:p-9">
                <a href="/tremonix" className="text-left">
                  <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Droplets className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-navy-700 transition-transform group-hover:translate-x-1" /></div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Revenue leak diagnostic</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy-900">Tremonix</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">Find the revenue your business is losing to slow response times, insufficient follow-up, and abandoned leads. Backed by published research.</p>
                  <span className="mt-7 inline-block text-sm font-semibold text-navy-900">Open Tremonix</span>
                </a>
              </div>
              <div className="group flex flex-col rounded-3xl border border-slate-200 bg-softgray p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-navy-400 hover:shadow-xl sm:p-9">
                <a href="/voltecho" className="text-left">
                  <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700"><ZapIcon className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-navy-700 transition-transform group-hover:translate-x-1" /></div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Smart algorithm hub</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy-900">VoltEcho</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">A single hub housing smart algorithms for data entry automation, customer churn prediction, and inventory forecasting.</p>
                  <span className="mt-7 inline-block text-sm font-semibold text-navy-900">Open VoltEcho</span>
                </a>
              </div>
              <div className="group flex flex-col rounded-3xl border border-slate-200 bg-softgray p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-navy-400 hover:shadow-xl sm:p-9">
                <a href="https://pulseosplatform.com" target="_blank" rel="noopener noreferrer" className="text-left">
                  <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-100 text-navy-900"><GraduationCap className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-navy-700 transition-transform group-hover:translate-x-1" /></div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">UbD learning platform</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy-900">Pulse OS Platform</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">Build, deliver, and assess competency-driven units with the UbD-aligned learning platform — unit builder, assessment engine, and analytics dashboard in one place.</p>
                  <span className="mt-7 inline-block text-sm font-semibold text-navy-900">Open Pulse OS</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="insider" className="relative overflow-hidden bg-softgray py-24">
          <div className="absolute -right-40 top-16 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <Users className="h-3.5 w-3.5 text-gold-700" /> DATAPULSE SOCIAL INSIDER
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Your monthly advantage for smarter marketing.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Join a focused community for practical marketing direction, fresh ideas, and the resources to turn strategy into consistent action.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-stretch">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Included every month</p>
                    <h3 className="mt-2 text-2xl font-bold text-navy-900">Built to keep you moving.</h3>
                  </div>
                  <CalendarDays className="h-7 w-7 flex-shrink-0 text-gold-600" />
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {[
                    'Monthly content calendar',
                    'New AI prompts',
                    'Social trends',
                    'Templates',
                    'Strategy training',
                    'Monthly optimization session',
                    'Marketing resources',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3.5 w-3.5" /></span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl bg-navy-950 p-7 text-white shadow-xl sm:p-9">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Insider membership</p>
                  <h3 className="mt-3 text-2xl font-bold">Get inside the group.</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">A monthly membership for people who want a clearer plan, better content, and a community that keeps strategy practical.</p>
                </div>
                <div className="mt-8">
                  <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3.5 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">Join the Insider group <ArrowRight className="h-4 w-4" /></a>
                  <p className="mt-3 text-center text-xs text-slate-400">Secure checkout via Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <Sparkles className="h-3.5 w-3.5 text-gold-700" /> MARKETING COMMAND CENTER
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Your monthly home for marketing content.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Content planning, AI prompts, trends, templates, training, optimization sessions, and resources — all in one place.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">Get the Monthly Plan — $49</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {insiderCategories.map((cat) => {
                const Icon = commandCenterIcons[cat.icon] || FileText;
                return (
                  <div key={cat.key} className="group rounded-2xl border border-slate-200 bg-softgray p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-2xl font-bold text-slate-300">{cat.count}</span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-navy-900">{cat.label}</h3>
                    <p className="mt-1 text-sm text-slate-600">{cat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-softgray py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <Sparkles className="h-3.5 w-3.5 text-gold-700" /> INSIDER PROMPT LIBRARY
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Ready-to-use AI prompts.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Copy and paste these into ChatGPT, Claude, or any AI tool. Each prompt is tuned for a specific platform and marketing goal.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  placeholder="Search prompts by title, category, or platform..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-navy-900 placeholder-slate-400 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {promptCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivePromptCategory(cat)}
                  className={'rounded-full px-4 py-2 text-xs font-semibold transition-all ' + (
                    activePromptCategory === cat
                      ? 'bg-navy-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {filteredPrompts.map((prompt) => {
                const Icon = categoryIcons[prompt.category] || FileText;
                return (
                  <div key={prompt.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg sm:p-7">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-navy-900">{prompt.title}</h3>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{prompt.category}</span>
                            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{prompt.platform}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {prompt.promptText ? (
                      <>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-softgray p-4">
                          <p className="text-sm leading-relaxed text-slate-700">{prompt.promptText}</p>
                        </div>

                        <div className="mt-4 rounded-lg bg-gold-50 px-4 py-3">
                          <p className="text-xs leading-relaxed text-slate-600">
                            <span className="font-semibold text-gold-700">When to use: </span>
                            {prompt.useCase}
                          </p>
                        </div>

                        <button
                          onClick={() => copyPrompt(prompt.id, prompt.promptText!)}
                          className={'mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ' + (
                            copiedPrompt === prompt.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-navy-900 text-white hover:bg-navy-800'
                          )}
                        >
                          {copiedPrompt === prompt.id ? (
                            <><CheckCheck className="h-4 w-4" /> Copied!</>
                          ) : (
                            <><Copy className="h-4 w-4" /> Copy prompt</>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-softgray p-4">
                          <p className="text-sm leading-relaxed text-slate-700">{prompt.previewText}...</p>
                          <div className="mt-3 select-none blur-sm pointer-events-none">
                            <p className="text-sm leading-relaxed text-slate-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy-50 px-4 py-3">
                          <Lock className="h-4 w-4 text-navy-600" />
                          <p className="text-xs font-semibold text-navy-700">Full prompt locked</p>
                        </div>
                        {auth.user ? (
                          <a href={stripeCheckoutUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400">
                            Activate membership <ArrowRight className="h-4 w-4" />
                          </a>
                        ) : (
                          <button onClick={() => insider.openAuth('signup')} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-navy-800">
                            <Lock className="h-4 w-4" /> Sign up to unlock
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {contentLoading && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">Loading prompts...</p>
              </div>
            )}
            {!contentLoading && filteredPrompts.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">No prompts match your search. Try a different keyword.</p>
              </div>
            )}

            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">New prompts added every month as part of your Insider membership.</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <TrendingUp className="h-3.5 w-3.5 text-gold-700" /> SOCIAL TRENDS
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Trends and insights worth acting on.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Track what's working right now across platforms — with a concrete action you can take today.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={trendSearch}
                  onChange={(e) => setTrendSearch(e.target.value)}
                  placeholder="Search trends by title, type, or keyword..."
                  className="w-full rounded-xl border border-slate-200 bg-softgray py-3.5 pl-12 pr-4 text-sm text-navy-900 placeholder-slate-400 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {trendPlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setActiveTrendPlatform(platform)}
                  className={'rounded-full px-4 py-2 text-xs font-semibold transition-all ' + (
                    activeTrendPlatform === platform
                      ? 'bg-navy-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {platform}
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {filteredTrends.map((trend) => (
                <div key={trend.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-softgray p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <TrendingUp className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{trend.title}</h3>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (platformColors[trend.platform] || 'bg-slate-200 text-slate-700')}>{trend.platform}</span>
                          <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{trend.type}</span>
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (priorityColors[trend.priority] || 'bg-slate-200 text-slate-700')}>{trend.priority}</span>
                        </div>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium text-slate-400">Spotted {trend.spottedDate}</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-slate-700">{trend.description || trend.previewDescription}</p>
                    {!trend.description && (
                      <div className="mt-2 select-none blur-sm pointer-events-none">
                        <p className="text-sm leading-relaxed text-slate-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                      </div>
                    )}
                  </div>

                  {trend.action ? (
                    <div className="mt-4 rounded-lg bg-gold-50 px-4 py-3">
                      <p className="text-xs leading-relaxed text-slate-600">
                        <span className="font-semibold text-gold-700">Action: </span>
                        {trend.action}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy-50 px-4 py-3">
                      <Lock className="h-4 w-4 text-navy-600" />
                      <p className="text-xs font-semibold text-navy-700">Action plan locked</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {contentLoading && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">Loading trends...</p>
              </div>
            )}
            {!contentLoading && filteredTrends.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">No trends match your search. Try a different keyword.</p>
              </div>
            )}

            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">New trends spotted and added every month as part of your Insider membership.</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-softgray py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <GraduationCap className="h-3.5 w-3.5 text-gold-700" /> STRATEGY TRAINING
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Level up your marketing strategy.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Curated articles, courses, and links to sharpen your skills and stay ahead of what's working now.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {insiderTrainings.map((training) => (
                <div key={training.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{training.title}</h3>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{training.category}</span>
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (trainingTypeColors[training.type] || 'bg-slate-200 text-slate-700')}>{training.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium leading-relaxed text-slate-700">{training.description}</p>
                  </div>

                  <div className="mt-3 rounded-lg bg-softgray px-4 py-3">
                    <p className="text-xs leading-relaxed text-slate-600">{training.summary}</p>
                  </div>

                  <a href={training.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-navy-800">
                    {training.linkLabel} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">New training resources added every month as part of your Insider membership.</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <Target className="h-3.5 w-3.5 text-gold-700" /> OPTIMIZATION SESSIONS
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Monthly review sessions.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Schedule recurring review sessions — track date, format, link, and agenda.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {insiderOptimizationSessions.map((session) => (
                <div key={session.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-softgray p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <Target className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{session.title}</h3>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{session.format}</span>
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (sessionStatusColors[session.status] || 'bg-slate-200 text-slate-700')}>{session.status}</span>
                        </div>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium text-slate-400">{session.date}</span>
                  </div>

                  <div className="mt-4 rounded-lg bg-gold-50 px-4 py-3">
                    <p className="text-xs leading-relaxed text-slate-600">
                      <span className="font-semibold text-gold-700">Agenda: </span>
                      {session.agenda}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">Optimization sessions are included with your monthly Insider membership.</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-softgray py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <ClipboardCheck className="h-3.5 w-3.5 text-gold-700" /> MARKETING RESOURCES
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Your reference library.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Guides, checklists, tool lists, and swipe files — everything you need to execute with confidence.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {insiderResources.map((resource) => (
                <div key={resource.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <ClipboardCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{resource.title}</h3>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (resourceTypeColors[resource.type] || 'bg-slate-200 text-slate-700')}>{resource.type}</span>
                          <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{resource.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-slate-700">{resource.description}</p>
                  </div>

                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-navy-800">
                    {resource.linkLabel} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">New resources added every month as part of your Insider membership.</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <FileText className="h-3.5 w-3.5 text-gold-700" /> TEMPLATES
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Caption, post & hook templates.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Copy and paste these templates for captions, hooks, and carousels across every platform.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search templates by title, type, or platform..."
                  className="w-full rounded-xl border border-slate-200 bg-softgray py-3.5 pl-12 pr-4 text-sm text-navy-900 placeholder-slate-400 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {templatePlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setActiveTemplatePlatform(platform)}
                  className={'rounded-full px-4 py-2 text-xs font-semibold transition-all ' + (
                    activeTemplatePlatform === platform
                      ? 'bg-navy-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {platform}
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-softgray p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{template.title}</h3>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (templateTypeColors[template.type] || 'bg-slate-200 text-slate-700')}>{template.type}</span>
                          <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{template.platform}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {template.templateText ? (
                    <>
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{template.templateText}</p>
                      </div>

                      <div className="mt-4 rounded-lg bg-gold-50 px-4 py-3">
                        <p className="text-xs leading-relaxed text-slate-600">
                          <span className="font-semibold text-gold-700">When to use: </span>
                          {template.useCase}
                        </p>
                      </div>

                      <button
                        onClick={() => copyTemplate(template.id, template.templateText!)}
                        className={'mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ' + (
                          copiedTemplate === template.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-navy-900 text-white hover:bg-navy-800'
                        )}
                      >
                        {copiedTemplate === template.id ? (
                          <><CheckCheck className="h-4 w-4" /> Copied!</>
                        ) : (
                          <><Copy className="h-4 w-4" /> Copy template</>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm leading-relaxed text-slate-700">{template.previewText}...</p>
                        <div className="mt-3 select-none blur-sm pointer-events-none">
                          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy-50 px-4 py-3">
                        <Lock className="h-4 w-4 text-navy-600" />
                        <p className="text-xs font-semibold text-navy-700">Full template locked</p>
                      </div>
                      {auth.user ? (
                        <a href={stripeCheckoutUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400">
                          Activate membership <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <button onClick={() => insider.openAuth('signup')} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-navy-800">
                          <Lock className="h-4 w-4" /> Sign up to unlock
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {contentLoading && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">Loading templates...</p>
              </div>
            )}
            {!contentLoading && filteredTemplates.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">No templates match your search. Try a different keyword.</p>
              </div>
            )}

            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">New templates added every month as part of your Insider membership.</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
                <CalendarDays className="h-3.5 w-3.5 text-gold-700" /> CONTENT CALENDAR
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Posts, topics & dates across platforms.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Plan and track what's publishing next — filter by platform or status to see what's scheduled, in progress, or still an idea.
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="flex flex-wrap justify-center gap-2">
                {calendarPlatforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setCalendarPlatform(platform)}
                    className={'rounded-full px-4 py-2 text-xs font-semibold transition-all ' + (
                      calendarPlatform === platform
                        ? 'bg-navy-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {platform}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {calendarStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setCalendarStatus(status)}
                    className={'rounded-full px-4 py-2 text-xs font-semibold transition-all ' + (
                      calendarStatus === status
                        ? 'bg-gold-500 text-navy-950 shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {filteredCalendar.map((entry) => (
                <div key={entry.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-softgray p-6 transition-all duration-300 hover:border-gold-300 hover:shadow-lg sm:p-7">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <CalendarDays className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{entry.title}</h3>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (calendarPlatformColors[entry.platform] || 'bg-slate-200 text-slate-700')}>{entry.platform}</span>
                          <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (calendarStatusColors[entry.status] || 'bg-slate-200 text-slate-700')}>{entry.status}</span>
                        </div>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium text-slate-400">{entry.date}</span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{entry.topic}</p>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm leading-relaxed text-slate-700">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredCalendar.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">No entries match your filters. Try a different platform or status.</p>
              </div>
            )}

            <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">The monthly content calendar is updated every month as part of your Insider membership.</p>
              <a href="https://buy.stripe.com/fZu14oe699z41dj8dAe3e08" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">
                Join the Insider group <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <About />

        <section id="why" className="relative overflow-hidden bg-navy-950 py-24 text-white">
          <div className="absolute inset-0 bg-grid-dark bg-grid opacity-20" />
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">Why DATAPULSE SOCIAL</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Because great learning doesn't happen by accident.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-300">Hover or tap each principle to see how it works in practice</p>
            </div>

            {/* Interactive principle cards */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {whyItems.map((item, i) => (
                <button
                  key={item.title}
                  onClick={() => setWhyActive(i)}
                  onMouseEnter={() => setWhyActive(i)}
                  className={'group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500 ' + (
                    whyActive === i
                      ? 'border-gold-400/50 bg-white/[0.08] shadow-xl'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  )}
                >
                  <div className={'absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl transition-all duration-500 ' + (
                    whyActive === i ? 'bg-gold-500/20 scale-150' : 'bg-gold-500/5'
                  )} />
                  <div className="relative z-10">
                    <div className={'mb-5 flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 ' + (
                      whyActive === i
                        ? 'border-gold-400/50 bg-gold-500 text-navy-950 scale-110'
                        : 'border-white/15 bg-white/5 text-gold-400'
                    )}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold tracking-tight text-white">{item.title}</h3>
                    <p className={'mt-2 text-sm leading-relaxed transition-all duration-300 ' + (
                      whyActive === i ? 'text-slate-200' : 'text-slate-400'
                    )}>
                      {whyActive === i ? item.detail : item.desc}
                    </p>
                    <div className={'mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-300 ' + (
                      whyActive === i
                        ? 'bg-gold-500/20 text-gold-300'
                        : 'bg-white/5 text-slate-500'
                    )}>
                      <Zap className="h-3 w-3" /> {item.short}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Visual flow diagram */}
            <div className="mt-16">
              <div className="text-center mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">The Flow</span>
                <h3 className="mt-2 text-xl font-bold tracking-tight">From Competency to Workforce Ready</h3>
              </div>
              <div className="flex flex-col items-center gap-3 lg:flex-row lg:justify-center lg:gap-0">
                {flowSteps.map((step, i, arr) => (
                  <div key={step.label} className="flex items-center gap-3 lg:gap-0">
                    <div className={'flex flex-col items-center rounded-2xl border ' + step.border + ' bg-white/[0.05] px-6 py-5 text-center transition-all duration-300 hover:bg-white/[0.08] hover:scale-105'}>
                      <step.icon className={'h-7 w-7 mb-2 ' + step.color} />
                      <p className="text-sm font-bold text-white">{step.label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{step.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex items-center px-2">
                        <div className="hidden h-px w-8 bg-gold-400/30 lg:block" />
                        <ArrowRight className="h-5 w-5 text-gold-400/50 lg:rotate-0 rotate-90" />
                        <div className="hidden h-px w-8 bg-gold-400/30 lg:block" />
                      </div>
                    )}
                    {i === arr.length - 1 && (
                      <div className="hidden lg:block w-12" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Impact bar */}
            <div className="mt-14 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
              {impactStats.map((stat) => (
                <div key={stat.label} className="group rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-center transition-all duration-300 hover:border-gold-400/30 hover:bg-white/[0.08]">
                  <stat.icon className="mx-auto mb-2 h-6 w-6 text-gold-400" />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-300">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Blog />
        <FAQ />

        <section id="contact" className="blueprint-overlay relative overflow-hidden bg-navy-950 py-20 text-white">
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Start a conversation</p>
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Have a learning challenge? Let's build the way forward.</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-300">Tell us what you're working toward and we'll help you find the clearest next step.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href="https://calendar.app.google.com/8otEDsChvouw51aaA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"><Calendar className="h-4 w-4" /> Book a call</a>
              <a href="tel:8508309910" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300"><Phone className="h-4 w-4" /> 850-830-9910</a>
              <a href="mailto:info@datapulsesocial.com" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300"><Mail className="h-4 w-4" /> Email us</a>
              <a href="mailto:todd@datapulsesocial.com" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300"><Mail className="h-4 w-4" /> Todd Crawford</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy-950 px-4 py-8 text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-xs">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/tremonix" className="font-semibold text-slate-300 hover:text-gold-400">Tremonix</a>
            <a href="/voltecho" className="font-semibold text-slate-300 hover:text-gold-400">VoltEcho</a>
            <a href="https://pulseosplatform.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-300 hover:text-gold-400">Pulse OS Platform</a>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} DATAPULSE SOCIAL. Built for better learning.</p>
            <div className="flex gap-4"><a href="#about" className="hover:text-white">About</a><a href="#contact" className="hover:text-white">Contact</a><a href="mailto:info@datapulsesocial.com" className="hover:text-white">info@datapulsesocial.com</a><a href="mailto:todd@datapulsesocial.com" className="hover:text-white">todd@datapulsesocial.com</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
