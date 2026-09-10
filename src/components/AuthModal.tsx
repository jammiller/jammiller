import { useState } from 'react';
import { X, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  mode: 'signin' | 'signup';
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onModeChange: (mode: 'signin' | 'signup') => void;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
}

export function AuthModal({ open, mode, error, loading, onClose, onModeChange, onSignIn, onSignUp }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      onSignIn(email, password);
    } else {
      onSignUp(email, password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">
            {mode === 'signin' ? 'Sign in to your Insider account' : 'Create your Insider account'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'signin' ? 'Access your prompts, trends, and templates.' : 'Start your membership to unlock all content.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-softgray py-3 pl-11 pr-4 text-sm text-navy-900 placeholder-slate-400 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-slate-200 bg-softgray py-3 px-4 text-sm text-navy-900 placeholder-slate-400 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button onClick={() => onModeChange('signup')} className="font-semibold text-gold-700 hover:text-gold-800">Sign up</button>
            </>
          ) : (
            <>Already a member?{' '}
              <button onClick={() => onModeChange('signin')} className="font-semibold text-gold-700 hover:text-gold-800">Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
