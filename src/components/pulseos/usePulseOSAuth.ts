import { useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

export type PulseOSRole = 'admin' | 'client' | null;

export interface PulseOSAuthState {
  user: User | null;
  session: Session | null;
  role: PulseOSRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  claimFirstAdmin: () => Promise<boolean>;
  canClaimAdmin: boolean;
  signOut: () => Promise<void>;
  passwordRecovery: boolean;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

export function usePulseOSAuth(): PulseOSAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<PulseOSRole>(null);
  const [canClaimAdmin, setCanClaimAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const fetchRole = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('pulseos_user_roles')
      .select('role')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      setRole('client');
      return;
    }
    setRole(data?.role ?? 'client');
    const { data: claimAvailable } = await supabase.rpc('pulseos_admin_claim_available');
    setCanClaimAdmin(claimAvailable === true);
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchRole(newSession.user.id);
        } else {
          setRole(null);
        }
        setLoading(false);
      })();
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchRole(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const claimFirstAdmin = useCallback(async () => {
    const { data, error } = await supabase.rpc('pulseos_claim_first_admin');
    if (error || data !== true) {
      setCanClaimAdmin(false);
      return false;
    }
    setRole('admin');
    setCanClaimAdmin(false);
    return true;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setCanClaimAdmin(false);
    setPasswordRecovery(false);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    setPasswordRecovery(false);
    return { error: null };
  }, []);

  return { user, session, role, canClaimAdmin, loading, signIn, signUp, claimFirstAdmin, signOut, passwordRecovery, updatePassword };
}
