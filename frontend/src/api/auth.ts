import axios from 'axios';

const authApi = axios.create({ baseURL: 'http://localhost:3000' });

export const register = (data: { name: string; email: string; password: string; role: string }) =>
  authApi.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  authApi.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>('/auth/login', data);

export const refreshTokens = (refreshToken: string) =>
  authApi.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>('/auth/refresh', { refreshToken });

export const logoutApi = (token: string) =>
  authApi.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });

export const getMe = (token: string) =>
  authApi.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
