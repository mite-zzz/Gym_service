import React, { createContext, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { rootStore } from '../stores/RootStore';
import type { User } from '../stores/AuthStore';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { auth, client, admin } = rootStore;

  useEffect(() => { auth.init(); }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    await auth.login(accessToken, refreshToken);
  };

  const logout = () => {
    auth.logout();
    client.reset();
    admin.reset();
  };

  return (
    <AuthContext.Provider value={{
      user: auth.user,
      token: auth.token,
      login,
      logout,
      loading: auth.loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
});

export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
