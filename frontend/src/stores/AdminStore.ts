import { makeAutoObservable, runInAction } from 'mobx';
import {
  adminGetAllClients, adminDeleteClient, adminCreateClient,
  adminCreateSubscription, ClientWithSubscriptions, SubscriptionType,
} from '../api/gym';
import { register } from '../api/auth';

const CACHE_TTL = 2 * 60 * 1000; // 2 минуты

export class AdminStore {
  clients: ClientWithSubscriptions[] = [];
  loading = false;
  error = '';
  private cachedAt: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // --- computed ---

  get totalClients(): number {
    return this.clients.length;
  }

  get totalActiveSubscriptions(): number {
    return this.clients.reduce(
      (acc, c) => acc + c.subscriptions.filter(s => new Date() <= new Date(s.endDate)).length,
      0,
    );
  }

  get clientsWithoutSubscriptions(): number {
    return this.clients.filter(c => c.subscriptions.length === 0).length;
  }

  // --- cache helper ---

  private isCacheValid(): boolean {
    return this.cachedAt !== null && Date.now() - this.cachedAt < CACHE_TTL;
  }

  // --- actions ---

  async loadClients(force = false): Promise<void> {
    if (!force && this.isCacheValid()) return;
    runInAction(() => { this.loading = true; this.error = ''; });
    try {
      const res = await adminGetAllClients();
      runInAction(() => {
        this.clients = res.data;
        this.cachedAt = Date.now();
      });
    } catch {
      runInAction(() => { this.error = 'Failed to load clients'; });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async deleteClient(id: string): Promise<void> {
    await adminDeleteClient(id);
    runInAction(() => {
      this.clients = this.clients.filter(c => c.id !== id);
    });
  }

  async createUser(data: { name: string; email: string; password: string; role: 'client' | 'admin' }): Promise<void> {
    const regRes = await register(data);
    const userId: string =
      regRes.data?.data?.user?.id ?? regRes.data?.data?.id ?? regRes.data?.id;
    if (userId && data.role === 'client') {
      try {
        await adminCreateClient({ userId, name: data.name, email: data.email });
      } catch {
        // gym profile creation failed — user still registered
      }
    }
    await this.loadClients(true);
  }

  async createSubscriptionForClient(
    clientId: string,
    data: { type: SubscriptionType; startDate: string },
  ): Promise<void> {
    await adminCreateSubscription(clientId, data);
    await this.loadClients(true);
  }

  getClientById(id: string): ClientWithSubscriptions | undefined {
    return this.clients.find(c => c.id === id);
  }

  reset(): void {
    this.clients = [];
    this.cachedAt = null;
    this.error = '';
  }
}
