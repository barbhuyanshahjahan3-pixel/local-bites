import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../api/client';

interface AuthState {
  token: string | null;
  profile: { id: string; name: string } | null;
  register: (name: string, mobile: string, email?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('lb_customer_token'));
  const [profile, setProfile] = useState<AuthState['profile']>(
    JSON.parse(localStorage.getItem('lb_profile') || 'null')
  );

  const register = async (name: string, mobile: string, email?: string) => {
    const res = await api.post<{ token: string; profile: AuthState['profile'] }>(
      '/api/auth/customer/register',
      { name, mobile, email },
      { auth: false }
    );
    localStorage.setItem('lb_customer_token', res.token);
    localStorage.setItem('lb_profile', JSON.stringify(res.profile));
    setToken(res.token);
    setProfile(res.profile);
  };

  const logout = () => {
    localStorage.removeItem('lb_customer_token');
    localStorage.removeItem('lb_profile');
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, profile, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
