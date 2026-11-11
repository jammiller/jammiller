import { ArrowRight, Brain, CheckCircle2 } from 'lucide-react';

type Stage = 1 | 2 | 3;

const guidance: Record<Stage, { title: string; prompt: string; checks: string[] }> = {
  1: {
    title: 'Desired Results',
    prompt: 'Keep the outcome clear while allowing different paths to understanding.',
    checks: ['Use plain-language goals alongside technical terms.', 'Name essential questions before adding content.', 'Separate the learning goal from the way a learner shows it.'],
  },
  2: {
    title: 'Evidence',
    prompt: 'Measure the intended learning—not reading speed, processing speed, or format preference.',
    checks: ['Offer written, verbal, or performance-based evidence when appropriate.', 'Use transparent criteria and examples of quality.', 'Build in feedback and a chance to revise.'],
  },
  3: {
    title: 'Learning Plan',
    prompt: 'Remove barriers before the first learning activity begins.',
    checks: ['Break learning into visible, manageable steps.', 'Pair plain language with visuals or worked examples.', 'Provide predictable structure, captions, and accessible resources.'],
  },
};

export function LviDesignCompanion({ stage }: { stage: Stage }) {
  const current = guidance[stage];
  return <aside className="h-fit rounded-2xl border border-gold-200 bg-gold-50 p-5 xl:sticky xl:top-24">
    <div className="flex items-center gap-2 text-gold-700"><Brain className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">LVI alongside UbD</span></div>
    <h3 className="mt-3 text-lg font-bold text-navy-900">Stage {stage}: {current.title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-700">{current.prompt}</p>
    <ul className="mt-5 space-y-3">{current.checks.map(check => <li key={check} className="flex gap-2 text-sm leading-5 text-navy-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />{check}</li>)}</ul>
    <a href="/learning-intelligence/lvi" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy-900 hover:text-gold-700">Open guided LVI intake <ArrowRight className="h-4 w-4" /></a>
  </aside>;
}
