import api from './api';
import type { Service, ServiceRequest, ApiResponse } from '@/types';

export const serviceTypeService = {
  getAll: async (activeOnly = true): Promise<Service[]> => {
    const { data } = await api.get<ApiResponse<Service[]>>('/services', {
      params: { activeOnly },
    });
    return data.data!;
  },

  getById: async (id: number): Promise<Service> => {
    const { data } = await api.get<ApiResponse<Service>>(`/services/${id}`);
    return data.data!;
  },

  create: async (req: ServiceRequest): Promise<Service> => {
    const { data } = await api.post<ApiResponse<Service>>('/services', req);
    return data.data!;
  },

  update: async (id: number, req: ServiceRequest): Promise<Service> => {
    const { data } = await api.put<ApiResponse<Service>>(`/services/${id}`, req);
    return data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};
