import api from './axios';

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const adminLogin = (email: string, password: string) =>
  api.post('/api/auth/admin-login', { email, password });

export const signup = (userData: { email: string; password: string; name: string }) =>
  api.post('/api/auth/register', userData);

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/api/auth/change-password', { currentPassword, newPassword }); 