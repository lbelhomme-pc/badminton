"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { hasAppRole, legacyClubRoleToAppRoles, normalizeAppRoles, type AppRole, type LegacyClubRole } from "@/lib/roles";

export type ClubRole = LegacyClubRole;

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
  roles: AppRole[];
  isAuthenticated: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isPasswordRecovery: boolean;
  isCheckingPasswordRecovery: boolean;
  passwordRecoveryError: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; message: string }>;
  updatePassword: (password: string) => Promise<{ ok: boolean; message: string }>;
  clearPasswordRecovery: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_CACHE_KEY = "cfvv41:auth-profile-cache";

interface RecoveryUrlState {
  isRecoveryUrl: boolean;
  hasRecoveryPayload: boolean;
  code: string | null;
  errorDescription: string | null;
  sessionTokens: {
    access_token: string;
    refresh_token: string;
  } | null;
}

interface CachedAuthState {
  userId: string;
  profile: ClubProfile | null;
  roles: AppRole[];
  cachedAt: number;
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Auth request timed out")), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

function readRecoveryUrlState(): RecoveryUrlState {
  if (typeof window === "undefined") {
    return { isRecoveryUrl: false, hasRecoveryPayload: false, code: null, errorDescription: null, sessionTokens: null };
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const type = hashParams.get("type") || searchParams.get("type");
  const mode = searchParams.get("mode");
  const code = searchParams.get("code");
  const errorDescription =
    hashParams.get("error_description") ||
    searchParams.get("error_description") ||
    hashParams.get("error") ||
    searchParams.get("error");
  const hasRecoveryPayload = Boolean((accessToken && refreshToken) || code);
  const isRecoveryUrl = type === "recovery" || mode === "recovery" || hasRecoveryPayload || Boolean(errorDescription);

  return {
    isRecoveryUrl,
    hasRecoveryPayload,
    code,
    errorDescription,
    sessionTokens:
      accessToken && refreshToken
        ? {
            access_token: accessToken,
            refresh_token: refreshToken
          }
        : null
  };
}

function cleanRecoveryUrl() {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("type");
  url.searchParams.delete("error");
  url.searchParams.delete("error_code");
  url.searchParams.delete("error_description");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

function readAuthCache(userId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedAuthState;
    const maxAgeMs = 1000 * 60 * 60 * 24 * 7;
    if (cached.userId !== userId || Date.now() - cached.cachedAt > maxAgeMs) {
      return null;
    }

    return {
      ...cached,
      roles: normalizeAppRoles(cached.roles)
    };
  } catch {
    return null;
  }
}

function writeAuthCache(userId: string, profile: ClubProfile | null, roles: AppRole[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const cached: CachedAuthState = {
      userId,
      profile,
      roles: normalizeAppRoles(roles),
      cachedAt: Date.now()
    };
    window.localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // The cache is only a UX helper. Supabase RLS remains the source of truth.
  }
}

function clearAuthCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_CACHE_KEY);
  window.sessionStorage.removeItem(AUTH_CACHE_KEY);
}

function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem("cfvv41:password-recovery");
  clearAuthCache();

  [window.localStorage, window.sessionStorage].forEach((storage) => {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith("sb-") || key === "supabase.auth.token") {
        storage.removeItem(key);
      }
    }
  });

  if ("caches" in window) {
    void window.caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("cfvv41-")).map((key) => window.caches.delete(key))))
      .catch(() => undefined);
  }

  window.dispatchEvent(new Event("cfvv41:auth-logout"));
}

