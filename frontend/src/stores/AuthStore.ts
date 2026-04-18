import { makeAutoObservable, runInAction } from 'mobx';
import { getMe, refreshTokens, logoutApi } from '../api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class AuthStore {
  user: User | null = null;
  token: string | null = localStorage.getItem('token');
  loading = true;

  constructor() {
    makeAutoObservable(this);
  }

  get isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  async login(accessToken: string, refreshToken: string): Promise<void> {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    runInAction(() => { this.token = accessToken; });
    const res = await getMe(accessToken);
    runInAction(() => { this.user = res.data.data; });
  }

  logout(): void {
    const t = localStorage.getItem('token');
    if (t) logoutApi(t).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    runInAction(() => {
      this.token = null;
      this.user = null;
    });
  }

  async init(): Promise<void> {
    const storedToken = localStorage.getItem('token');
    const storedRefresh = localStorage.getItem('refreshToken');

    if (!storedToken && !storedRefresh) {
      runInAction(() => { this.loading = false; });
      return;
    }

    try {
      const res = await getMe(storedToken ?? '');
      runInAction(() => {
        this.user = res.data.data;
        this.token = storedToken;
      });
    } catch {
      if (storedRefresh) {
        try {
          const res = await refreshTokens(storedRefresh);
          const { accessToken, refreshToken } = res.data.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          const me = await getMe(accessToken);
          runInAction(() => {
            this.token = accessToken;
            this.user = me.data.data;
          });
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          runInAction(() => { this.token = null; });
        }
      } else {
        localStorage.removeItem('token');
        runInAction(() => { this.token = null; });
      }
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }
}
