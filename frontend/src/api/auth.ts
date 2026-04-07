import axios from 'axios';

const authApi = axios.create({ baseURL: 'http://localhost:3000' });

export const register = (data: { name: string; email: string; password: string; role: string }) =>
  authApi.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  authApi.post<{ success: boolean; data: { accessToken: string } }>('/auth/login', data);

export const getMe = (token: string) =>
  authApi.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
