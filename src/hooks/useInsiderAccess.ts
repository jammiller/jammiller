import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface InsiderPrompt {
  id: string;
  title: string;
  category: string;
  platform: string;
  promptText: string | null;
  previewText: string;
  useCase: string;
}

export interface InsiderTrend {
  id: string;
  title: string;
  platform: string;
  type: string;
  priority: string;
  spottedDate: string;
  description: string | null;
  previewDescription: string;
  action: string | null;
}

export interface InsiderTemplate {
  id: string;
  title: string;
  type: string;
  platform: string;
  templateText: string | null;
  previewText: string;
  useCase: string;
}

interface AuthState {
  user: { id: string; email: string } | null;
  isMember: boolean;
  loading: boolean;
}

export function useInsiderAccess() {
  const [auth, setAuth] = useState<AuthState>({ user: null, isMember: false, loading: true });
  const [prompts, setPrompts] = useState<InsiderPrompt[]>([]);
  const [trends, setTrends] = useState<InsiderTrend[]>([]);
  const [templates, setTemplates] = useState<InsiderTemplate[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://kyfdxpqbiysbtisyqzon.supabase.co';

  const fetchContent = useCallback(async (token: string | null) => {
    setContentLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${supabaseUrl}/functions/v1/insider-access`, { headers });
      if (!res.ok) throw new Error('Failed to load content');
      const data = await res.json();

      setPrompts(data.prompts || []);
      setTrends(data.trends || []);
      setTemplates(data.templates || []);
      setAuth(prev => ({ ...prev, isMember: !!data.isMember }));
    } catch {
      setPrompts([]);
      setTrends([]);
      setTemplates([]);
    } finally {
      setContentLoading(false);
    }
  }, [supabaseUrl]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        setAuth({ user: { id: session.user.id, email: session.user.email ?? '' }, isMember: false, loading: false });
        fetchContent(session.access_token);
      } else {
        setAuth({ user: null, isMember: false, loading: false });
        fetchContent(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;

      if (session?.user) {
        setAuth({ user: { id: session.user.id, email: session.user.email ?? '' }, isMember: false, loading: false });
        fetchContent(session.access_token);
      } else {
        setAuth({ user: null, isMember: false, loading: false });
        fetchContent(null);
      }
    });

    return () => { active = false; subscription.unsubscribe(); };
  }, [fetchContent]);

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthModalOpen(false);
    } catch {
      setAuthError('Could not sign in. Check your email and password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setAuthError(null);
      setAuthModalOpen(false);
    } catch {
      setAuthError('Could not create an account. That email may already be in use.');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuth({ user: null, isMember: false, loading: false });
    fetchContent(null);
  };

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthModalOpen(true);
  };

  return {
    auth,
    prompts,
    trends,
    templates,
    contentLoading,
    authModalOpen,
    authMode,
    authError,
    authLoading,
    setAuthModalOpen,
    setAuthMode,
    signIn,
    signUp,
    signOut,
    openAuth,
  };
}
