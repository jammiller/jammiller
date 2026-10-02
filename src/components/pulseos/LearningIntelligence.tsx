import { useMemo, useState } from 'react';
import { Accessibility, ArrowRight, BarChart3, BookOpenCheck, Brain, CheckCircle2, ClipboardList, Compass, Lightbulb, Sparkles, UsersRound } from 'lucide-react';

type LearningTool = 'overview' | 'lvi' | 'course-design' | 'assessment' | 'accessibility' | 'analytics';
type Profile = {
  audience: string;
  attention: string;
  communication: string;
  executiveFunction: string;
  access: string;
  assessment: string;
};

const tools: { label: string; description: string; href: string; icon: typeof Brain }[] = [
  { label: 'Learner Variability Intelligence', description: 'Build an LVI profile and design recommendations.', href: '/learning-intelligence/lvi', icon: Brain },
  { label: 'Course Design Copilot', description: 'Open the working UbD course builder.', href: '/course-builder', icon: BookOpenCheck },
  { label: 'Assessment Architect', description: 'Open PulseOS assessments for the current course.', href: '/course-builder/assessments', icon: ClipboardList },
  { label: 'Accessibility Planner', description: 'Use the guided LVI intake to remove barriers.', href: '/learning-intelligence/lvi', icon: Accessibility },
  { label: 'Learning Analytics', description: 'Open learning analytics for the current course.', href: '/course-builder/analytics', icon: BarChart3 },
];

const initialProfile: Profile = {
  audience: 'Adult workforce learners',
  attention: 'Short, focused learning blocks with explicit priorities',
  communication: 'Plain-language instructions with visual examples',
  executiveFunction: 'Checklists, milestones, and visible next steps',
  access: 'Mobile-friendly materials with captions and downloadable resources',
  assessment: 'Choice of written, verbal, or performance-based demonstration',
};

