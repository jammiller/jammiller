import { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, UserPlus, LogIn, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: string | null }>;
  passwordRecovery?: boolean;
  onUpdatePassword?: (newPassword: string) => Promise<{ error: string | null }>;
}

export function PulseOSLogin({ onSignIn, onSignUp, passwordRecovery, onUpdatePassword }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === 'signin' ? onSignIn : onSignUp;
    const { error: err } = await fn(email, password);
    setLoading(false);
    if (err) setError(err);
  }

  async function handlePasswordReset() {
    if (!email.trim()) {
      setError('Enter your email above first, then click Reset Password.');
      return;
    }
    setResetting(true);
    setError(null);
    const redirectTo = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setResetting(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: err } = await (onUpdatePassword ?? (async () => ({ error: 'Not available' })))(newPassword);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setPasswordUpdated(true);
    }
  }

  if (passwordRecovery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 font-sans antialiased">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl animate-glow-pulse" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-navy-400/15 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-navy-950 shadow-xl shadow-gold-500/30">
              <KeyRound className="h-7 w-7" />
            </span>
            <h1 className="text-2xl font-bold text-white">Set New Password</h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gold-400/80">PulseOS</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            {passwordUpdated ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-400" />
                <p className="text-center text-sm text-slate-300">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full rounded-xl border border-white/10 bg-navy-900/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-gold-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-white/10 bg-navy-900/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-gold-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-xl hover:shadow-gold-500/40 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 font-sans antialiased">
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl animate-glow-pulse" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-navy-400/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-navy-950 shadow-xl shadow-gold-500/30">
            <Zap className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-white">PulseOS</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gold-400/80">UbD Platform</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-6 flex gap-2 rounded-xl bg-navy-900/50 p-1">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === 'signin' ? 'bg-gold-500 text-navy-950 shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" /> Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === 'signup' ? 'bg-gold-500 text-navy-950 shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" /> Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-navy-900/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-white/10 bg-navy-900/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-gold-400 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-xl hover:shadow-gold-500/40 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {resetSent && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Reset link sent. Check your email inbox.
            </div>
          )}

          {mode === 'signin' && (
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={resetting}
              className="mt-4 w-full text-center text-xs font-medium text-slate-400 transition-colors hover:text-gold-400 disabled:opacity-50"
            >
              {resetting ? 'Sending reset link...' : 'Forgot password? Reset it by email'}
            </button>
          )}

          <p className="mt-4 text-center text-xs text-slate-400">
            {mode === 'signin'
              ? 'New to PulseOS? Switch to Sign Up to create an account.'
              : 'Already have an account? Switch to Sign In.'}
          </p>
        </div>
      </div>
    </div>
  );
}
