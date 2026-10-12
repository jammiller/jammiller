import type { ReactNode } from 'react';
import { usePulseOSAuth } from '../pulseos/usePulseOSAuth';
import { PulseOSLogin } from '../pulseos/PulseOSLogin';

export function PISGate({ children }: { children: ReactNode }) {
  const { user, role, loading, signIn, signUp, signOut, passwordRecovery, updatePassword } = usePulseOSAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Checking your sign-in…</div>;
  }

  if (!user || passwordRecovery) {
    return <PulseOSLogin onSignIn={signIn} onSignUp={signUp} passwordRecovery={passwordRecovery} onUpdatePassword={updatePassword} />;
  }

  if (role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">PIS is restricted to administrators</h1>
          <p className="mt-2 text-sm text-slate-600">
            {role === null
              ? 'We could not confirm your role. This is usually temporary. Try again, or sign out and sign back in.'
              : `You are signed in as ${user.email ?? 'this account'}, which is not an administrator.`}
          </p>
          <div className="mt-4 flex gap-2">
            {role === null && <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white" onClick={() => window.location.reload()}>Try again</button>}
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => { void signOut(); }}>Sign out and use another account</button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
