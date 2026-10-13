import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, HardHat, Loader2, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { usePulseOSAuth } from './usePulseOSAuth';
import type { OJTHourEntry } from '../../lib/pulseos-ojt-types';

type ForemanHour = OJTHourEntry & { enrollment: { trainee_name: string; employer_name: string } | null };

export function ForemanPortal() {
  const { user, role, loading: authLoading, signIn, signOut } = usePulseOSAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [hours, setHours] = useState<ForemanHour[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadHours = useCallback(async () => {
    setLoadingHours(true);
    const { data, error } = await supabase
      .from('pulseos_ojt_hour_entries')
      .select('*, enrollment:pulseos_ojt_enrollments(trainee_name, employer_name)')
      .is('supervisor_approved_at', null)
      .order('work_date', { ascending: false });
    if (error) setMessage(error.message);
    setHours((data ?? []) as ForemanHour[]);
    setLoadingHours(false);
  }, []);

  useEffect(() => { if (role === 'foreman') void loadHours(); }, [loadHours, role]);

  if (authLoading) return <LoadingCard label="Checking foreman access…" />;
  if (!user) return <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <HardHat className="h-7 w-7 text-gold-700" />
    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gold-700">Pulse OS Foreman Portal</p>
    <h1 className="mt-1 text-2xl font-bold text-navy-900">Approve field hours</h1>
    <p className="mt-2 text-sm leading-6 text-slate-600">Use the Pulse OS credentials issued to you by your administrator. This portal does not link to any other business site.</p>
    <form className="mt-5 space-y-3" onSubmit={async (event) => { event.preventDefault(); const result = await signIn(email, password); if (result.error) setMessage(result.error); }}>
      <input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Work email" className="field" />
      <input required type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" className="field" />
      <button className="button w-full">Sign in to Pulse OS</button>
    </form>
    {message && <p className="mt-3 text-sm text-rose-700">{message}</p>}
  </section>;

  if (role !== 'foreman') return <section className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
    <HardHat className="h-7 w-7 text-amber-700" />
    <h1 className="mt-3 text-xl font-bold text-amber-950">Foreman access required</h1>
    <p className="mt-2 text-sm leading-6 text-amber-900">Your account is signed in but has not been assigned the Foreman role for Pulse OS. Contact your Pulse OS administrator.</p>
    <button onClick={signOut} className="mt-4 text-sm font-bold text-amber-950 underline">Sign out</button>
  </section>;

  return <div className="min-h-screen bg-softgray px-4 py-8 font-sans sm:px-6"><main className="mx-auto max-w-3xl">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-950 p-5 text-white"><div className="flex items-center gap-3"><HardHat className="h-6 w-6 text-gold-400" /><div><p className="font-bold">Pulse OS Foreman Portal</p><p className="text-xs text-slate-300">Review only the trainees assigned to you</p></div></div><button onClick={signOut} className="inline-flex items-center gap-2 text-sm font-bold text-white underline"><LogOut className="h-4 w-4" /> Sign out</button></header>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-gold-700">Pending approval</p><h1 className="mt-1 text-2xl font-bold text-navy-900">Daily hour ledger</h1></div><button onClick={() => void loadHours()} className="text-sm font-bold text-navy-900 underline">Refresh</button></div>
      {message && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}
      {loadingHours ? <LoadingCard label="Loading assigned hours…" /> : hours.length === 0 ? <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">No unapproved hours are assigned to you.</p> : <div className="mt-5 space-y-3">{hours.map(hour => <article key={hour.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-navy-900">{hour.enrollment?.trainee_name ?? 'Assigned trainee'}</p><p className="text-xs text-slate-500">{hour.enrollment?.employer_name ?? ''} · {hour.work_date}</p><p className="mt-2 text-sm text-slate-700">{hour.hours} hours · {hour.work_activity}</p>{hour.trainee_attested_at && <p className="mt-1 text-xs text-emerald-700">Trainee attested</p>}</div><button disabled={approvingId === hour.id} onClick={async () => { setApprovingId(hour.id); const { data, error } = await supabase.rpc('pulseos_approve_ojt_hour', { hour_entry_id: hour.id }); if (error || data !== true) setMessage(error?.message ?? 'Unable to approve this entry.'); else await loadHours(); setApprovingId(null); }} className="button">{approvingId === hour.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve</button></div></article>)}</div>}
    </section>
  </main></div>;
}

function LoadingCard({ label }: { label: string }) { return <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-5 text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin" />{label}</div>; }
