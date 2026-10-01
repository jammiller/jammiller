import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Clock,
  Repeat,
  TrendingDown,
  Users,
  Target,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Zap,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  Loader,
} from 'lucide-react';

const leakCategories = [
  {
    icon: Clock,
    title: 'Response Speed',
    stat: '8x',
    statLabel: 'conversion drop after 5 min',
    source: 'InsideSales / HBR',
    description: 'Leads contacted within 5 minutes are far more likely to convert. After 5 minutes, conversion rates drop by up to 8x. Most companies take far longer.',
    barColor: 'bg-rose-500',
    barWidth: '72%',
  },
  {
    icon: Repeat,
    title: 'Follow-Up Discipline',
    stat: '44%',
    statLabel: 'give up after 1 attempt',
    source: 'LeadResponse / SPOTIO',
    description: '44% of salespeople give up after just one follow-up attempt, yet 80% of sales require 5 or more touches to close.',
    barColor: 'bg-amber-500',
    barWidth: '65%',
  },
  {
    icon: Users,
    title: 'Lead Nurturing',
    stat: '71%',
    statLabel: 'of leads wasted',
    source: 'Forbes',
    description: '71% of internet leads are wasted due to poor follow-up. Over half of leads are never contacted at all.',
    barColor: 'bg-orange-500',
    barWidth: '58%',
  },
  {
    icon: TrendingDown,
    title: 'Churn Recovery',
    stat: '5-25x',
    statLabel: 'costlier to acquire vs. retain',
    source: 'Harvard Business Review',
    description: 'Acquiring a new customer costs 5 to 25 times more than retaining an existing one. Most businesses have no systematic churn recovery process.',
    barColor: 'bg-red-500',
    barWidth: '45%',
  },
];

const processSteps = [
  {
    number: '01',
    title: 'Book your audit',
    description: 'Schedule a 15-minute call. We\'ll ask about your response times, follow-up process, lead tracking, and retention strategy.',
    icon: Calendar,
  },
  {
    number: '02',
    title: 'We diagnose your leaks',
    description: 'We analyze your answers against industry benchmarks and show you exactly where revenue is being lost in your pipeline.',
    icon: BarChart3,
  },
  {
    number: '03',
    title: 'Get your fix plan',
    description: 'You receive a prioritized action plan with specific, implementable steps to plug your revenue leaks and recover lost revenue.',
    icon: CheckCircle2,
  },
];

const funnelStages = [
  { label: '15-min Audit', detail: 'Book your call', icon: Calendar },
  { label: 'Leak Report', detail: 'See your hidden leaks', icon: BarChart3 },
  { label: 'Fix Plan', detail: 'Prioritized by impact', icon: CheckCircle2 },
  { label: 'Implementation', detail: 'We help you plug them', icon: Zap },
];

const researchStats = [
  {
    value: '8x',
    label: 'Conversion rate drop',
    detail: 'after 5-minute response delay',
    source: 'InsideSales / HBR study',
  },
  {
    value: '44%',
    label: 'Give up after 1 try',
    detail: 'of salespeople stop after one follow-up',
    source: 'LeadResponse / SPOTIO',
  },
  {
    value: '71%',
    label: 'Leads wasted',
    detail: 'due to poor follow-up practices',
    source: 'Forbes',
  },
  {
    value: '80%',
    label: 'Need 5+ touches',
    detail: 'of sales require 5+ follow-up attempts',
    source: 'LeadResponse / SPOTIO',
  },
  {
    value: '5-25x',
    label: 'Acquisition vs. retention',
    detail: 'cost difference per customer',
    source: 'Harvard Business Review',
  },
  {
    value: '391%',
    label: 'Conversion boost',
    detail: 'when contacted within 1 minute',
    source: 'Velocify study',
  },
];

const faqItems = [
  {
    question: 'How long does the audit take?',
    answer: 'The initial call is 15 minutes. We ask about your sales process, response speed, follow-up discipline, and retention. After the call, we send you a detailed leak report.',
  },
  {
    question: 'Who should attend the call?',
    answer: 'Ideally someone who understands your sales process — a sales manager, ops lead, or business owner. You don\'t need to prepare anything.',
  },
  {
    question: 'What will I learn?',
    answer: 'You\'ll get specific numbers: the exact percentage of leads lost to slow response, how much revenue is leaking due to weak follow-up, and your churn recovery gaps. Then a concrete action plan.',
  },
  {
    question: 'Is this a sales pitch?',
    answer: 'No. The audit and report are for your benefit. If you want help fixing the leaks, we\'ll discuss options. But the audit stands alone.',
  },
  {
    question: 'How much does it cost?',
    answer: 'The 15-minute audit is $397. The detailed leak report (with action plan) is included. Implementation help is optional and quoted separately.',
  },
];

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
}

