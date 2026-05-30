import React, { createContext, useContext, useEffect, useState } from 'react';
import { hasSupabaseEnv, supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setAuthReady(true);
      return;
    }

    let active = true;

    async function bootstrap() {
      const { data, error } = await supabase.auth.getSession();
      if (error && active) setAuthError(error.message);
      if (data?.session?.user && active) {
        const profile = await fetchProfile(data.session.user);
        setCurrentUser(profile);
      }
      if (active) setAuthReady(true);
    }

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setAuthReady(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }) => {
    if (!supabase) {
      return { success: false, error: 'Supabase env vars are not configured.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signUp = async ({ email, password, fullName, role }) => {
    if (!supabase) {
      return { success: false, error: 'Supabase env vars are not configured.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) return { success: false, error: error.message };

    if (data.user) {
      const profile = {
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      };

      await supabase.from('profiles').upsert(profile);
    }

    return {
      success: true,
      needsEmailConfirmation: !data.session,
    };
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authReady,
        authError,
        signIn,
        signUp,
        logout,
        hasSupabaseEnv,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

async function fetchProfile(user) {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (data) {
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name || user.user_metadata?.full_name || '',
      role: data.role || user.user_metadata?.role || 'customer',
    };
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    role: user.user_metadata?.role || 'customer',
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
