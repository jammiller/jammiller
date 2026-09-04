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
  Shield,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { About } from './About';
import { Blog } from './Blog';
import { FAQ } from './FAQ';
import { Portfolio } from './Portfolio';
interface DataPulseSiteProps {
  onOpenApp: (view: 'safety') => void;
}

export function DataPulseSite({ onOpenApp }: DataPulseSiteProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
                <a key={section} href={`#${section}`} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium capitalize text-slate-200 hover:bg-white/10">
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
                We engineer UbD-driven learning systems that reduce cognitive overload and build the workforce competencies needed for a tech-savvy, machine-ready, high-performance workforce.
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
                    { label: 'UbD-driven design', desc: 'Stage 1, 2, and 3 structure ensures every unit builds toward real workforce competencies.' },
                    { label: 'Reduced cognitive overload', desc: 'Streamlined content design that helps learners absorb, retain, and apply skills faster.' },
                    { label: 'Competence-proven outcomes', desc: 'Assessments that verify tech-savvy, machine-ready talent — not just test scores.' },
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
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">We don't create curriculum — we engineer performance-driven learning infrastructure that produces tech-savvy, competence-proven talent.</p>
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
            <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
              <div className="group flex flex-col rounded-3xl border border-slate-200 bg-softgray p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl sm:p-9">
                <button onClick={() => onOpenApp('safety')} className="text-left">
                  <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><Shield className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-navy-700 transition-transform group-hover:translate-x-1" /></div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Personal safety toolkit</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy-900">Safety App</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">Emergency contacts, SOS support, location sharing, and quick access to essential safety tools.</p>
                  <span className="mt-7 inline-block text-sm font-semibold text-navy-900">Open Safety App</span>
                </button>
                <a href="https://play.google.com/store/apps/details?id=com.safetyapp.app" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700">
                  <Download className="h-4 w-4" /> Download on Google Play
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

        <section id="why" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">Why DATAPULSE SOCIAL</span>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Because great learning doesn't happen by accident.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Layers, title: 'UbD-driven structure', desc: 'Every unit is built with Stage 1, 2, and 3 structure to ensure real competency development.' },
                { icon: Sparkles, title: 'Reduced cognitive overload', desc: 'Streamlined content design that helps learners absorb, retain, and apply skills faster.' },
                { icon: Target, title: 'Competence-proven assessments', desc: 'Measure real workforce readiness, not just memorization.' },
                { icon: Cpu, title: 'Tech-savvy, machine-ready', desc: 'Curriculum built for advanced technology and machine-driven environments.' },
              ].map((item) => (
                <div key={item.title} className="group rounded-2xl border border-slate-200 bg-softgray p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-md">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-navy-200 bg-navy-100 text-navy-900 transition-colors group-hover:bg-gold-100 group-hover:text-gold-700"><item.icon className="h-5 w-5" /></div>
                  <h3 className="text-base font-bold tracking-tight text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
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
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Have a learning challenge? Let’s build the way forward.</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-300">Tell us what you’re working toward and we’ll help you find the clearest next step.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href="https://calendar.app.google/8otEDsChvouw51aaA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"><Calendar className="h-4 w-4" /> Book a call</a>
              <a href="tel:8508309910" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300"><Phone className="h-4 w-4" /> 850-830-9910</a>
              <a href="mailto:info@datapulsesocial.com" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-400 hover:text-gold-300"><Mail className="h-4 w-4" /> Email us</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy-950 px-4 py-8 text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-xs">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="#apps" className="font-semibold text-slate-300 hover:text-gold-400">Safety App</a>
            <a href="https://statslab.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-300 hover:text-gold-400">StatsLab</a>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} DATAPULSE SOCIAL. Built for better learning.</p>
            <div className="flex gap-4"><a href="#about" className="hover:text-white">About</a><a href="#contact" className="hover:text-white">Contact</a><a href="mailto:info@datapulsesocial.com" className="hover:text-white">info@datapulsesocial.com</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
