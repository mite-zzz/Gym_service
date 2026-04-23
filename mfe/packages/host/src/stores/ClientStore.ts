import { makeAutoObservable, runInAction } from 'mobx';
import { getMyProfile, createProfile, updateProfile, getMySubscriptions, createSubscription, updateSubscription, deleteSubscription, Client, Subscription, SubscriptionType } from '../api/gym';

const CACHE_TTL = 5 * 60 * 1000;

export class ClientStore {
  profile: Client | null = null;
  subscriptions: Subscription[] = [];
  profileLoading = false;
  subscriptionsLoading = false;
  profileError = '';
  subscriptionsError = '';
  private profileCachedAt: number | null = null;
  private subscriptionsCachedAt: number | null = null;

  constructor() { makeAutoObservable(this); }

  get activeSubscriptions() { return this.subscriptions.filter(s => new Date() <= new Date(s.endDate)); }
  get expiredSubscriptions() { return this.subscriptions.filter(s => new Date() > new Date(s.endDate)); }
  get hasProfile() { return this.profile !== null; }
  get hasActiveSubscription() { return this.activeSubscriptions.length > 0; }

  private isProfileCacheValid() { return this.profileCachedAt !== null && Date.now() - this.profileCachedAt < CACHE_TTL; }
  private isSubscriptionsCacheValid() { return this.subscriptionsCachedAt !== null && Date.now() - this.subscriptionsCachedAt < CACHE_TTL; }

  async loadProfile(force = false) {
    if (!force && this.isProfileCacheValid()) return;
    runInAction(() => { this.profileLoading = true; this.profileError = ''; });
    try {
      const res = await getMyProfile();
      runInAction(() => { this.profile = res.data; this.profileCachedAt = Date.now(); });
    } catch (e: any) {
      runInAction(() => {
        if (e.response?.status === 404) { this.profile = null; this.profileCachedAt = Date.now(); }
        else { this.profileError = 'Failed to load profile'; }
      });
    } finally { runInAction(() => { this.profileLoading = false; }); }
  }

  async saveProfile(data: { name: string; email: string; phone?: string }) {
    const res = !this.profile ? await createProfile(data) : await updateProfile(data);
    runInAction(() => { this.profile = res.data; this.profileCachedAt = Date.now(); });
  }

  async loadSubscriptions(force = false) {
    if (!force && this.isSubscriptionsCacheValid()) return;
    runInAction(() => { this.subscriptionsLoading = true; this.subscriptionsError = ''; });
    try {
      const res = await getMySubscriptions();
      runInAction(() => { this.subscriptions = res.data; this.subscriptionsCachedAt = Date.now(); });
    } catch { runInAction(() => { this.subscriptionsError = 'Failed to load subscriptions'; }); }
    finally { runInAction(() => { this.subscriptionsLoading = false; }); }
  }

  async addSubscription(data: { type: SubscriptionType; startDate: string }) {
    await createSubscription(data); await this.loadSubscriptions(true);
  }
  async editSubscription(id: string, data: { type?: SubscriptionType; startDate?: string }) {
    await updateSubscription(id, data); await this.loadSubscriptions(true);
  }
  async removeSubscription(id: string) {
    await deleteSubscription(id);
    runInAction(() => { this.subscriptions = this.subscriptions.filter(s => s.id !== id); });
  }

  reset() {
    this.profile = null; this.subscriptions = [];
    this.profileCachedAt = null; this.subscriptionsCachedAt = null;
  }
}
