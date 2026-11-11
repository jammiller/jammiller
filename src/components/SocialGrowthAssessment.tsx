import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, BarChart3, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Phase = 'intro' | 'quiz' | 'lead-capture' | 'results';

interface Question {
  id: number;
  text: string;
  options: { label: string; points: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'How consistently does your business post on social media?',
    options: [
      { label: 'Daily', points: 10 },
      { label: '3-5 Times Weekly', points: 7 },
      { label: '1-2 Times Weekly', points: 4 },
      { label: 'Rarely', points: 1 },
    ],
  },
  {
    id: 2,
    text: 'Does your content include a clear call-to-action?',
    options: [
      { label: 'Every Post', points: 10 },
      { label: 'Most Posts', points: 7 },
      { label: 'Some Posts', points: 4 },
      { label: 'Rarely', points: 1 },
    ],
  },
  {
    id: 3,
    text: 'What best describes your social media goals?',
    options: [
      { label: 'Lead Generation', points: 10 },
      { label: 'Brand Awareness', points: 7 },
      { label: 'Customer Retention', points: 5 },
      { label: 'Unsure', points: 2 },
    ],
  },
  {
    id: 4,
    text: 'Do you actively track social media performance?',
    options: [
      { label: 'Monthly', points: 10 },
      { label: 'Quarterly', points: 7 },
      { label: 'Occasionally', points: 4 },
      { label: 'Never', points: 1 },
    ],
  },
  {
    id: 5,
    text: 'Is your business profile fully optimized?',
    options: [
      { label: 'Yes', points: 10 },
      { label: 'Mostly', points: 7 },
      { label: 'Somewhat', points: 4 },
      { label: 'No', points: 1 },
    ],
  },
  {
    id: 6,
    text: 'How quickly do you respond to messages?',
    options: [
      { label: 'Same Day', points: 10 },
      { label: '24-48 Hours', points: 7 },
      { label: 'Several Days', points: 3 },
      { label: 'Rarely', points: 1 },
    ],
  },
  {
    id: 7,
    text: 'How often do you create original content?',
    options: [
      { label: 'Multiple Times Weekly', points: 10 },
      { label: 'Weekly', points: 7 },
      { label: 'Monthly', points: 4 },
      { label: 'Rarely', points: 1 },
    ],
  },
  {
    id: 8,
    text: 'Does social media generate inquiries for your business?',
    options: [
      { label: 'Consistently', points: 10 },
      { label: 'Sometimes', points: 6 },
      { label: 'Rarely', points: 3 },
      { label: 'Never', points: 1 },
    ],
  },
  {
    id: 9,
    text: 'How frequently do you publish video content?',
    options: [
      { label: 'Weekly', points: 10 },
      { label: 'Monthly', points: 7 },
      { label: 'Occasionally', points: 4 },
      { label: 'Never', points: 1 },
    ],
  },
  {
    id: 10,
    text: 'Do you have a process to convert followers into leads?',
    options: [
      { label: 'Automated System', points: 10 },
      { label: 'Manual Process', points: 7 },
      { label: 'Limited Process', points: 4 },
      { label: 'No Process', points: 1 },
    ],
  },
];

function getTier(score: number) {
  if (score >= 90) return { label: 'Advanced Prospect', message: 'You have a strong foundation. Let us help you scale efficiently.', color: 'emerald' };
  if (score >= 70) return { label: 'Optimization Prospect', message: 'Your strategy is working. Strategic optimization can accelerate results.', color: 'blue' };
  if (score >= 40) return { label: 'Growth Opportunity Prospect', message: 'Several improvements could significantly increase your visibility and lead generation.', color: 'amber' };
  return { label: 'High Priority Prospect', message: 'Your business may be missing critical social media foundations.', color: 'red' };
}

