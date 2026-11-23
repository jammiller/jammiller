import { ProgramHeader, ProgramFooter } from './ConstructionReadiness';

export function OJTPublicPage() {
  return <div className="min-h-screen bg-softgray text-navy-950">
    <ProgramHeader sectionBase="/construction-workforce-readiness" />
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="text-sm font-bold uppercase tracking-widest text-gold-800">Learning through evidence</p>
      <h1 className="mt-4 text-4xl font-bold">OJT &amp; Compliance</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">On-the-job training connects what you learn with what you can demonstrate in the field. PulseOS supports competency evidence, supervisor observation, and approved training hours.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">{[
        ['Practice the work', 'Connect construction competencies to work activities and practical demonstrations.'],
        ['Retain evidence', 'Document knowledge assessments, field evidence, and supervisor observations that establish readiness.'],
        ['Track requirements', 'Program administrators manage applicable training requirements, approved hours, and evidence status in a private workspace.'],
      ].map(([title, detail]) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{detail}</p></section>)}</div>
      <p className="mt-8 max-w-3xl text-base leading-7 text-slate-600">PulseOS records evidence; it does not certify eligibility or replace agency review. Program requirements must be confirmed with the sponsoring workforce agency. Private trainee, wage, approval, and evidence records remain restricted to authorized administrators.</p>
      <div className="mt-8 flex flex-wrap gap-5">
        <a className="rounded-xl bg-gold-500 px-5 py-3 font-bold hover:bg-gold-400" href="https://pulseosplatform.com/construction-workforce-readiness">Start Your Training</a>
        <a className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-white" href="/ojt-workspace">Administrator sign-in</a>
      </div>
    </main>
    <ProgramFooter sectionBase="/construction-workforce-readiness" />
  </div>;
}
