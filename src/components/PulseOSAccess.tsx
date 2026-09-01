import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PulseOS } from './PulseOS';

const dashboardPath = window.location.pathname.startsWith('/pulseos')
  ? '/pulseos/dashboard'
  : '/dashboard';
const adminEmail = (import.meta.env.VITE_PULSEOS_ADMIN_EMAIL ?? 'jamcmiller91@gmail.com').toLowerCase();

export function PulseOSAccess() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const applySession = (session: { user: { email?: string | null } } | null) => {
      const authorized = session?.user.email?.toLowerCase() === adminEmail;
      setSignedIn(authorized);
      setAccessDenied(Boolean(session) && !authorized);
      setLoading(false);
      if (session && !authorized) void supabase.auth.signOut();
    };
    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendSignInLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}${dashboardPath}`,
      },
    });
    setMessage(error ? 'This email does not have dashboard access.' : 'Check your email for a secure sign-in link.');
  }

  if (loading) return <main className="min-h-screen bg-navy-950" />;
  if (signedIn) return <PulseOS />;

  return (
    <main className="min-h-screen bg-navy-950 px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-10">
        <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500 text-navy-950"><LockKeyhole className="h-5 w-5" /></div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">PulseOS Platform</p>
        <h1 className="mt-3 text-3xl font-bold">Dashboard sign in</h1>
        <p className="mt-3 text-slate-300">Use your authorized email to access the curriculum workspace.</p>
        <form className="mt-8 space-y-3" onSubmit={sendSignInLink}>
          <label className="block text-sm font-medium text-slate-200" htmlFor="email">Email address</label>
          <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-white/15 bg-white px-4 py-3 text-navy-950 outline-none ring-gold-400 focus:ring-2" placeholder="you@example.com" />
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 font-bold text-navy-950 transition hover:bg-gold-400" type="submit">Email secure sign-in link <ArrowRight className="h-4 w-4" /></button>
        </form>
        {accessDenied && <p className="mt-4 text-sm text-rose-300">This account is not authorized for the dashboard.</p>}
        {message && <p className="mt-4 text-sm text-gold-300">{message}</p>}
      </div>
    </main>
  );
}

export function PulseOSLanding() {
  return (
    <main className="min-h-screen bg-navy-950 px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-4xl py-12 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-400"><Sparkles className="h-4 w-4" /> UbD-driven learning operations</div>
        <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl">Curriculum design, made operational.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">PulseOS gives instructional teams a structured workspace for designing units, assessments, and learning evidence.</p>
        <a href={dashboardPath} className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 font-bold text-navy-950 transition hover:bg-gold-400">Team dashboard <ArrowRight className="h-4 w-4" /></a>
        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {['Design with Understanding by Design', 'Align assessment evidence', 'Track curriculum readiness'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200"><CheckCircle2 className="mb-3 h-5 w-5 text-gold-400" />{item}</div>)}
        </div>
      </div>
    </main>
  );
}
