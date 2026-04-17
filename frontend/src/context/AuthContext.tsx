import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMe, refreshTokens, logoutApi } from '../api/auth';

interface User { id: string; email: string; name: string; role: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    const res = await getMe(accessToken);
    setUser(res.data.data);
  };

  const logout = () => {
    const t = localStorage.getItem('token');
    if (t) logoutApi(t).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRefresh = localStorage.getItem('refreshToken');

    if (!storedToken && !storedRefresh) {
      setLoading(false);
      return;
    }

    getMe(storedToken ?? '')
      .then((res) => {
        setUser(res.data.data);
        setToken(storedToken);
      })
      .catch(async () => {
        if (storedRefresh) {
          try {
            const res = await refreshTokens(storedRefresh);
            const { accessToken, refreshToken } = res.data.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setToken(accessToken);
            const me = await getMe(accessToken);
            setUser(me.data.data);
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setToken(null);
          }
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
