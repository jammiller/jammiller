import { useMemo, useState } from 'react';
import { Award, CheckCircle2, ClipboardCheck, HardHat, Layers3, ShieldCheck, Users, Wrench, Clock3 } from 'lucide-react';
import { OJTCompliance } from './OJTCompliance';
import { competencies, roles, workers, type CompetencyDomain } from '../../lib/competency-foundation';

type WorkforceView = 'library' | 'roles' | 'passport' | 'ojt';

const domains: CompetencyDomain[] = ['Safety', 'Technical', 'Quality', 'Productivity', 'Leadership', 'Professional Behaviors'];

export function WorkforceMode({ initialView = 'library' }: { initialView?: WorkforceView }) {
  const [view, setView] = useState<WorkforceView>(initialView);
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
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300"><HardHat className="h-3.5 w-3.5" /> Competency-First Workforce OS</div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">Readiness is proven by evidence, not course completion.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">Industry → Occupation → Role → Competency → Task. Build reusable competency requirements, verify them in the field, and see the workforce gaps that affect delivery.</p>
          <div className="mt-6 flex flex-wrap gap-3"><a href="/" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">Workforce Intelligence</a></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['OSHA-aligned qualification', 'Competent-person and training requirements translated into practical work requirements.'],
              ['SKEB competency model', 'Skills, knowledge, experience, and behaviors are defined for each competency.'],
              ['Evidence-based validation', 'Training alone is not verification—field evidence and assessment establish readiness.'],
              ['Role-to-task design', 'Roles are built from the competencies and tasks people must perform.'],
              ['Workforce intelligence', 'Verified competency data exposes readiness gaps by role, crew, and project.'],
            ].map(([title, detail]) => <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs font-bold text-gold-300">{title}</p><p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p></div>)}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:p-6">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" /><div><p className="text-xs font-bold uppercase tracking-wider text-gold-800">PulseOS Competency Library</p><p className="mt-1 text-sm text-slate-700">A OSHA-aligned, construction-industry competency model built for field validation. Start with a competency, then map it to roles, tasks, and evidence standards.</p></div></div>
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
        ] as const).map(([key, label, Icon]) => <button key={key} onClick={() => setView(key)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${view === key ? 'border-b-2 border-gold-500 text-gold-700' : 'border-b-2 border-transparent text-slate-600 hover:text-navy-900'}`}><Icon className="h-4 w-4" />{label}</button>)}
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-gold-700" /><div><p className="font-bold text-navy-900">Foreman field-validation checklist</p><p className="text-sm text-slate-600">Validate competency evidence in the field to ensure training translates to real readiness.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
          ['Work relevance', 'Do the tasks match how the crew actually performs the work?'],
          ['Level accuracy', 'Are proficiency levels appropriate for the role and experience band?'],
          ['Evidence standard', 'Would the stated evidence prove capability—not only course completion?'],
          ['Site alignment', 'What site, trade, owner, union, or customer requirements must be added?'],
        ].map(([title, detail]) => <div key={title} className="rounded-xl bg-slate-50 p-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><p className="mt-2 text-sm font-bold text-navy-900">{title}</p><p className="mt-1 text-xs text-slate-600">{detail}</p></div>)}</div>
      </section>

      {view === 'library' && <section className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Construction taxonomy</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['All', ...domains] as const).map(item => <button key={item} onClick={() => setDomain(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${domain === item ? 'bg-gold-500 text-navy-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>)}
          </div>
          <div className="mt-5 space-y-2">
            {visible.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-4 text-left transition ${selected.id === item.id ? 'border-gold-500 bg-gold-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}><p className="text-sm font-bold text-navy-900">{item.name}</p><p className="text-xs text-slate-500">{item.domain}</p></button>)}
          </div>
        </aside>
        <CompetencyDetail />
      </section>}

      {view === 'roles' && <section className="grid gap-4 lg:grid-cols-3">{roles.map(role => <article key={role.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-gold-700">{role.title}</p><p className="mt-3 text-sm font-bold text-navy-900">{role.description}</p><div className="mt-4 flex flex-wrap gap-2">{role.competencies.slice(0, 3).map(c => <span key={c} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{competencies.find(comp => comp.id === c)?.name}</span>)}</div></article>)}</section>}

      {view === 'ojt' && <OJTCompliance />}

      {view === 'passport' && <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><article className="rounded-2xl bg-navy-950 p-7 text-white"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950"><Award className="h-6 w-6" /></div><p className="mt-4 text-xs font-bold uppercase tracking-wider text-gold-300">James Carter</p><p className="mt-1 text-2xl font-bold">Competency Passport</p><p className="mt-3 text-sm text-slate-300">{verified} of {worker.competencies.length} competencies verified through field evidence.</p><div className="mt-6 space-y-3">{worker.competencies.map(comp => <div key={comp.competencyId} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-sm font-bold text-slate-100">{competencies.find(c => c.id === comp.competencyId)?.name}</span><span className={`text-xs font-bold ${comp.verified ? 'text-emerald-400' : 'text-slate-400'}`}>{comp.verified ? 'Verified' : 'In progress'}</span></div>)}</div></article><article className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Next verification checkpoint</p><p className="mt-3 text-sm font-bold text-navy-900">Quality: Workmanship accuracy</p><p className="mt-2 text-sm text-slate-600">Verify evidence of quality control in completed work. Evidence: Inspection photos, supervisor sign-off, customer feedback.</p><button className="mt-5 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400">Schedule field verification</button></article></section>}
    </div>
  );

  function CompetencyDetail() {
    const dimensions = [
      ['Knowledge', selected.knowledge], ['Skills', selected.skills], ['Experience', selected.experience], ['Behaviors', selected.behaviors], ['Tasks', selected.tasks], ['Accepted evidence', selected.acceptedEvidence],
    ];
    return <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-gold-700">{selected.domain}</p><h2 className="mt-2 text-2xl font-bold text-navy-900">{selected.name}</h2></div><span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-700">{selected.level}</span></div><p className="mt-4 text-sm leading-6 text-slate-700">{selected.description}</p><div className="mt-8 space-y-6">{dimensions.map(([label, content]) => <div key={label}><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-sm leading-6 text-slate-700">{content}</p></div>)}</div></article>;
  }
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Layers3; label: string; value: string | number; detail: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Icon className="h-5 w-5" /></div><p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-navy-900">{value}</p><p className="text-xs text-slate-600">{detail}</p></article>;
}
