import { makeAutoObservable, runInAction } from 'mobx';
import { adminGetAllClients, adminDeleteClient, adminCreateClient, adminCreateSubscription, ClientWithSubscriptions, SubscriptionType } from '../api/gym';
import { register } from '../api/auth';

const CACHE_TTL = 2 * 60 * 1000;

export class AdminStore {
  clients: ClientWithSubscriptions[] = [];
  loading = false;
  error = '';
  private cachedAt: number | null = null;

  constructor() { makeAutoObservable(this); }

  get totalClients() { return this.clients.length; }
  get totalActiveSubscriptions() {
    return this.clients.reduce((acc, c) => acc + c.subscriptions.filter(s => new Date() <= new Date(s.endDate)).length, 0);
  }
  get clientsWithoutSubscriptions() { return this.clients.filter(c => c.subscriptions.length === 0).length; }

  private isCacheValid() { return this.cachedAt !== null && Date.now() - this.cachedAt < CACHE_TTL; }

  async loadClients(force = false) {
    if (!force && this.isCacheValid()) return;
    runInAction(() => { this.loading = true; this.error = ''; });
    try {
      const res = await adminGetAllClients();
      runInAction(() => { this.clients = res.data; this.cachedAt = Date.now(); });
    } catch { runInAction(() => { this.error = 'Failed to load clients'; }); }
    finally { runInAction(() => { this.loading = false; }); }
  }

  async deleteClient(id: string) {
    await adminDeleteClient(id);
    runInAction(() => { this.clients = this.clients.filter(c => c.id !== id); });
  }

  async createUser(data: { name: string; email: string; password: string; role: 'client' | 'admin' }) {
    const regRes = await register(data);
    const userId: string = regRes.data?.data?.user?.id ?? regRes.data?.data?.id ?? regRes.data?.id;
    if (userId && data.role === 'client') {
      try { await adminCreateClient({ userId, name: data.name, email: data.email }); } catch {}
    }
    await this.loadClients(true);
  }

  async createSubscriptionForClient(clientId: string, data: { type: SubscriptionType; startDate: string }) {
    await adminCreateSubscription(clientId, data);
    await this.loadClients(true);
  }

  getClientById(id: string) { return this.clients.find(c => c.id === id); }
  reset() { this.clients = []; this.cachedAt = null; this.error = ''; }
}
