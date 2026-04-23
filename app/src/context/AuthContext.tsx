import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API_BASE, clearToken, getToken, setToken, authHeaders } from '@/lib/api';
import type { AuthUser } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, year: number, email: string, password: string) => Promise<string>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const r = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
      if (!r.ok) {
        clearToken();
        setUser(null);
        return;
      }
      const u = (await r.json()) as AuthUser;
      setUser(u);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const msg = j.detail || 'Login failed';
      throw new Error(typeof msg === 'string' ? msg : 'Login failed');
    }
    const data = (await r.json()) as { access_token: string; user: AuthUser };
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name: string, year: number, email: string, password: string) => {
    const r = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, year, email, password }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const msg = j.detail || 'Sign up failed';
      throw new Error(typeof msg === 'string' ? msg : 'Sign up failed');
    }
    const data = (await r.json()) as { email: string | null };
    return data.email || email;
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const r = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const msg = j.detail || 'Verification failed';
      throw new Error(typeof msg === 'string' ? msg : 'Verification failed');
    }
    const data = (await r.json()) as { access_token: string; user: AuthUser };
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    const r = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const msg = j.detail || 'Could not resend code';
      throw new Error(typeof msg === 'string' ? msg : 'Could not resend code');
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      verifyOtp,
      resendOtp,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, signup, verifyOtp, resendOtp, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
