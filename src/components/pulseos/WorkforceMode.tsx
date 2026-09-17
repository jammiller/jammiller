import { useMemo, useState } from 'react';
import { Award, CheckCircle2, ClipboardCheck, FileCheck2, HardHat, Layers3, ShieldCheck, Users, Wrench, Clock3 } from 'lucide-react';
import { OJTCompliance } from './OJTCompliance';
import { competencies, roles, workers, type CompetencyDomain } from '../../lib/competency-foundation';

type WorkforceView = 'library' | 'roles' | 'passport' | 'ojt';

const domains: CompetencyDomain[] = ['Safety', 'Technical', 'Quality', 'Productivity', 'Leadership', 'Professional Behaviors'];

export function WorkforceMode() {
  const [view, setView] = useState<WorkforceView>('library');
  const [domain, setDomain] = useState<CompetencyDomain | 'All'>('All');
  const [selectedId, setSelectedId] = useState(competencies[0].id);
  const selected = competencies.find(item => item.id === selectedId) ?? competencies[0];
  const visible = domain === 'All' ? competencies : competencies.filter(item => item.domain === domain);
  const worker = workers[0];
  const verified = worker.competencies.filter(item => item.verified).length;
  const selectedRole = useMemo(() => roles.find(role => role.title === worker.role) ?? roles[0], [worker.role]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300"><HardHat className="h-3.5 w-3.5" /> The Design-and-Evidence Layer</div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">Design training against the standards you are accountable to—and prove readiness with evidence.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">PulseOS connects standards, curriculum, OJT, assessments, and field evidence so workforce programs can measure readiness—not just completion.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Standards-to-curriculum map', 'Translate the standards, program outcomes, and job requirements you own into an intentional learning design.'],
              ['Design across classroom and OJT', 'Connect instruction, assessments, work activities, and competency milestones in one curriculum architecture.'],
              ['Evidence of readiness', 'Capture assessments, observations, approved OJT hours, and supervisor validation—not just completion.'],
              ['Accountability visibility', 'See which standards have evidence, where gaps remain, and what needs attention before review.'],
              ['Complements your stack', 'Use PulseOS alongside content libraries, engagement platforms, and compliance systems—the design and evidence layer they lack.'],
            ].map(([title, detail]) => <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs font-bold text-gold-300">{title}</p><p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p></div>)}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:p-6">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" /><div><p className="text-xs font-bold uppercase tracking-wider text-gold-800">PulseOS standards-to-evidence framework</p><p className="mt-2 max-w-4xl text-sm leading-6 text-navy-900">PulseOS is the design-and-evidence layer for workforce programs: align curriculum to accountable standards, define what proficiency looks like, and retain evidence that learners are ready. It complements—not replaces—content providers, engagement tools, and compliance systems. Customers remain responsible for their applicable compliance obligations and competent-person designations.</p></div></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={Layers3} label="Competency library" value={competencies.length} detail="Construction accelerator" />
        <Metric icon={ShieldCheck} label="Verified for James Carter" value={`${verified}/${worker.competencies.length}`} detail="Evidence-backed competencies" />
        <Metric icon={Users} label="Role readiness" value="75%" detail={`${selectedRole.title} requirements met`} />
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {([
          ['library', 'Competency Library', Layers3],
          ['roles', 'Role Builder', Wrench],
          ['passport', 'Competency Passport', Award],
          ['ojt', 'OJT & Compliance', Clock3],
        ] as const).map(([key, label, Icon]) => <button key={key} onClick={() => setView(key)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${view === key ? 'bg-navy-900 text-white shadow-lg' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-navy-900'}`}><Icon className="h-4 w-4" />{label}</button>)}
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-gold-700" /><div><p className="font-bold text-navy-900">Foreman field-validation checklist</p><p className="text-xs text-slate-500">Use this review before representing the accelerator as field-validated.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
          ['Work relevance', 'Do the tasks match how the crew actually performs the work?'],
          ['Level accuracy', 'Are proficiency levels appropriate for the role and experience band?'],
          ['Evidence standard', 'Would the stated evidence prove capability—not only course completion?'],
          ['Site alignment', 'What site, trade, owner, union, or customer requirements must be added?'],
        ].map(([title, detail]) => <div key={title} className="rounded-xl bg-slate-50 p-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><p className="mt-2 text-sm font-bold text-navy-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p></div>)}</div>
      </section>

      {view === 'library' && <section className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Construction taxonomy</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['All', ...domains] as const).map(item => <button key={item} onClick={() => setDomain(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${domain === item ? 'bg-gold-500 text-navy-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>)}
          </div>
          <div className="mt-5 space-y-2">
            {visible.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-4 text-left transition ${selected.id === item.id ? 'border-gold-400 bg-gold-50' : 'border-slate-200 hover:border-slate-300'}`}><p className="text-xs font-bold uppercase tracking-wide text-gold-700">{item.domain}</p><p className="mt-1 font-bold text-navy-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.id} · Level {item.proficiencyLevel}</p></button>)}
          </div>
        </aside>
        <CompetencyDetail />
      </section>}

      {view === 'roles' && <section className="grid gap-4 lg:grid-cols-3">{roles.map(role => <article key={role.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-gold-700">{role.occupation}</p><h2 className="mt-2 text-xl font-bold text-navy-900">{role.title}</h2><p className="mt-2 text-sm text-slate-500">A role is a collection of competency requirements—not a static job description.</p><div className="mt-5 space-y-3">{role.requirements.map(requirement => { const competency = competencies.find(item => item.id === requirement.competencyId); return <div key={requirement.competencyId} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-sm font-semibold text-navy-900">{competency?.title}</span><span className="rounded-full bg-navy-900 px-2.5 py-1 text-xs font-bold text-white">Level {requirement.level}</span></div>; })}</div></article>)}</section>}

      {view === 'ojt' && <OJTCompliance />}

      {view === 'passport' && <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><article className="rounded-2xl bg-navy-950 p-7 text-white"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><Users className="h-6 w-6" /></div><h2 className="mt-5 text-2xl font-bold">{worker.name}</h2><p className="mt-1 text-sm text-slate-300">{worker.role} · Construction</p><div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-3xl font-bold text-gold-400">{verified}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-300">Verified competencies</p></div><p className="mt-6 text-sm leading-6 text-slate-300">Portable competency transcript with evidence and verification status attached to every qualification.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Evidence-backed readiness</p><div className="mt-5 space-y-3">{worker.competencies.map(record => { const competency = competencies.find(item => item.id === record.competencyId); return <div key={record.competencyId} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${record.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{record.verified ? <CheckCircle2 className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><p className="font-bold text-navy-900">{competency?.title}</p><p className="text-xs text-slate-500">Level {record.level} · {record.evidenceCount} evidence item{record.evidenceCount === 1 ? '' : 's'}</p></div><span className={`text-xs font-bold ${record.verified ? 'text-emerald-700' : 'text-amber-700'}`}>{record.verified ? 'Verified' : 'In review'}</span></div>; })}</div></article></section>}
    </div>
  );

  function CompetencyDetail() {
    const dimensions = [
      ['Knowledge', selected.knowledge], ['Skills', selected.skills], ['Experience', selected.experience], ['Behaviors', selected.behaviors], ['Tasks', selected.tasks], ['Accepted evidence', selected.evidence],
    ];
    return <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-gold-700">{selected.industry} · {selected.domain}</p><h2 className="mt-2 text-2xl font-bold text-navy-900">{selected.title}</h2></div><span className="rounded-full bg-navy-900 px-3 py-1.5 text-xs font-bold text-white">Target level {selected.proficiencyLevel}</span></div><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{selected.description}</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{dimensions.map(([label, items]) => <div key={label as string} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label as string}</p><ul className="mt-3 space-y-2">{(items as string[]).map(item => <li key={item} className="flex gap-2 text-sm text-navy-900"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />{item}</li>)}</ul></div>)}</div></article>;
  }
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Layers3; label: string; value: string | number; detail: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Icon className="h-5 w-5" /></div><p className="mt-4 text-3xl font-bold text-navy-900">{value}</p><p className="mt-1 text-sm font-bold text-slate-700">{label}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>;
}
