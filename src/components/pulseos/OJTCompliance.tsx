import { FormEvent, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, ClipboardCheck, Clock3, FileCheck2, Loader2, LockKeyhole, Plus, ShieldCheck, Upload, UserCheck, type LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { usePulseOSAuth } from './usePulseOSAuth';
import { useOJTData } from './useOJTData';
import type { EvidenceStatus, OJTState } from '../../lib/pulseos-ojt-types';

const today = () => new Date().toISOString().slice(0, 10);
const evidenceStatuses: EvidenceStatus[] = ['missing', 'in_review', 'verified', 'expired', 'waived'];

export function OJTCompliance() {
  const { user, role, loading: authLoading, signIn, signUp, claimFirstAdmin, canClaimAdmin, signOut, passwordRecovery, updatePassword } = usePulseOSAuth();
  const isAdmin = role === 'admin';
  const data = useOJTData(isAdmin);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  const notify = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(null), 4500); };
  const save = async (action: () => PromiseLike<{ error: { message: string } | null }>, success: string) => {
    setSaving(true);
    try {
      const result = await action();
      if (result && result.error) throw result.error;
      notify(success);
      await data.refetch();
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Unable to save this record.';
      notify(message);
    } finally { setSaving(false); }
  };

  if (authLoading) return <LoadingCard label="Checking workspace access…" />;
  if (passwordRecovery) {
    return <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <LockKeyhole className="h-6 w-6 text-gold-700" />
      <h2 className="mt-3 text-xl font-bold text-navy-900">Set a new password</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Choose a new password for your PulseOS account.</p>
      <form className="mt-5 space-y-3" onSubmit={async (event) => { event.preventDefault(); if (newPassword !== confirmPassword) { notify('Passwords do not match.'); return; } const result = await updatePassword(newPassword); if (result.error) { notify(result.error); return; } await signOut(); }}>
        <input required minLength={6} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (6+ characters)" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <input required minLength={6} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <button className="w-full rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Update password</button>
      </form>
      {message && <p className="mt-3 text-sm text-rose-700">{message}</p>}
    </section>;
  }
  if (!user || !isAdmin) {
    return <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <LockKeyhole className="h-6 w-6 text-gold-700" />
      <h2 className="mt-3 text-xl font-bold text-navy-900">Secure OJT workspace</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">OJT records include trainee, wage, approval, and evidence data. Only a provisioned PulseOS administrator can access this workspace.</p>
      {!user ? <>
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-bold text-slate-600"><button type="button" onClick={() => setAuthMode('signin')} className={`rounded-lg px-3 py-2 ${authMode === 'signin' ? 'bg-white text-navy-900 shadow-sm' : ''}`}>Sign in</button><button type="button" onClick={() => setAuthMode('signup')} className={`rounded-lg px-3 py-2 ${authMode === 'signup' ? 'bg-white text-navy-900 shadow-sm' : ''}`}>Create account</button></div>
        <form className="mt-4 space-y-3" onSubmit={async (event) => { event.preventDefault(); const result = await (authMode === 'signin' ? signIn : signUp)(email, password); if (result.error) notify(result.error); else if (authMode === 'signup') notify('Account created. Complete the administrator setup prompt after sign-in.'); }}>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Administrator email" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ characters)" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <button className="w-full rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">{authMode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>
        {authMode === 'signin' && <button type="button" disabled={resettingPassword} onClick={async () => { if (!email.trim()) { notify('Enter your email address first.'); return; } setResettingPassword(true); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://pulseosplatform.com/pulseos' }); setResettingPassword(false); notify(error?.message ?? 'Password reset link sent. Check your email.'); }} className="mt-3 text-sm font-bold text-navy-800 underline disabled:opacity-50">{resettingPassword ? 'Sending reset link...' : 'Reset password by email'}</button>}
      </> : <><p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">This account is not an OJT administrator.</p>{canClaimAdmin ? <button onClick={async () => { const claimed = await claimFirstAdmin(); notify(claimed ? 'Administrator access enabled.' : 'Administrator access is already assigned.'); }} className="mt-4 w-full rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white">Claim administrator access</button> : <p className="mt-3 text-sm text-slate-600">Ask an existing PulseOS administrator to provision your account.</p>}<button onClick={signOut} className="mt-4 text-sm font-bold text-navy-800 underline">Sign out</button></>}
      {message && <p className="mt-3 text-sm text-rose-700">{message}</p>}
    </section>;
  }

  const enrollmentHours = (id: string) => data.hours.filter(entry => entry.enrollment_id === id).reduce((sum, entry) => sum + Number(entry.hours), 0);
  const activeEnrollment = data.enrollments.find(item => item.id === selectedEnrollmentId) ?? data.enrollments.find(item => item.status === 'active') ?? data.enrollments[0];
  const programFor = (id: string) => data.programs.find(program => program.id === id);
  const compliance = activeEnrollment ? data.evidence.filter(item => item.enrollment_id === activeEnrollment.id) : [];
  const requiredEvidence = activeEnrollment ? data.requirements.filter(item => item.state_code === programFor(activeEnrollment.program_id)?.state_code && item.required) : [];
  const completeEvidence = requiredEvidence.length > 0 && requiredEvidence.every(requirement => compliance.find(item => item.requirement_id === requirement.id)?.status === 'verified');

  return <section className="space-y-6">
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" /><div><p className="text-xs font-bold uppercase tracking-wider text-sky-800">Operational OJT workspace</p><p className="mt-2 max-w-4xl text-sm leading-6 text-navy-900">Create state-specific programs, enroll trainees, maintain an approved hour ledger, and retain verifiable program evidence. Requirements must be confirmed by the sponsoring workforce agency before enrollment.</p></div></div><button onClick={signOut} className="shrink-0 text-xs font-bold text-sky-900 underline">Sign out</button></div></div>
    {message && <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy-900">{message}</div>}
    {data.loading ? <LoadingCard label="Loading OJT records…" /> : data.error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{data.error}</div> : <>
      <div className="grid gap-4 lg:grid-cols-2"><ProgramForm saving={saving} onSave={(values) => save(() => supabase.from('pulseos_ojt_programs').insert(values), 'OJT program created.')} /><EnrollmentForm programs={data.programs} saving={saving} onSave={(values) => save(() => supabase.from('pulseos_ojt_enrollments').insert(values), 'Trainee enrolled.')} /></div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><HourLedger enrollments={data.enrollments} hours={data.hours} saving={saving} onSave={(values) => save(() => supabase.from('pulseos_ojt_hour_entries').insert(values), 'Hour entry recorded.')} onApprove={(entry) => save(() => supabase.from('pulseos_ojt_hour_entries').update({ supervisor_approved_at: new Date().toISOString() }).eq('id', entry), 'Supervisor approval recorded.')} /><EnrollmentStatus enrollments={data.enrollments} programs={data.programs} hoursFor={enrollmentHours} /></div>
      {data.enrollments.length > 1 && <div className="max-w-md"><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Evidence workspace trainee</label><select className="field" value={activeEnrollment?.id ?? ''} onChange={event => setSelectedEnrollmentId(event.target.value)}>{data.enrollments.map(item => <option key={item.id} value={item.id}>{item.trainee_name}</option>)}</select></div>}
      {activeEnrollment && <EvidenceWorkspace enrollment={activeEnrollment} program={programFor(activeEnrollment.program_id)} approvedHours={data.hours.filter(item => item.enrollment_id === activeEnrollment.id && item.supervisor_approved_at).reduce((sum, item) => sum + Number(item.hours), 0)} requirements={data.requirements.filter(item => item.state_code === programFor(activeEnrollment.program_id)?.state_code)} evidence={compliance} complete={completeEvidence} saving={saving} onSave={(values) => save(() => supabase.from('pulseos_compliance_evidence').upsert(values, { onConflict: 'enrollment_id,requirement_id' }), 'Evidence status updated.')} onComplete={() => save(() => supabase.from('pulseos_ojt_enrollments').update({ status: 'completed', end_date: today() }).eq('id', activeEnrollment.id), 'Enrollment marked complete.')} />}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Launch gate:</strong> Do not mark an enrollment complete until its required hours are supervisor-approved and every applicable required evidence item is verified. PulseOS records evidence; it does not certify eligibility or replace agency review.</div>
    </>}
  </section>;
}

function ProgramForm({ saving, onSave }: { saving: boolean; onSave: (values: Record<string, unknown>) => void }) {
  const [state, setState] = useState<OJTState>('FL');
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ state_code: state, title: form.get('title'), sponsor_name: form.get('sponsor'), occupation_title: form.get('occupation'), required_hours: Number(form.get('hours')), start_date: form.get('start') || null, end_date: form.get('end') || null, status: 'active' }); event.currentTarget.reset(); };
  return <Card title="1. Create OJT program" icon={Plus}><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><select value={state} onChange={e => setState(e.target.value as OJTState)} className="field"><option value="FL">Florida</option><option value="GA">Georgia</option></select><input required name="title" placeholder="Program title" className="field" /><input required name="sponsor" placeholder="Sponsor name" className="field" /><input required name="occupation" placeholder="Occupation title" className="field" /><input required min="1" step="0.25" name="hours" type="number" placeholder="Required hours" className="field" /><input name="start" type="date" defaultValue={today()} className="field" /><input name="end" type="date" className="field" /><button disabled={saving} className="button">Create program</button></form></Card>;
}

function EnrollmentForm({ programs, saving, onSave }: { programs: { id: string; title: string }[]; saving: boolean; onSave: (values: Record<string, unknown>) => void }) {
  const uniquePrograms = programs.filter((program, index) => programs.findIndex(candidate => candidate.title.trim().toLocaleLowerCase() === program.title.trim().toLocaleLowerCase()) === index);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ program_id: form.get('program'), trainee_name: form.get('trainee'), employer_name: form.get('employer'), supervisor_name: form.get('supervisor'), supervisor_email: form.get('supervisor_email'), wage_at_start: form.get('wage') ? Number(form.get('wage')) : null, start_date: form.get('start'), status: 'active' }); event.currentTarget.reset(); };
  return <Card title="2. Enroll trainee" icon={UserCheck}>{uniquePrograms.length === 0 ? <p className="text-sm text-slate-600">Create an OJT program before enrolling a trainee.</p> : <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><select required name="program" className="field"><option value="">Choose program</option>{uniquePrograms.map(program => <option key={program.id} value={program.id}>{program.title}</option>)}</select><input required name="trainee" placeholder="Trainee full name" className="field" /><input required name="employer" placeholder="Employer name" className="field" /><input required name="supervisor" placeholder="Supervisor full name" className="field" /><input required name="supervisor_email" type="email" placeholder="Foreman work email" className="field" /><input name="wage" min="0" step="0.01" type="number" placeholder="Starting wage" className="field" /><input required name="start" type="date" defaultValue={today()} className="field" /><button disabled={saving} className="button">Enroll trainee</button></form>}</Card>;
}

