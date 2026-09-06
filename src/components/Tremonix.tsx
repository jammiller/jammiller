import { useState } from 'react';
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
    title: 'Take the free diagnostic',
    description: 'Answer questions about your sales process — response speed, follow-up habits, lead nurturing, churn recovery. Takes 3 minutes. No email required.',
    icon: Target,
  },
  {
    number: '02',
    title: 'Get your leak report',
    description: 'We calculate where revenue is being lost, broken down by category. You see specific areas, not vague scores.',
    icon: BarChart3,
  },
  {
    number: '03',
    title: 'Fix what matters most',
    description: 'Get a prioritized action plan showing which leaks to fix first. Fix them yourself or have us help.',
    icon: CheckCircle2,
  },
];

const funnelStages = [
  { label: 'Diagnostic', detail: 'Questions, 3 min', icon: Target },
  { label: 'Leak Report', detail: 'Areas revealed', icon: BarChart3 },
  { label: 'Fix Plan', detail: 'Prioritized by impact', icon: CheckCircle2 },
  { label: 'Implementation', detail: 'We help plug the leaks', icon: Zap },
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
    question: 'Where do these statistics come from?',
    answer: 'All statistics cited on this page come from published research by InsideSales, Harvard Business Review, Forbes, Velocify, and sales performance data compiled by SPOTIO and LeadResponse. We cite our sources next to each figure. We do not fabricate numbers.',
  },
  {
    question: 'Is the diagnostic really free?',
    answer: 'Yes. The diagnostic takes about 3 minutes and requires no email. You get your leak report immediately after completing the questions.',
  },
  {
    question: 'What does "revenue leak" mean?',
    answer: 'A revenue leak is any point in your sales process where potential revenue is being lost due to process gaps — slow response times, insufficient follow-up, abandoned leads, or unmanaged churn. These are measurable, fixable problems.',
  },
  {
    question: 'Can I fix the leaks myself?',
    answer: 'Yes. The leak report includes a prioritized action plan. You can implement the fixes yourself, or we can help with implementation if you prefer.',
  },
];