function getOpportunities(answers: number[]) {
  const opportunities: string[] = [];
  if (answers[0] <= 4) opportunities.push('Posting consistency can be improved to increase audience reach and engagement.');
  if (answers[1] <= 4) opportunities.push('Stronger calls-to-action could increase lead generation.');
  if (answers[5] <= 4) opportunities.push('Faster response times could improve customer trust and conversion rates.');
  if (answers[6] <= 4) opportunities.push('More frequent original content could boost visibility and engagement.');
  if (answers[8] <= 4) opportunities.push('Video content presents a major growth opportunity for your business.');
  if (answers[9] <= 4) opportunities.push('A structured lead conversion process could turn followers into customers.');
  if (opportunities.length === 0) opportunities.push('Fine-tune your existing strategy to maximize ROI and scale efficiently.');
  return opportunities.slice(0, 3);
}

function getNextSteps(score: number) {
  if (score < 40) return ['Establish a consistent posting schedule', 'Optimize your social profiles with keywords', 'Add clear calls-to-action to every post', 'Start tracking basic performance metrics'];
  if (score < 70) return ['Increase posting frequency', 'Implement weekly video content', 'Strengthen lead capture opportunities', 'Improve audience targeting'];
  return ['Refine content strategy for scale', 'Leverage advanced analytics', 'Optimize automated funnels', 'Expand to new platforms'];
}

