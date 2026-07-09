import api from './api';
import type { Holiday, HolidayRequest, ApiResponse } from '@/types';

export const holidayService = {
  getAll: async (): Promise<Holiday[]> => {
    const { data } = await api.get<ApiResponse<Holiday[]>>('/holidays');
    return data.data!;
  },

  create: async (req: HolidayRequest): Promise<Holiday> => {
    const { data } = await api.post<ApiResponse<Holiday>>('/holidays', req);
    return data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/holidays/${id}`);
  },
};
