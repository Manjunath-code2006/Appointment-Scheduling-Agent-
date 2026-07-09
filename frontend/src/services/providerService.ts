import api from './api';
import type { Provider, WorkingHoursRequest, ApiResponse } from '@/types';

export const providerService = {
  getAll: async (): Promise<Provider[]> => {
    const { data } = await api.get<ApiResponse<Provider[]>>('/providers');
    return data.data!;
  },

  getById: async (id: number): Promise<Provider> => {
    const { data } = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
    return data.data!;
  },

  create: async (req: {
    userId: number;
    specialization?: string;
    bio?: string;
    location?: string;
    bufferMinutes?: number;
    maxAppointmentsPerDay?: number;
    serviceIds?: number[];
  }): Promise<Provider> => {
    const { data } = await api.post<ApiResponse<Provider>>('/providers', req);
    return data.data!;
  },

  update: async (
    id: number,
    req: {
      specialization?: string;
      bio?: string;
      location?: string;
      bufferMinutes?: number;
      maxAppointmentsPerDay?: number;
      serviceIds?: number[];
      userId: number;
    },
  ): Promise<Provider> => {
    const { data } = await api.put<ApiResponse<Provider>>(`/providers/${id}`, req);
    return data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/providers/${id}`);
  },

  updateWorkingHours: async (id: number, req: WorkingHoursRequest[]): Promise<void> => {
    await api.put(`/providers/${id}/working-hours`, req);
  },
};
