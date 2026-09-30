import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Provides Supabase auth session to the entire app.
 * Handles sign-up, sign-in, sign-out, and password reset.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('STEX Auth Error: Failed to get initial session.', error);
        }
        setSession(session ?? null);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('STEX Auth Error: Initialization failed.', err);
        setLoading(false); // Ensure loading is cleared even on exception
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // ── Auth Actions ──────────────────────────────────────────

  const signUp = async ({ email, password, fullName, college, course, yearSemester }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          college,
          course,
          year_semester: yearSemester,
        },
      },
    });
    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('STEX Auth Error: Sign out failed.', error);
      return { error };
    } catch (err) {
      console.error('STEX Auth Error: Sign out exception.', err);
      return { error: err };
    }
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (password) => {
    return await supabase.auth.updateUser({ password });
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to consume auth context */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
