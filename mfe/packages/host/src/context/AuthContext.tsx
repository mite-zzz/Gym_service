import React, { createContext, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { rootStore } from '../stores/RootStore';
import type { User } from '../stores/AuthStore';

interface AuthCtx {
  user: User | null; token: string | null;
  login: (a: string, r: string) => Promise<void>;
  logout: () => void; loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { auth, client, admin } = rootStore;
  useEffect(() => { auth.init(); }, []);
  return (
    <AuthContext.Provider value={{
      user: auth.user, token: auth.token, loading: auth.loading,
      login: (a, r) => auth.login(a, r),
      logout: () => { auth.logout(); client.reset(); admin.reset(); },
    }}>
      {children}
    </AuthContext.Provider>
  );
});

export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
