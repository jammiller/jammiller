import { ArrowRight, Brain, BookOpenCheck, HardHat, Layers3 } from 'lucide-react';

export function PulseOSLanding() {
  return <main className="min-h-screen bg-softgray px-4 py-6 sm:px-6 sm:py-10">
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-navy-950 p-7 text-white shadow-2xl sm:p-12">
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-20" />
      <div className="relative">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-navy-950"><Layers3 className="h-5 w-5" /></span><div><p className="text-sm font-bold tracking-wide">PulseOS</p><p className="text-xs text-gold-300">Intelligence for how people work and learn</p></div></div>
        <div className="mt-12 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Choose your workspace</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">Build workforce readiness or learner-centered courses.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">PulseOS connects what people need to do with how learning is designed. Start in the workspace that matches today’s work.</p></div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <a href="/workforce" className="group rounded-2xl border border-white/15 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-gold-400 hover:bg-white/10 hover:shadow-xl"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><HardHat className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-gold-300 transition group-hover:translate-x-1" /></div><p className="mt-8 text-xs font-bold uppercase tracking-wider text-gold-300">Workforce Intelligence</p><h2 className="mt-2 text-2xl font-bold">Workforce Mode</h2><p className="mt-3 text-sm leading-6 text-slate-300">Define competencies, map roles, validate evidence, and identify readiness gaps.</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">Open Workforce Mode <ArrowRight className="h-4 w-4" /></span></a>
          <a href="/learning-intelligence/lvi" className="group rounded-2xl border-2 border-gold-400 bg-gold-500 p-7 text-navy-950 transition hover:-translate-y-1 hover:bg-gold-400 hover:shadow-xl"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-950 text-gold-400"><Brain className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></div><p className="mt-8 text-xs font-bold uppercase tracking-wider text-navy-800">Learning Intelligence</p><h2 className="mt-2 text-2xl font-bold">Neurodivergent Course Builder</h2><p className="mt-3 text-sm leading-6 text-navy-800">Use the LVI intake, then build an accessible UbD course around how learners learn best.</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold">Start learner-centered course design <ArrowRight className="h-4 w-4" /></span></a>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-300"><BookOpenCheck className="h-4 w-4 text-gold-300" /><span>Both paths connect to the UbD course framework when you are ready to design instruction.</span></div>
      </div>
    </section>
  </main>;
}
