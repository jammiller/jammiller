import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Cpu,
  Download,
  Layers,
  Mail,
  Menu,
  Phone,
  Sparkles,
  Target,
  X,
  CheckCircle2,
  GraduationCap,
  ClipboardCheck,
  Zap,
  TrendingUp,
  Droplets,
} from 'lucide-react';
import { About } from './About';
import { Blog } from './Blog';
import { FAQ } from './FAQ';
import { Portfolio } from './Portfolio';
export function DataPulseSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whyActive, setWhyActive] = useState(0);

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
            <a href="#portfolio" className="text-sm text-slate-300 transition-colors hover:text-white">Portfolio</a>
            <a href="#blog" className="text-sm text-slate-300 transition-colors hover:text-white">Insights</a>
            <a href="#contact" className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400">Let's Talk</a>
          </nav>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/10 px-4 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {['about', 'services', 'portfolio', 'blog', 'contact'].map((section) => (
                <a key={section} href={'#' + section} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium capitalize text-slate-200 hover:bg-white/10">
                  {section === 'blog' ? 'Insights' : section === 'contact' ? "Let's Talk" : section}
                </a>
              ))}
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
                <a href="https://tremonix.com" target="_blank" rel="noopener noreferrer" className="text-left">
                  <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Droplets className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-navy-700 transition-transform group-hover:translate-x-1" /></div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Revenue leak diagnostic</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy-900">Tremonix</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">Find the revenue your business is losing to slow response times, insufficient follow-up, and abandoned leads. Backed by published research.</p>
                  <span className="mt-7 inline-block text-sm font-semibold text-navy-900">Open Tremonix</span>
                </a>
              </div>
              <div className="group flex flex-col rounded-3xl border border-slate-200 bg-softgray p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-navy-400 hover:shadow-xl sm:p-9">
                <a href="https://statslab.app" target="_blank" rel="noopener noreferrer" className="text-left">
                  <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-100 text-navy-900"><BarChart3 className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-navy-700 transition-transform group-hover:translate-x-1" /></div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Interactive statistics tool</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy-900">StatsLab</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">Explore datasets, compute descriptive stats, visualize distributions, and run inference tests — all in your browser.</p>
                  <span className="mt-7 inline-block text-sm font-semibold text-navy-900">Open StatsLab</span>
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.statslab.app" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-400 hover:bg-navy-50 hover:text-navy-700">
                  <Download className="h-4 w-4" /> Download on Google Play
                </a>
              </div>
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

        <Portfolio />
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
            <a href="https://tremonix.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-300 hover:text-gold-400">Tremonix</a>
            <a href="https://statslab.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-300 hover:text-gold-400">StatsLab</a>
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
