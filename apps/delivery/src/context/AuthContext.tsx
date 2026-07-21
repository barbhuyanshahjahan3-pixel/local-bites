import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../api/client';

interface AuthState {
  token: string | null;
  mustChangePassword: boolean;
  profile: { id: string; name: string; accessCode: string; city: string | null } | null;
  login: (accessCode: string, password: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('lb_delivery_token'));
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [profile, setProfile] = useState<AuthState['profile']>(null);

  const login = async (accessCode: string, password: string) => {
    const res = await api.post<{
      token: string;
      mustChangePassword: boolean;
      profile: AuthState['profile'];
    }>('/api/auth/staff-login', { role: 'delivery_partner', accessCode, password }, { auth: false });
    localStorage.setItem('lb_delivery_token', res.token);
    setToken(res.token);
    setMustChangePassword(res.mustChangePassword);
    setProfile(res.profile);
  };

  const changePassword = async (newPassword: string) => {
    const res = await api.post<{ token: string }>('/api/auth/change-password', { newPassword });
    localStorage.setItem('lb_delivery_token', res.token);
    setToken(res.token);
    setMustChangePassword(false);
  };

  const logout = () => {
    localStorage.removeItem('lb_delivery_token');
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, mustChangePassword, profile, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
