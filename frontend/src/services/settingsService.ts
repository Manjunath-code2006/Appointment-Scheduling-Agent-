import api from './api';
import type { AppSettings, ApiResponse } from '@/types';

export const settingsService = {
  get: async (): Promise<AppSettings> => {
    const { data } = await api.get<ApiResponse<AppSettings>>('/settings');
    return data.data!;
  },

  update: async (req: Partial<AppSettings>): Promise<AppSettings> => {
    const { data } = await api.put<ApiResponse<AppSettings>>('/settings', req);
    return data.data!;
  },
};