export function SocialGrowthAssessment() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [formData, setFormData] = useState({ full_name: '', business_name: '', email: '', phone: '', website: '', industry: '' });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  const progress = phase === 'quiz' ? ((currentQ + 1) / QUESTIONS.length) * 100 : phase === 'intro' ? 0 : 100;

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQ] = QUESTIONS[currentQ].options[optionIndex].points;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
      } else {
        const total = newAnswers.reduce((sum, p) => sum + p, 0);
        setScore(total);
        setPhase('lead-capture');
      }
    }, 350);
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setSelectedOption(answers[currentQ - 1] ? QUESTIONS[currentQ - 1].options.findIndex(o => o.points === answers[currentQ - 1]) : null);
    }
  };

  const handleSubmitLead = async () => {
    setSubmitError(null);
    if (!formData.full_name.trim() || !formData.business_name.trim() || !formData.email.trim()) {
      setSubmitError('Please fill in your name, business name, and email to reveal your score.');
      return;
    }
    setSubmitting(true);
    try {
      const tier = getTier(score);
      const { error } = await supabase.from('social_growth_assessment_leads').insert({
        full_name: formData.full_name.trim(),
        business_name: formData.business_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        website: formData.website.trim() || null,
        industry: formData.industry.trim() || null,
        score,
        prospect_tier: tier.label,
        answers: answers,
      });
      if (error) throw error;
      setPhase('results');
    } catch {
      setSubmitError('Something went wrong submitting your assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAssessment = () => {
    setPhase('intro');
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setFormData({ full_name: '', business_name: '', email: '', phone: '', website: '', industry: '' });
    setScore(0);
    setSubmitError(null);
  };

  const tier = getTier(score);
  const opportunities = getOpportunities(answers);
  const nextSteps = getNextSteps(score);
  const questionsLeft = QUESTIONS.length - currentQ - 1;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress bar */}
      {phase === 'quiz' && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-900">Question {currentQ + 1} of {QUESTIONS.length}</span>
            <span className="text-xs font-semibold text-gold-700">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gold-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{questionsLeft === 0 ? "Last question!" : `${questionsLeft} question${questionsLeft !== 1 ? 's' : ''} remaining`}</p>
        </div>
      )}

      {/* Intro */}
      {phase === 'intro' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy-900">
              <BarChart3 className="h-3.5 w-3.5 text-gold-700" /> Free Social Growth Assessment
            </span>
            <h3 className="text-2xl font-bold text-navy-900 sm:text-3xl">What's Your Social Growth Score?</h3>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Discover what's limiting your social media growth. In less than 3 minutes, get your personalized Social Growth Score, identify missed opportunities, and receive actionable recommendations.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              'Instant Score',
              'Personalized Growth Recommendations',
              'Social Presence Analysis',
              'Free Growth Roadmap',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-softgray px-4 py-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3.5 w-3.5" /></span>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-navy-800"
          >
            Start Free Assessment <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">No sign-up required to take the assessment</p>
        </div>
      )}

      {/* Quiz */}
      {phase === 'quiz' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">DATAPULSE SOCIAL — Social Growth Assessment</p>
          <h3 className="text-xl font-bold text-navy-900 sm:text-2xl">{QUESTIONS[currentQ].text}</h3>

          <div className="mt-8 space-y-3">
            {QUESTIONS[currentQ].options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200 ${
                  selectedOption === i
                    ? 'border-gold-500 bg-gold-50 text-navy-900 shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-gold-300 hover:bg-softgray'
                }`}
              >
                <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  selectedOption === i ? 'border-gold-500 bg-gold-500 text-white' : 'border-slate-300'
                }`}>
                  {selectedOption === i && <Check className="h-3.5 w-3.5" />}
                </span>
                {option.label}
              </button>
            ))}
          </div>

          {currentQ > 0 && (
            <button
              onClick={handleBack}
              className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-navy-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>
      )}

      {/* Lead Capture */}
      {phase === 'lead-capture' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900">Your Results Are Ready</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Enter your information below to unlock your personalized Social Growth Score and recommendations.
            </p>
          </div>

          {submitError && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {submitError}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-softgray px-4 py-3 text-sm text-navy-900 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Business Name *</label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-softgray px-4 py-3 text-sm text-navy-900 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-softgray px-4 py-3 text-sm text-navy-900 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-softgray px-4 py-3 text-sm text-navy-900 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-softgray px-4 py-3 text-sm text-navy-900 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-softgray px-4 py-3 text-sm text-navy-900 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              />
            </div>

            <button
              onClick={handleSubmitLead}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-4 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:opacity-50"
            >
              {submitting ? 'Revealing...' : <>Reveal My Social Growth Score <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'results' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">DATAPULSE SOCIAL</p>
              <h3 className="mt-2 text-2xl font-bold text-navy-900">Your Social Growth Score</h3>

              <div className="mx-auto mt-8 flex flex-col items-center">
                <div className="flex items-end gap-1">
                  <span className="text-6xl font-bold text-navy-900">{score}</span>
                  <span className="mb-2 text-2xl font-medium text-slate-400">/ 100</span>
                </div>
                <span className={`mt-4 rounded-full px-4 py-1.5 text-sm font-semibold ${
                  tier.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  tier.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  tier.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {tier.label === 'High Priority Prospect' ? 'Needs Attention' :
                  tier.label === 'Growth Opportunity Prospect' ? 'Growth Opportunity' :
                  tier.label === 'Optimization Prospect' ? 'Optimizing' : 'Advanced'}
                </span>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">{tier.message}</p>
              </div>

              {/* Score meter */}
              <div className="mx-auto mt-8 max-w-md">
                <div className="mb-2 flex justify-between text-xs font-medium text-slate-400">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" style={{ width: `${score}%` }} />
                </div>
                <div className="relative mt-1">
                  <div className="absolute -top-4 transition-all duration-700" style={{ left: `calc(${score}% - 8px)` }}>
                    <span className="text-navy-900">▲</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities */}
          <div className="rounded-3xl border border-slate-200 bg-softgray p-8 sm:p-10">
            <h4 className="flex items-center gap-2 text-lg font-bold text-navy-900"><TrendingUp className="h-5 w-5 text-gold-600" /> Your Biggest Opportunities</h4>
            <div className="mt-6 space-y-4">
              {opportunities.map((opp, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">{i + 1}</span>
                  <p className="text-sm leading-relaxed text-slate-700">{opp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
            <h4 className="flex items-center gap-2 text-lg font-bold text-navy-900"><Sparkles className="h-5 w-5 text-gold-600" /> Recommended Next Steps</h4>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3.5 w-3.5" /></span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-3xl bg-navy-950 p-8 text-center text-white sm:p-12">
            <h4 className="text-xl font-bold">Want a Customized Growth Plan?</h4>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
              Book a complimentary 30-minute DATAPULSE SOCIAL Growth Analysis and discover what competitors are doing better, where you're losing potential customers, quick wins for immediate growth, and a custom 90-day marketing roadmap.
            </p>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3.5 text-sm font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-400"
            >
              Schedule My Free Growth Analysis <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="text-center">
            <button onClick={resetAssessment} className="text-sm font-medium text-slate-500 transition-colors hover:text-navy-900">
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