function HourLedger({ enrollments, hours, saving, onSave, onApprove }: { enrollments: { id: string; trainee_name: string; supervisor_name: string }[]; hours: { id: string; enrollment_id: string; work_date: string; hours: number; work_activity: string; supervisor_approved_at: string | null; trainee_attested_at: string | null }[]; saving: boolean; onSave: (values: Record<string, unknown>) => void; onApprove: (id: string) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const enrollment = enrollments.find(item => item.id === form.get('enrollment')); if (!enrollment) return; onSave({ enrollment_id: enrollment.id, work_date: form.get('date'), hours: Number(form.get('hours')), work_activity: form.get('activity'), supervisor_name: enrollment.supervisor_name, trainee_attested_at: form.get('attested') === 'on' ? new Date().toISOString() : null }); event.currentTarget.reset(); };
  return <Card title="3. Hour ledger & approval" icon={Clock3}>{enrollments.length === 0 ? <p className="text-sm text-slate-600">Enroll a trainee to add daily hours.</p> : <><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><select required name="enrollment" className="field"><option value="">Choose trainee</option>{enrollments.map(item => <option key={item.id} value={item.id}>{item.trainee_name}</option>)}</select><input required name="date" type="date" defaultValue={today()} className="field" /><input required name="hours" min="0.25" max="24" step="0.25" type="number" placeholder="Hours" className="field" /><input required name="activity" placeholder="Work activity" className="field" /><label className="flex items-center gap-2 text-sm text-slate-700"><input name="attested" type="checkbox" /> Trainee attested</label><button disabled={saving} className="button">Record hours</button></form><div className="mt-5 space-y-2">{hours.slice(0, 8).map(entry => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span><strong>{entry.work_date}</strong> · {entry.hours}h · {entry.work_activity}</span>{entry.supervisor_approved_at ? <span className="text-emerald-700">Approved</span> : <button disabled={saving} onClick={() => onApprove(entry.id)} className="text-xs font-bold text-navy-900 underline">Approve hours</button>}</div>)}</div></>}</Card>;
}

