import { useState } from 'react';
import {
  Anchor,
  Waves,
  Users,
  Sparkles,
  Heart,
  TrendingUp,
  Calendar,
  MessageCircle,
  Target,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Star,
  Compass,
  Shield,
  Zap,
} from 'lucide-react';

export function Harbor() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f5f0] font-sans antialiased text-[#1c2a2d]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(26,58,66,0.08)] bg-[#f8f5f0]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a3a42] to-[#2a5963] text-white shadow-md">
              <Anchor className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#1a3a42]">Harbor</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[#5a6f73] transition-colors hover:text-[#1a3a42]">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[#5a6f73] transition-colors hover:text-[#1a3a42]">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-[#5a6f73] transition-colors hover:text-[#1a3a42]">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-[#5a6f73] transition-colors hover:text-[#1a3a42]">Stories</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#cta" className="text-sm font-semibold text-[#1a3a42] transition-colors hover:text-[#a88c5d]">Sign In</a>
            <a
              href="#cta"
              className="rounded-xl bg-gradient-to-r from-[#1a3a42] to-[#2a5963] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#1a3a42]/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start Free Trial
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#1a3a42] md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[rgba(26,58,66,0.08)] bg-[#f8f5f0] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#5a6f73]">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#5a6f73]">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#5a6f73]">Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#5a6f73]">Stories</a>
              <a href="#cta" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-gradient-to-r from-[#1a3a42] to-[#2a5963] px-5 py-2.5 text-center text-sm font-bold text-white">Start Free Trial</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9f5f0] via-[#f5f0e8] to-[#f0ebe2]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#a88c5d]/8 blur-3xl" />
        <div className="absolute -left-20 top-40 h-[400px] w-[400px] rounded-full bg-[#1a3a42]/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(168,140,93,0.25)] bg-white/60 px-4 py-1.5 text-sm font-medium text-[#a88c5d] backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Now accepting founding communities for 2026
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1a3a42] sm:text-5xl md:text-6xl">
            Wellness brands.<br />
            Premium communities.<br />
            <span className="bg-gradient-to-r from-[#a88c5d] to-[#8b7444] bg-clip-text text-transparent">Intentional connection.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#5a6f73]">
            A guided community experience platform that helps members feel supported, seen, and consistently engaged — without the noise of generic social media.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1a3a42] to-[#2a5963] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#1a3a42]/20 transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              Start 14-Day Free Trial
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(26,58,66,0.15)] bg-white/70 px-8 py-4 text-base font-semibold text-[#1a3a42] backdrop-blur-sm transition-all hover:border-[#a88c5d]/40 hover:bg-white"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#5a6f73]">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#a88c5d]" /> No credit card required</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#a88c5d]" /> Cancel anytime</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#a88c5d]" /> Setup in minutes</div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[rgba(26,58,66,0.08)] bg-white/60 py-12 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4">
          {[
            { value: '500+', label: 'Wellness communities' },
            { value: '92%', label: 'Member engagement rate' },
            { value: '3.4x', label: 'Faster onboarding' },
            { value: '24/7', label: 'Guided support' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold tracking-tight text-[#1a3a42]">{stat.value}</div>
              <div className="mt-1 text-sm text-[#5a6f73]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[#1a3a42] sm:text-4xl">
              Everything you need to build a thriving wellness community
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#5a6f73]">
              Harbor gives you the tools to guide members from their first hello to lasting transformation — all in one calm, focused space.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Compass, title: 'Guided Member Onboarding', desc: 'Walk new members through a structured welcome flow that sets expectations, builds trust, and gets them active from day one.' },
              { icon: Users, title: 'Intentional Circles & Groups', desc: 'Create focused sub-communities around goals, interests, or program tracks — each with its own space, rhythm, and rituals.' },
              { icon: TrendingUp, title: 'Progress Tracking Dashboard', desc: 'Members see their growth at a glance. You see community health metrics that help you intervene before engagement drops.' },
              { icon: Calendar, title: 'Programmed Experiences', desc: 'Schedule weekly themes, daily prompts, and live sessions. Members always know what to do next without overwhelm.' },
              { icon: MessageCircle, title: 'Reflective Conversations', desc: 'Threaded discussions designed for depth, not noise. Reactions, highlights, and guided prompts keep conversations meaningful.' },
              { icon: Target, title: 'Goal & Habit Tracking', desc: 'Members set personal wellness goals and track daily habits. Celebrate milestones together with built-in recognition tools.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[rgba(26,58,66,0.08)] bg-white/80 p-7 shadow-lg shadow-[#0f2a32]/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[rgba(168,140,93,0.3)] hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgba(168,140,93,0.12)] to-[rgba(26,58,66,0.06)]">
                  <feature.icon className="h-7 w-7 text-[#1a3a42]" />
                </div>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-[#1a3a42]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#5a6f73]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-[#f5f0e8] to-[#f8f5f0] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[#1a3a42] sm:text-4xl">
              How Harbor works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#5a6f73]">
              Three simple steps from signup to a flourishing community.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: Shield, title: 'Set Your Foundation', desc: 'Define your community purpose, values, and the member journey you want to guide. Harbor templates make this fast.' },
              { step: '02', icon: Waves, title: 'Invite & Onboard', desc: 'Send invitations, and new members flow through a structured welcome that connects them to the right circles and goals.' },
              { step: '03', icon: Heart, title: 'Guide & Grow', desc: 'Run programs, track progress, and nurture engagement with insights that tell you exactly where to focus your energy.' },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-[rgba(26,58,66,0.08)] bg-white/80 p-8 text-center shadow-lg shadow-[#0f2a32]/5 backdrop-blur-sm">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1a3a42] to-[#2a5963] px-4 py-1 text-xs font-bold text-white">
                  {item.step}
                </div>
                <div className="mb-4 mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgba(168,140,93,0.12)] to-[rgba(26,58,66,0.06)] mx-auto">
                  <item.icon className="h-8 w-8 text-[#1a3a42]" />
                </div>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-[#1a3a42]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#5a6f73]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[#1a3a42] sm:text-4xl">
              Trusted by wellness leaders
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#5a6f73]">
              Community builders who switched from scattered tools to Harbor.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: 'Our members went from lurkers to active participants within the first week. The guided onboarding made all the difference.', name: 'Sarah Chen', role: 'Mindfulness Coach', initials: 'SC' },
              { quote: 'I was juggling five different tools. Harbor replaced all of them and my members actually know where to go now.', name: 'Marcus Webb', role: 'Fitness Community Leader', initials: 'MW' },
              { quote: 'The progress dashboard is a game changer. I can see exactly who needs a nudge and who is ready to step into leadership.', name: 'Dr. Lena Okafor', role: 'Wellness Practitioner', initials: 'LO' },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-[rgba(26,58,66,0.08)] bg-white/80 p-7 shadow-lg shadow-[#0f2a32]/5 backdrop-blur-sm">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#a88c5d] text-[#a88c5d]" />
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-[#1c2a2d]">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1a3a42] to-[#2a5963] text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1a3a42]">{t.name}</div>
                    <div className="text-xs text-[#5a6f73]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gradient-to-b from-[#f5f0e8] to-[#f8f5f0] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[#1a3a42] sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#5a6f73]">
              Start free. Upgrade when your community is ready to grow.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Seedling',
                price: '$0',
                period: 'forever',
                desc: 'For getting started',
                features: ['Up to 25 members', '1 community circle', 'Basic onboarding flow', 'Community dashboard', 'Email support'],
                cta: 'Start Free',
                highlighted: false,
              },
              {
                name: 'Harbor',
                price: '$49',
                period: 'per month',
                desc: 'For growing communities',
                features: ['Up to 250 members', 'Unlimited circles', 'Custom onboarding flows', 'Progress & habit tracking', 'Programmed experiences', 'Analytics dashboard', 'Priority support'],
                cta: 'Start 14-Day Trial',
                highlighted: true,
              },
              {
                name: 'Lighthouse',
                price: '$149',
                period: 'per month',
                desc: 'For established brands',
                features: ['Unlimited members', 'Multiple communities', 'White-label branding', 'Advanced analytics', 'API access', 'Dedicated success manager', 'Custom integrations'],
                cta: 'Contact Sales',
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 backdrop-blur-sm transition-all ${
                  plan.highlighted
                    ? 'border-[#a88c5d]/40 bg-white shadow-2xl shadow-[#1a3a42]/10 md:-translate-y-2'
                    : 'border-[rgba(26,58,66,0.08)] bg-white/80 shadow-lg shadow-[#0f2a32]/5'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#a88c5d] to-[#8b7444] px-4 py-1 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-1 text-lg font-bold tracking-tight text-[#1a3a42]">{plan.name}</h3>
                <p className="mb-4 text-sm text-[#5a6f73]">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold tracking-tight text-[#1a3a42]">{plan.price}</span>
                  <span className="ml-1 text-sm text-[#5a6f73]">{plan.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1c2a2d]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#a88c5d]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#cta"
                  className={`block rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#1a3a42] to-[#2a5963] text-white shadow-lg shadow-[#1a3a42]/15 hover:-translate-y-0.5'
                      : 'border border-[rgba(26,58,66,0.15)] bg-white text-[#1a3a42] hover:border-[#a88c5d]/40'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-[rgba(26,58,66,0.1)] bg-gradient-to-br from-[#1a3a42] to-[#0f2a32] p-12 text-center shadow-2xl shadow-[#0f2a32]/20">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#a88c5d]/10 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#2a5963]/20 blur-3xl" />

            <div className="relative">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Anchor className="h-8 w-8 text-white" />
              </div>

              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to launch your wellness community?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-white/70">
                Join the founding cohort of wellness brands building intentional communities on Harbor. Your first 14 days are free.
              </p>

              <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="you@wellnessbrand.com"
                  className="flex-1 rounded-xl border border-white/15 bg-white/10 px-5 py-3.5 text-sm text-white placeholder-white/40 backdrop-blur-sm focus:border-[#a88c5d]/50 focus:outline-none focus:ring-1 focus:ring-[#a88c5d]/30"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a88c5d] to-[#8b7444] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
                <div className="flex items-center gap-2"><Zap className="h-4 w-4" /> No credit card required</div>
                <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Cancel anytime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(26,58,66,0.08)] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a3a42] to-[#2a5963] text-white shadow-md">
                <Anchor className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[#1a3a42]">Harbor</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#5a6f73]">
              <a href="#features" className="transition-colors hover:text-[#1a3a42]">Features</a>
              <a href="#pricing" className="transition-colors hover:text-[#1a3a42]">Pricing</a>
              <a href="#testimonials" className="transition-colors hover:text-[#1a3a42]">Stories</a>
              <a href="#cta" className="transition-colors hover:text-[#1a3a42]">Get Started</a>
            </div>

            <div className="text-sm text-[#5a6f73]">
              Harbor &copy; 2026 · Built for wellness brands
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
