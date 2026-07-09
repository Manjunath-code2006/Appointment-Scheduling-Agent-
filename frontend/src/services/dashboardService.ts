import api from './api';
import type { DashboardStats, ApiResponse } from '@/types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard');
    return data.data!;
  },
};