function friendlyAuthError(message: string) {
  if (message.toLowerCase().includes("invalid login")) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.toLowerCase().includes("already registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (message.toLowerCase().includes("session missing") || message.toLowerCase().includes("not authenticated")) {
    return "Le lien de réinitialisation n'est plus actif. Redemande un lien de mot de passe oublié.";
  }
  if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("otp_expired")) {
    return "Le lien de réinitialisation a expiré. Redemande un lien de mot de passe oublié.";
  }
  if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("token")) {
    return "Le lien de réinitialisation est invalide. Redemande un nouveau lien.";
  }
  if (message.toLowerCase().includes("timed out")) {
    return "La demande a pris trop de temps. Vérifie ta connexion puis réessaie.";
  }
  return message || "Une erreur est survenue.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isCheckingPasswordRecovery, setIsCheckingPasswordRecovery] = useState(false);
  const [passwordRecoveryError, setPasswordRecoveryError] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  const profileRef = useRef<ClubProfile | null>(null);
  const rolesRef = useRef<AppRole[]>([]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    rolesRef.current = roles;
  }, [roles]);

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
    setIsCheckingPasswordRecovery(false);
    setPasswordRecoveryError(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("cfvv41:password-recovery");
    }
  }, []);

  const fetchUserRoles = useCallback(
    async (userId: string, legacyRole?: string | null) => {
      const cached = readAuthCache(userId);
      const fallbackRoles = () => {
        if (legacyRole) {
          return legacyClubRoleToAppRoles(legacyRole);
        }

        if (userRef.current?.id === userId && rolesRef.current.length > 0) {
          return normalizeAppRoles(rolesRef.current);
        }

        if (cached?.roles.length) {
          return normalizeAppRoles(cached.roles);
        }

        return legacyClubRoleToAppRoles(null);
      };

      if (!supabase) {
        const nextRoles = fallbackRoles();
        setRoles(nextRoles);
        return nextRoles;
      }

      try {
        const { data, error } = await withTimeout(supabase.from("user_roles").select("role").eq("user_id", userId), 10000);

        if (error) {
          const nextRoles = fallbackRoles();
          setRoles(nextRoles);
          return nextRoles;
        }

        const nextRoles = (data ?? []).map((row) => row.role);
        const normalizedRoles = nextRoles.length > 0 ? normalizeAppRoles(nextRoles) : fallbackRoles();
        setRoles(normalizedRoles);
        writeAuthCache(userId, profileRef.current?.id === userId ? profileRef.current : cached?.profile ?? null, normalizedRoles);
        return normalizedRoles;
      } catch {
        const nextRoles = fallbackRoles();
        setRoles(nextRoles);
        return nextRoles;
      }
    },
    [supabase]
  );

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) {
        setProfile(null);
        setRoles([]);
        return;
      }

      const cached = readAuthCache(userId);
      const fallbackProfile = profileRef.current?.id === userId ? profileRef.current : cached?.profile ?? null;

      if (fallbackProfile) {
        setProfile(fallbackProfile);
      }

      if (cached?.roles.length) {
        setRoles(normalizeAppRoles(cached.roles));
      }

      try {
        const { data, error } = await withTimeout(supabase.from("profiles").select("*").eq("id", userId).single(), 10000);

        if (error) {
          setProfile(fallbackProfile);
          const nextRoles = await fetchUserRoles(userId, fallbackProfile?.role);
          writeAuthCache(userId, fallbackProfile, nextRoles);
          return;
        }

        const nextProfile = data as ClubProfile;
        setProfile(nextProfile);
        const nextRoles = await fetchUserRoles(userId, nextProfile.role);
        writeAuthCache(userId, nextProfile, nextRoles);
      } catch {
        setProfile(fallbackProfile);
        const nextRoles = await fetchUserRoles(userId, fallbackProfile?.role);
        writeAuthCache(userId, fallbackProfile, nextRoles);
      }
    },
    [fetchUserRoles, supabase]
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
    const recoveryUrlState = readRecoveryUrlState();
    const storedPasswordRecovery =
      typeof window !== "undefined" && window.sessionStorage.getItem("cfvv41:password-recovery") === "1";
    const shouldHandlePasswordRecovery = recoveryUrlState.isRecoveryUrl || storedPasswordRecovery;

    if (shouldHandlePasswordRecovery) {
      setIsCheckingPasswordRecovery(true);
      setPasswordRecoveryError(null);
    }

    if (recoveryUrlState.hasRecoveryPayload || storedPasswordRecovery) {
      if (typeof window !== "undefined") {
        setIsPasswordRecovery(true);
        window.sessionStorage.setItem("cfvv41:password-recovery", "1");
      }
    }

    void (async () => {
      let optimisticUser: User | null = null;

      try {
        let recoverySessionReady = false;

        if (recoveryUrlState.errorDescription) {
          throw new Error(recoveryUrlState.errorDescription.replace(/\+/g, " "));
        }

        if (recoveryUrlState.sessionTokens) {
          const { error } = await withTimeout(supabase.auth.setSession(recoveryUrlState.sessionTokens), 5000);
          if (error) {
            throw error;
          }
          recoverySessionReady = true;
          cleanRecoveryUrl();
        } else if (recoveryUrlState.code && recoveryUrlState.isRecoveryUrl) {
          const { error } = await withTimeout(supabase.auth.exchangeCodeForSession(recoveryUrlState.code), 5000);
          if (error) {
            throw error;
          }
          recoverySessionReady = true;
          cleanRecoveryUrl();
        }

        try {
          const { data: sessionData } = await withTimeout(supabase.auth.getSession(), 2500);
          const sessionUser = sessionData.session?.user ?? null;
          if (mounted && sessionUser) {
            const cached = readAuthCache(sessionUser.id);
            optimisticUser = sessionUser;
            setUser(sessionUser);
            if (cached) {
              setProfile(cached.profile);
              setRoles(normalizeAppRoles(cached.roles));
            }
          }
        } catch {
          // getUser below remains the authoritative check.
        }

        const { data } = await withTimeout(supabase.auth.getUser(), 10000);
        if (!mounted) return;

        setUser(data.user);
        if (data.user) {
          await fetchProfile(data.user.id);
        } else {
          setProfile(null);
          setRoles([]);
        }

        if (shouldHandlePasswordRecovery) {
          if (data.user && (recoverySessionReady || recoveryUrlState.hasRecoveryPayload || storedPasswordRecovery)) {
            setIsPasswordRecovery(true);
            if (typeof window !== "undefined") {
              window.sessionStorage.setItem("cfvv41:password-recovery", "1");
            }
          } else if (!data.user) {
            setIsPasswordRecovery(false);
            setPasswordRecoveryError("Le lien de réinitialisation a expiré ou n'est pas complet. Redemande un lien de mot de passe oublié.");
            if (typeof window !== "undefined") {
              window.sessionStorage.removeItem("cfvv41:password-recovery");
            }
          }
        }
      } catch (error) {
        if (!mounted) return;
        const cachedUser = optimisticUser ?? userRef.current;
        if (cachedUser && !shouldHandlePasswordRecovery) {
          const cached = readAuthCache(cachedUser.id);
          setUser(cachedUser);
          if (cached) {
            setProfile(cached.profile);
            setRoles(normalizeAppRoles(cached.roles));
          }
          return;
        }
        setUser(null);
        setProfile(null);
        setRoles([]);
        if (shouldHandlePasswordRecovery) {
          const message = error instanceof Error ? error.message : "";
          setIsPasswordRecovery(false);
          setPasswordRecoveryError(
            friendlyAuthError(message) || "Le lien de réinitialisation a expiré ou n'est pas complet. Redemande un lien de mot de passe oublié."
          );
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem("cfvv41:password-recovery");
          }
          cleanRecoveryUrl();
        }
      } finally {
        if (mounted) {
          setIsCheckingPasswordRecovery(false);
          setLoading(false);
        }
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
          setPasswordRecoveryError(null);
          setIsCheckingPasswordRecovery(false);
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem("cfvv41:password-recovery", "1");
            window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
          }
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          if (event === "INITIAL_SESSION" && userRef.current) {
            return;
          }
          setProfile(null);
          setRoles([]);
          setIsPasswordRecovery(false);
          setPasswordRecoveryError(null);
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem("cfvv41:password-recovery");
          }
        }
      } catch {
        setUser(session?.user ?? null);
        setProfile(null);
        if (!session?.user) {
          setRoles([]);
        }
      } finally {
        setLoading(false);
      }
    });

    const onForcedLogout = () => {
      setUser(null);
      setProfile(null);
      setRoles([]);
      setIsPasswordRecovery(false);
      setIsCheckingPasswordRecovery(false);
      setPasswordRecoveryError(null);
      setLoading(false);
    };

    window.addEventListener("cfvv41:auth-logout", onForcedLogout);

    return () => {
      mounted = false;
      window.removeEventListener("cfvv41:auth-logout", onForcedLogout);
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { ok: false, message: "Configuration Supabase manquante." };
      }

      try {
        setLoading(true);
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }),
          10000
        );

        if (error) {
          setLoading(false);
          return { ok: false, message: friendlyAuthError(error.message) };
        }

        if (data.user) {
          setUser(data.user);
          await fetchProfile(data.user.id);
        }

        setLoading(false);
        return { ok: true, message: "Connexion réussie." };
      } catch (error) {
        setLoading(false);
        const message = error instanceof Error ? error.message : "Une erreur est survenue.";
        return { ok: false, message: friendlyAuthError(message) };
      }
    },
    [fetchProfile, supabase]
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      if (!supabase) {
        return { ok: false, message: "Configuration Supabase manquante." };
      }

      try {
        const { error } = await withTimeout(
          supabase.auth.signUp({
            email: input.email.trim().toLowerCase(),
            password: input.password,
            options: {
              data: {
                prenom: input.prenom.trim(),
                nom: input.nom.trim(),
                telephone: input.telephone.trim()
              }
            }
          }),
          10000
        );

        if (error) {
          return { ok: false, message: friendlyAuthError(error.message) };
        }

        return {
          ok: true,
          message: "Ton compte a été créé. Vérifie ta boîte mail si une confirmation est nécessaire."
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Une erreur est survenue.";
        return { ok: false, message: friendlyAuthError(message) };
      }
    },
    [supabase]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) {
        return { ok: false, message: "Configuration Supabase manquante." };
      }

      try {
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: typeof window !== "undefined" ? `${window.location.origin}/connexion?mode=recovery` : undefined
          }),
          10000
        );

        if (error) {
          return { ok: false, message: friendlyAuthError(error.message) };
        }

        return { ok: true, message: "Si un compte existe, un email de réinitialisation a été envoyé." };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Une erreur est survenue.";
        return { ok: false, message: friendlyAuthError(message) };
      }
    },
    [supabase]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) {
        return { ok: false, message: "Configuration Supabase manquante." };
      }

      try {
        const { error } = await withTimeout(supabase.auth.updateUser({ password }), 10000);

        if (error) {
          return { ok: false, message: friendlyAuthError(error.message) };
        }

        clearPasswordRecovery();
        return { ok: true, message: "Mot de passe mis à jour." };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Une erreur est survenue.";
        return { ok: false, message: friendlyAuthError(message) };
      }
    },
    [clearPasswordRecovery, supabase]
  );

  const logout = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        // The local state is still cleared below so the UI never stays stuck.
      }
    }
    clearSupabaseAuthStorage();
    setUser(null);
    setProfile(null);
    setRoles([]);
    clearPasswordRecovery();
    setLoading(false);
  }, [clearPasswordRecovery, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      user,
      profile,
      roles,
      isAuthenticated: Boolean(user),
      isManager: hasAppRole(roles, "manager") || profile?.role === "entraineur" || profile?.role === "bureau" || profile?.role === "admin",
      isAdmin: hasAppRole(roles, "admin") || hasAppRole(roles, "super_admin") || profile?.role === "admin" || profile?.role === "bureau",
      isPasswordRecovery,
      isCheckingPasswordRecovery,
      passwordRecoveryError,
      login,
      signup,
      resetPassword,
      updatePassword,
      clearPasswordRecovery,
      logout,
      refreshProfile
    }),
    [
      clearPasswordRecovery,
      isCheckingPasswordRecovery,
      isPasswordRecovery,
      loading,
      login,
      logout,
      passwordRecoveryError,
      profile,
      refreshProfile,
      resetPassword,
      roles,
      signup,
      updatePassword,
      user
    ]
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
