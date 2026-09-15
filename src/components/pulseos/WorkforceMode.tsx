import { useState } from 'react';
import {
  ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronRight, ClipboardCheck,
  FileUp, HardHat, ShieldCheck, Sparkles, Wrench,
} from 'lucide-react';

type SetupStep = 'role' | 'competencies' | 'tasks' | 'evidence' | 'assets';

const steps: { key: SetupStep; label: string; prompt: string; placeholder: string }[] = [
  { key: 'role', label: 'Job role', prompt: 'What role needs to be qualified?', placeholder: 'e.g. Concrete Finisher' },
  { key: 'competencies', label: 'Competencies', prompt: 'What must this employee do safely and consistently?', placeholder: 'e.g. Read foundation layout plans and verify elevations' },
  { key: 'tasks', label: 'Tasks', prompt: 'What tools, procedures, and common mistakes matter?', placeholder: 'e.g. Set forms, place concrete, finish surfaces, inspect defects' },
  { key: 'evidence', label: 'Field verification', prompt: 'How will a supervisor know the employee is competent?', placeholder: 'e.g. Supervisor observation against a safety and quality checklist' },
  { key: 'assets', label: 'Training assets', prompt: 'What existing material should PulseOS build from?', placeholder: 'e.g. SOPs, safety manuals, job descriptions, or contractor specifications' },
];

export function WorkforceMode() {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<SetupStep, string>>({
    role: '', competencies: '', tasks: '', evidence: '', assets: '',
  });
  const [generated, setGenerated] = useState(false);
  const current = steps[stepIndex];
  const complete = values[current.key].trim().length > 0;

  const next = () => {
    if (!complete) return;
    if (stepIndex === steps.length - 1) setGenerated(true);
    else setStepIndex(stepIndex + 1);
  };

  if (generated) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10">
          <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300">
              <Sparkles className="h-3.5 w-3.5" /> Training pathway draft
            </div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{values.role || 'New role'} qualification package</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Review the proposed framework, then prepare the training pathway for supervisors and learners.</p>
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: 'Competency framework', description: values.competencies, icon: BriefcaseBusiness },
            { title: 'Task simulations', description: values.tasks, icon: Wrench },
            { title: 'Supervisor field verification', description: values.evidence, icon: ClipboardCheck },
            { title: 'Training assets', description: values.assets, icon: FileUp },
          ].map(card => (
            <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <card.icon className="h-5 w-5 text-gold-600" />
              <h2 className="mt-4 font-bold text-navy-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950">Approve draft <ArrowRight className="h-4 w-4" /></button>
          <button onClick={() => { setGenerated(false); setStepIndex(0); }} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-navy-800">Start another package</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300"><HardHat className="h-3.5 w-3.5" /> Workforce Mode</div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">Build job-ready training in 15 minutes.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">Start with the work people need to perform. PulseOS turns existing job knowledge into competency packages, task simulations, field verifications, and training assets.</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.6fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Qualification flow</p>
          <ol className="mt-4 space-y-1">
            {steps.map((step, index) => {
              const active = index === stepIndex;
              const done = index < stepIndex;
              return <li key={step.key} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? 'bg-navy-50 text-navy-900' : 'text-slate-500'}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${done ? 'bg-emerald-500 text-white' : active ? 'bg-gold-500 text-navy-950' : 'bg-slate-100 text-slate-500'}`}>{done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>{step.label}
              </li>;
            })}
          </ol>
          <div className="mt-6 rounded-xl bg-gold-50 p-4 text-xs leading-5 text-navy-800"><ShieldCheck className="mb-2 h-4 w-4 text-gold-700" />No instructional-design terminology required. UbD rigor stays behind the workflow.</div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Step {stepIndex + 1} of {steps.length}</p>
          <h2 className="mt-3 text-2xl font-bold text-navy-900">{current.prompt}</h2>
          <textarea value={values[current.key]} onChange={event => setValues({ ...values, [current.key]: event.target.value })} placeholder={current.placeholder} rows={6} className="mt-6 w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-700 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-100" />
          {current.key === 'assets' && <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500"><FileUp className="h-4 w-4" /> Document extraction will be connected to a secure upload workflow.</p>}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0} className="text-sm font-bold text-slate-500 disabled:opacity-40">Back</button>
            <button onClick={next} disabled={!complete} className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 disabled:cursor-not-allowed disabled:opacity-40">{stepIndex === steps.length - 1 ? 'Create pathway draft' : 'Continue'} <ChevronRight className="h-4 w-4" /></button>
          </div>
        </section>
      </div>
    </div>
  );
}
