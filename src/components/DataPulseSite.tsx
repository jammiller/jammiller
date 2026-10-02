import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  GraduationCap,
  Layers,
  Menu,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { SocialGrowthAssessment } from './SocialGrowthAssessment';

const strategyCallUrl = 'https://calendar.app.google.com/8otEDsChvouw51aaA';
const membershipCheckoutUrl = 'https://buy.stripe.com/fZu14oe699z41dj8dAe3e08';

const offers = [
  {
    title: 'Social Growth',
    icon: TrendingUp,
    description: 'A practical strategy and content system that earns attention and turns it into demand.',
    points: ['Positioning and audience clarity', 'Content strategy and production', 'Conversion-focused optimization'],
  },
  {
    title: 'Course Build',
    icon: GraduationCap,
    description: 'A clear learning experience that turns your expertise into a course people want to complete and buy.',
    points: ['Curriculum and learning journey design', 'Lessons, scripts, and course assets', 'Assessments and launch support'],
  },
];

const plans = [
  { name: 'Social Management', price: 'Custom scope', description: 'Ongoing strategy, content, and optimization for brands ready to grow consistently.', cta: 'Book a Strategy Call', href: strategyCallUrl, features: ['Social strategy', 'Content planning', 'Performance optimization'] },
  { name: 'Course Build', price: 'Custom scope', description: 'Design and build a course around your expertise, audience, and launch goals.', cta: 'View Course Packages', href: '#courses', features: ['Course strategy', 'Curriculum design', 'Build and launch support'] },
  { name: 'Membership', price: '$49/month', description: 'A monthly home for practical marketing direction, templates, and accountability.', cta: 'Join Membership', href: membershipCheckoutUrl, features: ['Monthly content calendar', 'Prompts and templates', 'Strategy training'] },
  { name: 'Custom / Hybrid', price: 'Custom scope', description: 'A combined social and course engagement built around the system you need.', cta: 'Book a Strategy Call', href: strategyCallUrl, features: ['Social + course roadmap', 'Flexible delivery', 'One strategic partner'] },
];

