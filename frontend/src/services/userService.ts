import api from './api';
import type { User, UpdateUserRequest, ChangePasswordRequest, ApiResponse, PageResponse } from '@/types';

export const userService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/users/me');
    return data.data!;
  },

  updateMe: async (req: UpdateUserRequest): Promise<User> => {
    const { data } = await api.put<ApiResponse<User>>('/users/me', req);
    return data.data!;
  },

  changePassword: async (req: ChangePasswordRequest): Promise<void> => {
    await api.post('/users/me/change-password', req);
  },

  getAll: async (page = 0, size = 20): Promise<PageResponse<User>> => {
    const { data } = await api.get<ApiResponse<PageResponse<User>>>('/users', {
      params: { page, size },
    });
    return data.data!;
  },

  search: async (q: string): Promise<User[]> => {
    const { data } = await api.get<ApiResponse<User[]>>('/users/search', { params: { q } });
    return data.data!;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data!;
  },

  update: async (id: number, req: UpdateUserRequest): Promise<User> => {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, req);
    return data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleStatus: async (id: number): Promise<User> => {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`);
    return data.data!;
  },
};