export function Tremonix() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', company: '', phone: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const quizQuestions = [
    {
      question: 'How fast does your team respond to new inbound leads?',
      options: [
        'Within 5 minutes',
        'Within 1 hour',
        'Within 24 hours',
        'Longer than 24 hours, or not sure',
      ],
    },
    {
      question: 'How many follow-up attempts does your team make before giving up?',
      options: [
        '5 or more attempts',
        '3-4 attempts',
        '1-2 attempts',
        'We follow up once, then move on',
      ],
    },
    {
      question: 'What percentage of inbound leads are never contacted at all?',
      options: [
        'Less than 10%',
        '10-30%',
        '30-50%',
        'More than 50%, or not sure',
      ],
    },
    {
      question: 'Do you have a systematic churn recovery process?',
      options: [
        'Yes, we actively win back churned customers',
        'Somewhat, but it is informal',
        'No, we focus on new acquisition',
        'Not sure',
      ],
    },
    {
      question: 'How do you measure sales training effectiveness?',
      options: [
        'All four Kirkpatrick levels (Reaction, Learning, Behavior, Results)',
        'Reaction and Learning only',
        'Just a satisfaction survey',
        'We do not measure training impact',
      ],
    },
  ];

  const handleQuizAnswer = (qIndex: number, answer: string) => {
    const newAnswers = { ...quizAnswers, [qIndex]: answer };
    setQuizAnswers(newAnswers);
    if (qIndex < quizQuestions.length - 1) {
      setQuizCurrent(qIndex + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const [quizCurrent, setQuizCurrent] = useState(0);

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizComplete(false);
    setQuizAnswers({});
    setQuizCurrent(0);
  };

  const leakScore = quizComplete
    ? Object.values(quizAnswers).reduce((score, answer) => {
        const idx = Object.values(quizAnswers).indexOf(answer);
        const qIdx = parseInt(Object.keys(quizAnswers).find(k => quizAnswers[parseInt(k)] === answer) || '0');
        const optIdx = quizQuestions[qIdx]?.options.indexOf(answer) ?? 0;
        return score + (optIdx >= 0 ? optIdx * 20 : 0);
      }, 0)
    : 0;

  const leakSeverity = leakScore >= 60 ? 'critical' : leakScore >= 40 ? 'moderate' : 'manageable';
  const leakSeverityColor = leakSeverity === 'critical' ? 'text-rose-400' : leakSeverity === 'moderate' ? 'text-amber-400' : 'text-emerald-400';
  const leakSeverityLabel = leakSeverity === 'critical' ? 'Critical — significant revenue at risk' : leakSeverity === 'moderate' ? 'Moderate — fixable leaks detected' : 'Manageable — minor improvements available';

  const recommendations = quizComplete
    ? Object.entries(quizAnswers)
        .map(([qIdx, answer]) => {
          const q = quizQuestions[parseInt(qIdx)];
          const optIdx = q.options.indexOf(answer);
          const severity = optIdx >= 2 ? 'high' : optIdx === 1 ? 'medium' : 'low';
          const priority = optIdx >= 2 ? 1 : optIdx === 1 ? 2 : 3;
          const actions: Record<string, string> = {
            '0': optIdx >= 2 ? 'Implement automated lead routing so inbound leads are contacted within 5 minutes. Use tools like Calendly, HubSpot, or Slack alerts to notify your team instantly.' : optIdx === 1 ? 'Establish a 1-hour response SLA and hold the team accountable. Track response time daily.' : 'You\'re doing well. Protect this with a documented response SLA.',
            '1': optIdx >= 2 ? 'Build a 5-touch follow-up cadence (email, call, LinkedIn, email, call) spread over 2 weeks. Use a CRM sequence or outreach tool to enforce it.' : optIdx === 1 ? 'Expand to 5 touches. Document the sequence in your CRM and track completion rates.' : 'Excellent. Document this process and measure adherence weekly.',
            '2': optIdx >= 2 ? 'Audit your lead pipeline weekly. Assign every lead to a rep within 24 hours. Set up a dashboard showing uncontacted leads so nothing falls through.' : optIdx === 1 ? 'Improve your lead assignment process. Create a routing rule or weekly check-in.' : 'Keep monitoring. Track this metric monthly.',
            '3': optIdx >= 2 ? 'Build a churn recovery campaign: reach out to churned customers with a win-back offer (discount, new feature, or check-in call). Start with the 10 most recent churned customers.' : optIdx === 1 ? 'Formalize your churn recovery. Create a template email or call script and assign ownership.' : 'As you scale, you\'ll need this. Plan it now.',
            '4': optIdx >= 2 ? 'Start measuring training impact with post-training quizzes (Learning) and a 30-day behavior survey (Behavior). Track at least one revenue metric tied to each training session.' : optIdx === 1 ? 'Add Behavior and Results measurement. A 30-day follow-up survey is simple and powerful.' : 'Build a simple feedback loop. Track one metric per training.',
          };
          return { qIdx, question: q.question, answer, severity, priority, action: actions[qIdx] || '' };
        })
        .sort((a, b) => a.priority - b.priority)
    : [];

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.company.trim()) errors.company = 'Company is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/xpzvwqnj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          message: `New audit request from ${formData.company}`,
        }),
      });

      if (response.ok) {
        setFormSuccess(true);
        setFormData({ name: '', email: '', company: '', phone: '' });
        setFormOpen(false);
        setTimeout(() => setFormSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-navy-950">
              <DollarSign className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold tracking-[0.08em]">TREMONIX</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#how" className="text-sm text-slate-300 transition-colors hover:text-white">How it works</a>
            <a href="#leaks" className="text-sm text-slate-300 transition-colors hover:text-white">Revenue leaks</a>
            <a href="#faq" className="text-sm text-slate-300 transition-colors hover:text-white">FAQ</a>
            <button onClick={() => setFormOpen(true)} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-400">Book audit</button>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy-950">
          <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
          <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
            <div>
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                <span className="inline-block h-px w-12 bg-emerald-400" /> Revenue Leak Audit
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Your sales process is <span className="text-emerald-400">leaking revenue.</span> We'll show you where.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Book a 15-minute call. We'll audit your response speed, follow-up discipline, and retention process. You'll get a detailed report showing exactly where revenue is being lost — and how to fix it.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Book your $397 audit <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#leaks" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40">
                  See the leaks
                </a>
              </div>
              <p className="mt-4 text-xs text-slate-400">No credit card required. 15-minute call. Actionable report included.</p>
            </div>

            {/* Stats card */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">The research shows</p>
                    <p className="mt-1 text-lg font-semibold">Revenue is being lost</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-navy-950"><BarChart3 className="h-5 w-5" /></div>
                </div>
                <div className="space-y-5">
                  {[
                    { value: '8x', label: 'Conversion drops after 5-min delay', source: 'InsideSales / HBR' },
                    { value: '44%', label: 'Salespeople give up after 1 follow-up', source: 'LeadResponse / SPOTIO' },
                    { value: '71%', label: 'Internet leads wasted due to poor follow-up', source: 'Forbes' },
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-emerald-400/50 text-xs font-bold text-emerald-300">0{index + 1}</span>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-slate-100">{item.value} — {item.label}</span>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">Source: {item.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white py-24 text-navy-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">The Process</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How the audit works.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">Three simple steps to identify and fix your revenue leaks.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {processSteps.map((step) => (
                <div key={step.number} className="group rounded-2xl border border-slate-200 bg-softgray p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-navy-200 bg-navy-100 text-navy-900 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{step.number}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Funnel */}
            <div className="mt-16">
              <div className="grid gap-4 md:grid-cols-4">
                {funnelStages.map((stage, i) => (
                  <div key={stage.label} className="flex items-center gap-4">
                    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <stage.icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold">{stage.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{stage.detail}</p>
                    </div>
                    {i < funnelStages.length - 1 && (
                      <ArrowRight className="hidden h-5 w-5 flex-shrink-0 text-slate-300 md:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Ready? Book your audit <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Revenue leaks */}
        <section id="leaks" className="bg-navy-950 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">The 4 revenue leaks</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Where revenue silently drains.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-300">Research identifies four major areas where businesses lose revenue. Each is measurable and fixable.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {leakCategories.map((leak) => (
                <div key={leak.title} className="group rounded-2xl border border-white/10 bg-white/[0.05] p-7 transition-all duration-300 hover:border-emerald-400/30 hover:bg-white/[0.08]">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/10 text-emerald-400">
                      <leak.icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-400">{leak.stat}</p>
                      <p className="text-xs text-slate-400">{leak.statLabel}</p>
                    </div>
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">{leak.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{leak.description}</p>
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${leak.barColor} transition-all duration-1000`} style={{ width: leak.barWidth }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Source: {leak.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Research stats */}
        <section id="stats" className="bg-white py-24 text-navy-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">Research-backed</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The numbers behind the leaks.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">Every statistic on this page comes from published research. We cite our sources. No fabricated numbers.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {researchStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-softgray p-6 transition-all duration-300 hover:border-emerald-300 hover:shadow-md">
                  <p className="text-4xl font-bold text-emerald-600">{stat.value}</p>
                  <p className="mt-2 text-sm font-bold text-navy-900">{stat.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{stat.detail}</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3">
                    <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">{stat.source}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-navy-900">About these statistics</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    These figures come from research published by InsideSales, Harvard Business Review, Forbes, and Velocify, compiled by sales performance platforms including SPOTIO and LeadResponse. We cite sources for every stat so you can verify.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white py-24 text-navy-900">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">FAQ</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered.</h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-softgray overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="text-sm font-bold text-navy-900">{item.question}</span>
                    <ChevronDown className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-relaxed text-slate-600">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-navy-950 py-20 text-white">
          <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Find Your Revenue Leaks</p>
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Ready to recover lost revenue?</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-300">Book a 15-minute audit call. We'll show you where your business is leaking revenue and give you a clear action plan.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Calendar className="h-4 w-4" /> Book your audit
              </button>
              <a href="tel:8508309910" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40">
                <Phone className="h-4 w-4" /> 850-830-9910
              </a>
              <a href="mailto:contact@tremonix.com" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40">
                <Mail className="h-4 w-4" /> contact@tremonix.com
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Audit Booking Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-navy-950 p-8 shadow-2xl border border-white/10">
            <h3 className="text-2xl font-bold text-white">Book Your Audit</h3>
            <p className="mt-2 text-sm text-slate-300">15-minute call + detailed leak report. $397.</p>

            {formSuccess && (
              <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                <p className="text-sm text-emerald-300">✓ Thanks! We'll send you a calendar link and next steps shortly.</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Your name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 transition-colors hover:border-white/20 focus:border-emerald-500 focus:outline-none"
                  placeholder="John Doe"
                />
                {formErrors.name && <p className="mt-1 text-xs text-rose-400">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 transition-colors hover:border-white/20 focus:border-emerald-500 focus:outline-none"
                  placeholder="you@company.com"
                />
                {formErrors.email && <p className="mt-1 text-xs text-rose-400">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 transition-colors hover:border-white/20 focus:border-emerald-500 focus:outline-none"
                  placeholder="Acme Corp"
                />
                {formErrors.company && <p className="mt-1 text-xs text-rose-400">{formErrors.company}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 transition-colors hover:border-white/20 focus:border-emerald-500 focus:outline-none"
                  placeholder="(850) 830-9910"
                />
                {formErrors.phone && <p className="mt-1 text-xs text-rose-400">{formErrors.phone}</p>}
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              >
                {formSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Book Audit ($397)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="w-full rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-navy-950 px-4 py-8 text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Tremonix. Revenue leak diagnostics backed by published research.</p>
            <div className="flex gap-4">
              <a href="#how" className="hover:text-white">How it works</a>
              <a href="#leaks" className="hover:text-white">Leaks</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
              <a href="#stats" className="hover:text-white">Research</a>
            </div>
          </div>
          <p className="text-xs text-slate-600">Statistics sourced from InsideSales, Harvard Business Review, Forbes, and Velocify research. Individual results vary by industry and sales process.</p>
        </div>
      </footer>
    </div>
  );
}