export function Tremonix() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);

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
  const leakSeverityLabel = leakSeverity === 'critical' ? 'Critical — significant revenue at risk' : leakSeverity === 'moderate' ? 'Moderate — fixable leaks detected' : 'Manageable — minor improvements needed';

  const recommendations = quizComplete
    ? Object.entries(quizAnswers)
        .map(([qIdx, answer]) => {
          const q = quizQuestions[parseInt(qIdx)];
          const optIdx = q.options.indexOf(answer);
          const severity = optIdx >= 2 ? 'high' : optIdx === 1 ? 'medium' : 'low';
          const priority = optIdx >= 2 ? 1 : optIdx === 1 ? 2 : 3;
          const actions: Record<string, string> = {
            '0': optIdx >= 2 ? 'Implement automated lead routing so inbound leads are contacted within 5 minutes. Use tools like Calendly, HubSpot, or Slack alerts to notify your team instantly.' : optIdx === 1 ? 'Set a 15-minute SLA for lead response. Add a shared inbox or CRM alert so no lead sits waiting.' : 'Your response speed is strong. Maintain it and consider automating follow-up sequences for scale.',
            '1': optIdx >= 2 ? 'Build a 5-touch follow-up cadence (email, call, LinkedIn, email, call) spread over 2 weeks. Use a CRM sequence or outreach tool to enforce it.' : optIdx === 1 ? 'Extend your follow-up to 5 touches minimum. Create a template sequence so reps can execute it in under 10 minutes per lead.' : 'Your follow-up discipline is solid. Track touch counts in your CRM to ensure consistency as you scale.',
            '2': optIdx >= 2 ? 'Audit your lead pipeline weekly. Assign every lead to a rep within 24 hours. Set up a dashboard showing uncontacted leads so nothing falls through.' : optIdx === 1 ? 'Create a weekly lead audit. Assign ownership at lead capture time so every lead has an accountable rep.' : 'Your lead contact rate is healthy. Keep monitoring with a weekly uncontacted-leads report.',
            '3': optIdx >= 2 ? 'Build a churn recovery campaign: reach out to churned customers with a win-back offer (discount, new feature, or check-in call). Start with the 10 most recent churns this month.' : optIdx === 1 ? 'Formalize your win-back process. Create a template email and call script for churned customers, and schedule outreach 30 days after churn.' : 'You have a churn recovery process in place. Measure its win-back rate quarterly to optimize.',
            '4': optIdx >= 2 ? 'Start measuring training impact with post-training quizzes (Learning) and a 30-day behavior survey (Behavior). Track at least one revenue metric tied to each training program.' : optIdx === 1 ? 'Add a Learning-level quiz after each training session, and survey participants 30 days later to check if behavior changed.' : 'Your training measurement is comprehensive. Consider tying results to compensation or performance reviews for accountability.',
          };
          return { qIdx, question: q.question, answer, severity, priority, action: actions[qIdx] || '' };
        })
        .sort((a, b) => a.priority - b.priority)
    : [];

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
            <a href="#stats" className="text-sm text-slate-300 transition-colors hover:text-white">Research</a>
            <a href="#faq" className="text-sm text-slate-300 transition-colors hover:text-white">FAQ</a>
            <a href="#diagnostic" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-400">Start diagnostic</a>
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
                <span className="inline-block h-px w-12 bg-emerald-400" /> Revenue Leak Diagnostic
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Find the revenue you're losing <span className="text-emerald-400">before your competitors do.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Research from InsideSales, Harvard Business Review, and Forbes shows that most businesses are losing significant revenue to slow response times, insufficient follow-up, and abandoned leads. Our diagnostic shows you exactly where.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#diagnostic" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-emerald-400">
                  Start the free diagnostic <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#stats" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400 hover:text-emerald-300">
                  See the research
                </a>
              </div>
            </div>

            {/* Stats card */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
                <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">The research says</p>
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
                <div className="mt-8 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-400">Our approach</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">We diagnose before we prescribe. No doctor prescribes medication without running tests first. We do the same for your revenue.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white py-24 text-navy-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">How it works</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Diagnose before you prescribe.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">No doctor prescribes medication without running tests first. We do the same for your revenue. Here's the exact process.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {processSteps.map((step) => (
                <div key={step.number} className="group rounded-2xl border border-slate-200 bg-softgray p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-navy-200 bg-navy-100 text-navy-900 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
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
                    These figures come from research published by InsideSales, Harvard Business Review, Forbes, and Velocify, compiled by sales performance platforms including SPOTIO and LeadResponse. Individual results vary by industry, company size, and sales process maturity. The diagnostic uses these benchmarks to estimate where your revenue may be leaking — not to guarantee specific dollar amounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive diagnostic */}
        <section id="diagnostic" className="bg-navy-950 py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="mb-5 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">Free diagnostic</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Find your leaks now.</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-300">Answer 5 questions about your sales process. Takes 3 minutes. No email required.</p>
            </div>

            {!quizStarted && !quizComplete && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center sm:p-12">
                <Target className="mx-auto h-16 w-16 text-emerald-400" />
                <h3 className="mt-6 text-2xl font-bold">Ready to find your revenue leaks?</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">You'll answer 5 quick questions about your sales process. We'll show you where revenue may be leaking based on research benchmarks.</p>
                <button
                  onClick={() => setQuizStarted(true)}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
                >
                  Start the diagnostic <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {quizStarted && !quizComplete && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 sm:p-12">
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Question {quizCurrent + 1} of {quizQuestions.length}</span>
                    <span>{Math.round((quizCurrent / quizQuestions.length) * 100)}% complete</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${(quizCurrent / quizQuestions.length) * 100}%` }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold tracking-tight">{quizQuestions[quizCurrent].question}</h3>
                <div className="mt-6 space-y-3">
                  {quizQuestions[quizCurrent].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(quizCurrent, option)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm font-medium text-slate-200 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-white"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-slate-400">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizComplete && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center sm:p-12">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
                <h3 className="mt-6 text-2xl font-bold">Your diagnostic is complete</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">Based on your answers, here's your revenue leak assessment with prioritized recommendations.</p>

                <div className="mt-8 rounded-2xl bg-white/10 p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Leak score</p>
                      <p className="mt-1 text-3xl font-bold text-white">{leakScore}<span className="text-lg text-slate-400">/100</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Assessment</p>
                      <p className={`mt-1 text-sm font-bold ${leakSeverityColor}`}>{leakSeverityLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${leakSeverity === 'critical' ? 'bg-rose-500' : leakSeverity === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${leakScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-left">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-3">Prioritized recommendations</p>
                  <div className="space-y-4">
                    {recommendations.map((rec, i) => {
                      const colors = { high: { border: 'border-rose-400/30', bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'HIGH PRIORITY' }, medium: { border: 'border-amber-400/30', bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'MEDIUM PRIORITY' }, low: { border: 'border-emerald-400/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'LOW PRIORITY' } };
                      const c = colors[rec.severity as keyof typeof colors];
                      return (
                        <div key={rec.qIdx} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">{i + 1}</span>
                              <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{c.label}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-slate-100">{rec.question}</p>
                          <p className="mt-1 text-xs text-slate-400">Your answer: {rec.answer}</p>
                          <div className="mt-3 flex items-start gap-2 border-t border-white/10 pt-3">
                            <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                            <p className="text-sm leading-relaxed text-slate-200">{rec.action}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                  <p className="text-xs leading-relaxed text-slate-300">
                    This assessment is based on research benchmarks from InsideSales, Harvard Business Review, Forbes, and Velocify. For a detailed revenue leak analysis with specific dollar figures and implementation support, book a consultation.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-400">
                    Book a consultation <ArrowRight className="h-4 w-4" />
                  </a>
                  <button onClick={resetQuiz} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400 hover:text-emerald-300">
                    Retake diagnostic
                  </button>
                </div>
              </div>
            )}
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

        {/* Contact */}
        <section id="contact" className="relative overflow-hidden bg-navy-950 py-20 text-white">
          <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Start a conversation</p>
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Found your leaks? Let's fix them.</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-300">Book a consultation to get a detailed revenue leak analysis with specific recommendations.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href="https://calendar.app.google.com/8otEDsChvouw51aaA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-400">
                <Calendar className="h-4 w-4" /> Book a call
              </a>
              <a href="tel:8508309910" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400 hover:text-emerald-300">
                <Phone className="h-4 w-4" /> 850-830-9910
              </a>
              <a href="mailto:info@tremonix.com" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400 hover:text-emerald-300">
                <Mail className="h-4 w-4" /> Email us
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy-950 px-4 py-8 text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Tremonix. Revenue leak diagnostics backed by published research.</p>
            <div className="flex gap-4">
              <a href="#how" className="hover:text-white">How it works</a>
              <a href="#stats" className="hover:text-white">Research</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>
          </div>
          <p className="text-xs text-slate-600">Statistics sourced from InsideSales, Harvard Business Review, Forbes, and Velocify research. Individual results vary by industry and sales process.</p>
        </div>
      </footer>
    </div>
  );
}
