import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { api, getToken, setToken, type User } from './api';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (body: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): User | null {
  if (!getToken()) return null;
  const raw = localStorage.getItem('sj_user');
  return raw ? (JSON.parse(raw) as User) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);

  const persist = useCallback((token: string, nextUser: User) => {
    setToken(token);
    localStorage.setItem('sj_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: u } = await api.login({ email, password });
      persist(token, u);
    },
    [persist],
  );

  const register = useCallback(
    async (body: { name: string; email: string; phone?: string; password: string }) => {
      const { token, user: u } = await api.register(body);
      persist(token, u);
    },
    [persist],
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('sj_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