export function DataPulseSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const nav = [
    ['About', '#about'],
    ['Services', '#services'],
    ['Courses', '#courses'],
    ['Pricing', '#pricing'],
    ['Membership', '#membership'],
    ["Let's Talk", '#contact'],
  ];

  return (
    <div className="bg-white text-navy-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="DATAPULSE SOCIAL home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-navy-950"><Layers className="h-5 w-5" /></span>
            <span className="text-sm font-bold tracking-[0.08em]">DATAPULSE SOCIAL</span>
          </a>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            {nav.slice(0, -1).map(([label, href]) => <a key={href} href={href} className="text-sm text-slate-300 transition-colors hover:text-white">{label}</a>)}
            <a href="#contact" className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400">Let&apos;s Talk</a>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && <nav className="border-t border-white/10 px-4 py-3 md:hidden" aria-label="Mobile navigation"><div className="mx-auto flex max-w-7xl flex-col gap-1">{nav.map(([label, href]) => <a key={href} href={href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/10">{label}</a>)}</div></nav>}
      </header>

      <main id="top">
        <section className="blueprint-overlay relative overflow-hidden bg-navy-950 text-white">
          <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8">
            <div>
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Social + Course Growth Partner</p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">We help experts grow online and turn knowledge into <span className="text-gold-400">paid courses.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">From social strategy to course design, we build the system that attracts, nurtures, and converts.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href={strategyCallUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400">Book a Strategy Call <ArrowRight className="h-4 w-4" /></a>
                <a href="#courses" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300">View Course Packages</a>
              </div>
            </div>
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">One connected system</p>
              <div className="mt-7 space-y-5">{['Clarify your expertise and offer', 'Build content that attracts the right people', 'Turn attention into a learning experience that sells'].map((step, index) => <div key={step} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-400/50 text-xs font-bold text-gold-300">0{index + 1}</span><p className="pt-1 text-sm font-semibold text-slate-100">{step}</p></div>)}</div>
              <div className="mt-8 rounded-2xl bg-white/10 p-4 text-sm leading-relaxed text-slate-300">Social growth brings the right audience in. Course design gives them a clear next step.</div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-white py-20 sm:py-24"><div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">About DATAPULSE SOCIAL</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Growth is more useful when it leads somewhere.</h2><p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">We partner with experts who need more than posts or a course outline. We connect the strategy, content, and learning experience that moves an audience from discovery to purchase.</p></div></section>

        <section id="services" className="bg-softgray py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">What we do</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Two offers. One path to sustainable growth.</h2></div><div className="mt-10 grid gap-6 md:grid-cols-2">{offers.map((offer) => <article key={offer.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><offer.icon className="h-7 w-7 text-gold-700" /><h3 className="mt-5 text-2xl font-bold">{offer.title}</h3><p className="mt-3 leading-relaxed text-slate-600">{offer.description}</p><ul className="mt-6 space-y-3">{offer.points.map((point) => <li key={point} className="flex gap-3 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />{point}</li>)}</ul></article>)}</div></div></section>

        <section id="courses" className="bg-white py-20 sm:py-24"><div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Course packages</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Build the course your expertise deserves.</h2><p className="mt-5 leading-relaxed text-slate-600">Whether you are starting with a body of knowledge or refreshing an existing program, we shape the learner journey and the assets that bring it to life.</p><a href={strategyCallUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-navy-950 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800">Book a Strategy Call <ArrowRight className="h-4 w-4" /></a></div><div className="grid gap-4 sm:grid-cols-2">{['Course strategy and offer design', 'Curriculum and lesson architecture', 'Content, scripts, and learning assets', 'Assessment, accessibility, and launch support'].map((item, index) => <div key={item} className="rounded-2xl border border-gold-200 bg-gold-50 p-5"><span className="text-sm font-bold text-gold-700">0{index + 1}</span><p className="mt-4 font-semibold text-navy-900">{item}</p></div>)}</div></div></section>

        <section className="bg-navy-950 py-16 text-white"><div className="mx-auto grid max-w-6xl gap-6 px-4 text-center sm:grid-cols-3 sm:px-6 lg:px-8">{[['Clearer', 'Offer positioning'], ['Connected', 'Audience-to-course journey'], ['Practical', 'Strategy and execution']].map(([value, label]) => <div key={label}><p className="text-3xl font-bold text-gold-400">{value}</p><p className="mt-2 text-sm text-slate-300">{label}</p></div>)}</div></section>

        <section id="pricing" className="bg-softgray py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Pricing</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Choose the support that fits your next stage.</h2><p className="mt-4 text-slate-600">Membership pricing is fixed. Service engagements are scoped to your goals, audience, and delivery needs.</p></div><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{plans.map((plan) => <article key={plan.name} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-bold">{plan.name}</h3><p className="mt-4 text-2xl font-bold text-gold-700">{plan.price}</p><p className="mt-4 min-h-20 text-sm leading-relaxed text-slate-600">{plan.description}</p><ul className="mt-6 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-slate-700"><Check className="h-4 w-4 shrink-0 text-gold-700" />{feature}</li>)}</ul><a href={plan.href} target={plan.href.startsWith('http') ? '_blank' : undefined} rel={plan.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="mt-7 inline-flex justify-center rounded-xl bg-navy-950 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800">{plan.cta}</a></article>)}</div></div></section>

        <section id="membership" className="bg-white py-20 sm:py-24"><div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Membership</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Practical direction for your next month of growth.</h2><p className="mt-5 leading-relaxed text-slate-600">Get content planning, prompts, templates, training, and optimization support without adding more noise to your calendar.</p></div><div className="rounded-3xl bg-navy-950 p-7 text-white"><Users className="h-7 w-7 text-gold-400" /><p className="mt-5 text-3xl font-bold">$49<span className="text-base font-medium text-slate-400">/month</span></p><p className="mt-2 text-sm text-slate-300">Membership includes ongoing marketing resources and strategy support.</p><a href={membershipCheckoutUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full justify-center rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400">Join Membership</a></div></div></section>

        <section id="assessment" className="bg-softgray py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto mb-10 max-w-3xl text-center"><BarChart3 className="mx-auto h-6 w-6 text-gold-700" /><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Start with a social growth assessment.</h2><p className="mt-4 leading-relaxed text-slate-600">Get a focused view of your current social growth opportunities, then decide on the right next step.</p></div><SocialGrowthAssessment /></div></section>

        <section id="contact" className="blueprint-overlay bg-navy-950 py-20 text-white"><div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Ready when you are</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s build your next growth system.</h2><p className="mt-4 max-w-2xl text-slate-300">Bring the expertise. We&apos;ll help turn it into a clearer social and course-growth path.</p></div><a href={strategyCallUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400"><Calendar className="h-4 w-4" /> Book a Strategy Call</a></div></section>
      </main>

      <footer className="bg-navy-950 px-4 py-8 text-slate-400 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} DATAPULSE SOCIAL. Social growth and course design.</p><div className="flex gap-4"><a href="#about" className="hover:text-white">About</a><a href="#pricing" className="hover:text-white">Pricing</a><a href="#contact" className="hover:text-white">Contact</a><a href="mailto:info@datapulsesocial.com" className="hover:text-white">Email</a></div></div></footer>
    </div>
  );
}
