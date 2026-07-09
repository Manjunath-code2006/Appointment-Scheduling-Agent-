import api from './api';
import type {
  LoginRequest, RegisterRequest, AuthResponse, ApiResponse,
} from '@/types';

export const authService = {
  login: async (req: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', req);
    return data.data!;
  },

  register: async (req: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', req);
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.get(`/auth/verify-email?token=${token}`);
  },
};