function EnrollmentStatus({ enrollments, programs, hoursFor }: { enrollments: { id: string; program_id: string; trainee_name: string; status: string }[]; programs: { id: string; title: string; required_hours: number }[]; hoursFor: (id: string) => number }) { return <Card title="Enrollment progress" icon={ClipboardCheck}><div className="space-y-3">{enrollments.length === 0 ? <p className="text-sm text-slate-600">No active enrollments.</p> : enrollments.map(item => { const program = programs.find(p => p.id === item.program_id); const logged = hoursFor(item.id); const required = program?.required_hours ?? 0; const percent = required ? Math.min(100, Math.round(logged / required * 100)) : 0; return <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold text-navy-900">{item.trainee_name}</p><p className="text-xs text-slate-500">{program?.title ?? 'Unknown program'} · {item.status}</p></div><span className="text-sm font-bold text-navy-900">{logged}/{required}h</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-gold-500" style={{ width: `${percent}%` }} /></div></div>; })}</div></Card>; }

function EvidenceWorkspace({ enrollment, program, approvedHours, requirements, evidence, complete, saving, onSave, onComplete }: { enrollment: { id: string; trainee_name: string; status: string }; program: { required_hours: number } | undefined; approvedHours: number; requirements: { id: string; title: string; description: string; required: boolean }[]; evidence: { requirement_id: string; status: EvidenceStatus; document_url: string | null; notes: string | null }[]; complete: boolean; saving: boolean; onSave: (values: Record<string, unknown>) => void; onComplete: () => void }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const evidenceByRequirement = useMemo(() => new Map(evidence.map(item => [item.requirement_id, item])), [evidence]);
  const hoursComplete = approvedHours >= (program?.required_hours ?? Infinity);
  const canComplete = complete && hoursComplete && enrollment.status === 'active';
  const openEvidence = async (key: string) => { const { data, error } = await supabase.storage.from('pulseos-ojt-evidence').createSignedUrl(key, 60 * 10); if (error || !data?.signedUrl) { setUploadError(error?.message ?? 'Unable to open evidence file.'); return; } window.open(data.signedUrl, '_blank', 'noopener,noreferrer'); };
  const upload = async (requirementId: string, file: File) => { setUploading(requirementId); setUploadError(null); const key = `${enrollment.id}/${requirementId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`; const { error } = await supabase.storage.from('pulseos-ojt-evidence').upload(key, file, { upsert: false }); if (error) { setUploadError(error.message); setUploading(null); return; } onSave({ enrollment_id: enrollment.id, requirement_id: requirementId, document_url: key, status: 'in_review', notes: null }); setUploading(null); };
  return <Card title={`4. Compliance evidence — ${enrollment.trainee_name}`} icon={FileCheck2}><div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm"><div className="flex items-center gap-2">{complete ? <><CheckCircle2 className="h-5 w-5 text-emerald-600" /><strong className="text-emerald-800">All required evidence is verified.</strong></> : <><ShieldCheck className="h-5 w-5 text-amber-600" /><strong className="text-amber-900">Evidence review remains open.</strong></>}</div><span className="text-slate-600">Approved hours: {approvedHours}/{program?.required_hours ?? 0}</span>{enrollment.status === 'completed' ? <span className="font-bold text-emerald-700">Enrollment complete</span> : <button className="button" disabled={!canComplete || saving} title={!canComplete ? 'Verify all required evidence and supervisor-approved hours before completing.' : undefined} onClick={onComplete}>Complete enrollment</button>}</div>{uploadError && <p className="mb-3 text-sm text-rose-700">{uploadError}</p>}<div className="space-y-3">{requirements.map(requirement => { const item = evidenceByRequirement.get(requirement.id); return <div key={requirement.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_auto_auto]"><div><p className="font-bold text-navy-900">{requirement.title} {requirement.required && <span className="text-rose-700">*</span>}</p><p className="mt-1 text-xs text-slate-600">{requirement.description || 'Program-configured requirement'}</p>{item?.document_url && <button type="button" onClick={() => openEvidence(item.document_url!)} className="mt-2 text-xs font-bold text-emerald-700 underline">Open evidence file</button>}</div><label className="button cursor-pointer">{uploading === requirement.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload<input type="file" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) upload(requirement.id, file); }} /></label><select value={item?.status ?? 'missing'} disabled={saving} onChange={event => onSave({ enrollment_id: enrollment.id, requirement_id: requirement.id, status: event.target.value, document_url: item?.document_url ?? null, notes: item?.notes ?? null, verified_by: event.target.value === 'verified' ? 'PulseOS administrator' : null, verified_at: event.target.value === 'verified' ? new Date().toISOString() : null })} className="field min-w-32">{evidenceStatuses.map(status => <option key={status} value={status} disabled={status === 'verified' && !item?.document_url}>{status.replace('_', ' ')}</option>)}</select></div>; })}</div></Card>;
}

function Card({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) { return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Icon className="h-5 w-5 text-gold-700" /><h2 className="font-bold text-navy-900">{title}</h2></div>{children}</article>; }
function LoadingCard({ label }: { label: string }) { return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin" />{label}</div>; }
