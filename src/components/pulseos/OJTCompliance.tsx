import { ClipboardCheck, Clock3, FileCheck2, ShieldCheck, UserCheck } from 'lucide-react';

type StateProfile = {
  code: 'FL' | 'GA';
  name: string;
  agency: string;
  checklist: string[];
};

const stateProfiles: StateProfile[] = [
  {
    code: 'FL', name: 'Florida', agency: 'CareerSource Florida / local workforce board',
    checklist: ['Executed OJT agreement and training plan', 'Participant eligibility record', 'Timesheets with work activity and supervisor approval', 'Wage and reimbursement support', 'Progress review and completion record'],
  },
  {
    code: 'GA', name: 'Georgia', agency: 'Georgia Department of Labor / local workforce area',
    checklist: ['Executed OJT contract and individualized training plan', 'Participant eligibility and enrollment record', 'Payroll or time records with supervisor approval', 'Wage, reimbursement, and retention support', 'Progress review and exit or completion record'],
  },
];

export function OJTCompliance() {
  return <section className="space-y-6">
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
      <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" /><div><p className="text-xs font-bold uppercase tracking-wider text-sky-800">OJT compliance workspace</p><p className="mt-2 max-w-4xl text-sm leading-6 text-navy-900">Track trainee participation, work hours, supervisor approval, wage support, and program evidence in one auditable record. The checklist is configurable by program; confirm requirements with the applicable Florida or Georgia workforce agency before use.</p></div></div>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">{stateProfiles.map(profile => <article key={profile.code} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-gold-700">{profile.code} OJT profile</p><h2 className="mt-1 text-xl font-bold text-navy-900">{profile.name}</h2><p className="mt-1 text-xs text-slate-500">{profile.agency}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Configurable</span></div><ul className="mt-5 space-y-3">{profile.checklist.map(item => <li key={item} className="flex gap-3 text-sm text-navy-900"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></article>)}</div>

    <div className="grid gap-4 md:grid-cols-3">{[
      [Clock3, 'Hour ledger', 'Date, hours, activity, linked competency, trainee attestation, and supervisor approval.'],
      [UserCheck, 'Trainee record', 'Program, employer, supervisor, wage-at-start, dates, status, and required-hour target.'],
      [ClipboardCheck, 'Audit-ready evidence', 'Checklist status, document link, verifier, verification date, expiry, and notes.'],
    ].map(([Icon, title, detail]) => { const CardIcon = Icon as typeof Clock3; return <article key={title as string} className="rounded-2xl border border-slate-200 bg-white p-5"><CardIcon className="h-5 w-5 text-gold-700" /><p className="mt-3 font-bold text-navy-900">{title as string}</p><p className="mt-1 text-sm leading-6 text-slate-600">{detail as string}</p></article>; })}</div>

    <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-bold text-amber-950">Program setup sequence</p><ol className="mt-2 grid gap-2 text-sm text-amber-900 sm:grid-cols-2 lg:grid-cols-4"><li>1. Create the state-specific OJT program.</li><li>2. Enroll the trainee and assign supervisor.</li><li>3. Record and approve daily hours.</li><li>4. Verify each required evidence item.</li></ol></article>
  </section>;
}
