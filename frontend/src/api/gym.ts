import axios from 'axios';

const gymApi = axios.create({ baseURL: 'http://localhost:3001' });

gymApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type SubscriptionType = 'monthly' | 'yearly';

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  clientId: string;
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const getMyProfile = () => gymApi.get<Client>('/clients/me');
export const createProfile = (data: Partial<Client>) => gymApi.post<Client>('/clients/me', data);
export const updateProfile = (data: Partial<Client>) => gymApi.put<Client>('/clients/me', data);

export const getMySubscriptions = () => gymApi.get<Subscription[]>('/subscriptions/my');
export const createSubscription = (data: { type: SubscriptionType; startDate: string }) =>
  gymApi.post<Subscription>('/subscriptions', data);
export const updateSubscription = (id: string, data: { type?: SubscriptionType; startDate?: string }) =>
  gymApi.put<Subscription>(`/subscriptions/${id}`, data);
export const deleteSubscription = (id: string) => gymApi.delete(`/subscriptions/${id}`);

export interface ClientWithSubscriptions extends Client {
  subscriptions: Subscription[];
}
export const adminGetAllClients = () => gymApi.get<ClientWithSubscriptions[]>('/admin/clients');
export const adminGetClient = (id: string) => gymApi.get<ClientWithSubscriptions>(`/admin/clients/${id}`);
export const adminDeleteClient = (id: string) => gymApi.delete(`/admin/clients/${id}`);
export const adminCreateSubscription = (clientId: string, data: { type: SubscriptionType; startDate: string }) =>
  gymApi.post<Subscription>(`/admin/clients/${clientId}/subscriptions`, data);