export function LearningIntelligence({ initialTool = 'overview' }: { initialTool?: LearningTool }) {
  const [tool, setTool] = useState<LearningTool>(initialTool);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const recommendations = useMemo(() => [
    `Organize ${profile.audience.toLowerCase()} into short modules with a clear purpose and one visible next step.`,
    `Use ${profile.communication.toLowerCase()} so instructions are easy to find and act on.`,
    `Support planning with ${profile.executiveFunction.toLowerCase()}.`,
    `Offer ${profile.assessment.toLowerCase()} to measure learning without unnecessary barriers.`,
  ], [profile]);

  const navigate = (next: LearningTool) => {
    setTool(next);
    window.history.pushState({}, '', next === 'overview' ? '/learning-intelligence' : `/learning-intelligence/${next === 'lvi' ? 'lvi' : next}`);
  };

  return <div className="space-y-6">
    <header className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10">
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="relative max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-gold-300"><span>PulseOS</span><span className="text-white/30">/</span><span>Learning Intelligence</span></div>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">Design learning around the people who will experience it.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">Learning Intelligence turns learner context into practical course, assessment, and accessibility decisions—without requiring diagnostic labels or machine learning to get started.</p>
        <div className="mt-6 flex flex-wrap gap-3"><a href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"><UsersRound className="h-4 w-4" /> Workforce Intelligence</a><button onClick={() => navigate('lvi')} className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400"><Brain className="h-4 w-4" /> Open LVI</button></div>
      </div>
    </header>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {tools.map(({ label, description, href, icon: Icon }) => <a key={label} href={href} className={`rounded-2xl border p-5 text-left transition ${href === '/learning-intelligence/lvi' && tool === 'lvi' ? 'border-gold-400 bg-gold-50 shadow-sm' : 'border-slate-200 bg-white hover:border-gold-300'}`}><Icon className="h-5 w-5 text-gold-700" /><p className="mt-4 text-sm font-bold text-navy-900">{label}</p><p className="mt-2 text-xs leading-5 text-slate-600">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-navy-900">Open <ArrowRight className="h-3.5 w-3.5" /></span></a>)}
    </section>

    {tool === 'overview' && <Overview onOpenLvi={() => navigate('lvi')} />}
    {tool === 'lvi' && <LviWorkspace profile={profile} onChange={setProfile} recommendations={recommendations} />}
  </div>;
}

function Overview({ onOpenLvi }: { onOpenLvi: () => void }) {
  return <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-wider text-gold-700">The second PulseOS pillar</p><h2 className="mt-2 text-2xl font-bold text-navy-900">What should be taught? How should it be taught?</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><Pillar title="Workforce Intelligence" question="What should be taught?" rows={['Competencies', 'Jobs', 'Skills gaps', 'Career pathways']} icon={UsersRound} /><Pillar title="Learning Intelligence" question="How should it be taught?" rows={['Learners', 'Learning experiences', 'Learning variability', 'Course design']} icon={Lightbulb} /></div><button onClick={onOpenLvi} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-navy-900 hover:text-gold-700">Start a Learner Variability Profile <ArrowRight className="h-4 w-4" /></button></article>
    <article className="rounded-2xl bg-slate-50 p-6 sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700"><Compass className="h-5 w-5" /></div><h2 className="mt-5 text-xl font-bold text-navy-900">A practical launch path</h2><ol className="mt-5 space-y-4">{['Describe the audience and their learning context.', 'Build a learner variability profile around needs, strengths, and access.', 'Use the profile in your existing UbD design workflow.', 'Select accessible instructional and assessment options.'].map((step, index) => <li key={step} className="flex gap-3 text-sm text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{index + 1}</span>{step}</li>)}</ol></article>
  </section>;
}

function Pillar({ title, question, rows, icon: Icon }: { title: string; question: string; rows: string[]; icon: typeof Brain }) {
  return <div className="rounded-xl border border-slate-200 p-4"><Icon className="h-5 w-5 text-gold-700" /><p className="mt-3 text-sm font-bold text-navy-900">{title}</p><p className="mt-1 text-xs font-semibold text-gold-700">{question}</p><ul className="mt-4 space-y-2">{rows.map(row => <li key={row} className="text-sm text-slate-600">{row}</li>)}</ul></div>;
}

function LviWorkspace({ profile, onChange, recommendations }: { profile: Profile; onChange: (profile: Profile) => void; recommendations: string[] }) {
  const [showIntake, setShowIntake] = useState(true);
  const fields: { key: keyof Profile; label: string; hint: string }[] = [
    { key: 'audience', label: 'Audience', hint: 'Who are the learners?' },
    { key: 'attention', label: 'Attention', hint: 'What helps learners focus and engage?' },
    { key: 'communication', label: 'Communication', hint: 'How should information be presented?' },
    { key: 'executiveFunction', label: 'Executive function', hint: 'What supports planning and follow-through?' },
    { key: 'access', label: 'Accessibility and access', hint: 'What access needs should the design address?' },
    { key: 'assessment', label: 'Assessment preferences', hint: 'How can learners demonstrate understanding?' },
  ];
  return <section className="space-y-6">
    {showIntake && <LviIntake onComplete={(nextProfile) => { onChange(nextProfile); setShowIntake(false); }} />}
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Brain className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-gold-700">Learner Variability Intelligence</p><h2 className="mt-1 text-2xl font-bold text-navy-900">Learner Variability Profile</h2><p className="mt-2 text-sm leading-6 text-slate-600">Use observable learning preferences and support requirements—not diagnoses—to guide design choices.</p></div></div><button onClick={() => setShowIntake(!showIntake)} className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-navy-900 hover:bg-slate-50">{showIntake ? 'Hide intake' : 'Redo guided intake'}</button></div><div className="mt-7 grid gap-5">{fields.map(({ key, label, hint }) => <label key={key} className="block"><span className="text-sm font-bold text-navy-900">{label}</span><span className="mt-1 block text-xs text-slate-500">{hint}</span><textarea value={profile[key]} onChange={event => onChange({ ...profile, [key]: event.target.value })} rows={2} className="field mt-2 resize-y" /></label>)}</div></article>
      <aside className="space-y-6"><article className="rounded-2xl bg-navy-950 p-6 text-white"><Sparkles className="h-5 w-5 text-gold-400" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-gold-300">Course design recommendations</p><h2 className="mt-2 text-xl font-bold">Design choices based on this profile</h2><ul className="mt-5 space-y-4">{recommendations.map(recommendation => <li key={recommendation} className="flex gap-3 text-sm leading-6 text-slate-200"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold-400" />{recommendation}</li>)}</ul></article><article className="rounded-2xl border border-gold-200 bg-gold-50 p-6"><BookOpenCheck className="h-5 w-5 text-gold-700" /><p className="mt-3 text-sm font-bold text-navy-900">Ready to build the course?</p><p className="mt-2 text-sm leading-6 text-slate-700">Open the UbD course builder and use this profile in Stage 3 learning experiences and Stage 2 assessments.</p><a href="/course-builder" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800">Open course builder <ArrowRight className="h-4 w-4" /></a></article></aside>
    </div>
  </section>;
}

function LviIntake({ onComplete }: { onComplete: (profile: Profile) => void }) {
  const questions: { key: keyof Omit<Profile, 'audience'>; question: string; options: string[] }[] = [
    { key: 'attention', question: 'When attention is stretched, what helps this group most?', options: ['Short, focused learning blocks with explicit priorities', 'Interactive practice and frequent chances to apply learning', 'Quiet reflection time and clear reading materials'] },
    { key: 'communication', question: 'How should course instructions be presented?', options: ['Plain-language instructions with visual examples', 'Live discussion with written follow-up', 'Detailed written guidance learners can review independently'] },
    { key: 'executiveFunction', question: 'What helps learners stay organized and complete work?', options: ['Checklists, milestones, and visible next steps', 'Regular facilitator check-ins and reminders', 'Flexible pacing with a suggested learning plan'] },
    { key: 'access', question: 'What access option should be available by default?', options: ['Mobile-friendly materials with captions and downloadable resources', 'Screen-reader-ready content and keyboard navigation', 'Low-bandwidth resources that can be used offline'] },
    { key: 'assessment', question: 'How should learners be able to show what they know?', options: ['Choice of written, verbal, or performance-based demonstration', 'Hands-on demonstration with a practical rubric', 'Short knowledge checks with time to review feedback'] },
  ];
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState('Adult workforce learners');
  const [answers, setAnswers] = useState<Partial<Profile>>({});
  const current = questions[step - 1];
  return <article className="rounded-2xl border-2 border-gold-400 bg-gold-50 p-6 sm:p-8"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400"><Compass className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-gold-700">Guided LVI intake</p><h2 className="mt-1 text-xl font-bold text-navy-900">Answer five plain-language questions</h2><p className="mt-1 text-sm text-slate-600">This is a course-design intake, not a diagnostic or assessment of an individual learner.</p></div></div>{step === 0 && <label className="mt-6 block"><span className="text-sm font-bold text-navy-900">Who is this course for?</span><input value={audience} onChange={event => setAudience(event.target.value)} className="field mt-2" placeholder="For example: first-year college students" /><button onClick={() => setStep(1)} disabled={!audience.trim()} className="button mt-4">Start questions <ArrowRight className="h-4 w-4" /></button></label>}{step > 0 && <div className="mt-6"><p className="text-xs font-bold uppercase tracking-wider text-gold-700">Question {step} of {questions.length}</p><h3 className="mt-2 text-lg font-bold text-navy-900">{current.question}</h3><div className="mt-4 grid gap-3">{current.options.map(option => <button key={option} onClick={() => { const nextAnswers = { ...answers, [current.key]: option }; setAnswers(nextAnswers); if (step === questions.length) onComplete({ ...initialProfile, audience, ...nextAnswers }); else setStep(step + 1); }} className="rounded-xl border border-slate-300 bg-white p-4 text-left text-sm font-semibold text-navy-900 hover:border-gold-400 hover:bg-gold-50">{option}</button>)}</div><button onClick={() => setStep(step - 1)} className="mt-4 text-sm font-bold text-slate-600 hover:text-navy-900">Back</button></div>}</article>;
}
