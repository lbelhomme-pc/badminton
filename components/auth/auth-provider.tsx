"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type ClubRole = "adherent" | "entraineur" | "bureau" | "admin";

export interface ClubProfile {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  role: ClubRole;
  categorie: string | null;
  date_naissance: string | null;
  licence_ffbad: string | null;
}

interface SignupInput {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  password: string;
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  user: User | null;
  profile: ClubProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(message: string) {
  if (message.toLowerCase().includes("invalid login")) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.toLowerCase().includes("already registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  return message || "Une erreur est survenue.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

      if (error) {
        setProfile(null);
        return;
      }

      setProfile(data as ClubProfile);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [fetchProfile, user]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { ok: false, message: "Configuration Supabase manquante." };
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { ok: false, message: friendlyAuthError(error.message) };
      }

      return { ok: true, message: "Connexion réussie." };
    },
    [supabase]
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      if (!supabase) {
        return { ok: false, message: "Configuration Supabase manquante." };
      }

      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            prenom: input.prenom,
            nom: input.nom,
            telephone: input.telephone
          }
        }
      });

      if (error) {
        return { ok: false, message: friendlyAuthError(error.message) };
      }

      return {
        ok: true,
        message: "Ton compte a été créé. Vérifie ta boîte mail si une confirmation est nécessaire."
      };
    },
    [supabase]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) {
        return { ok: false, message: "Configuration Supabase manquante." };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/connexion` : undefined
      });

      if (error) {
        return { ok: false, message: friendlyAuthError(error.message) };
      }

      return { ok: true, message: "Si un compte existe, un email de réinitialisation a été envoyé." };
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      user,
      profile,
      isAuthenticated: Boolean(user),
      isAdmin: profile?.role === "admin" || profile?.role === "bureau",
      login,
      signup,
      resetPassword,
      logout,
      refreshProfile
    }),
    [loading, login, logout, profile, refreshProfile, resetPassword, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
