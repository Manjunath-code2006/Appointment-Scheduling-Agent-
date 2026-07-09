import api from './api';
import type {
  Appointment, AppointmentRequest, RescheduleRequest, CancelRequest,
  AppointmentStatus, AvailabilityResponse, ApiResponse, PageResponse,
} from '@/types';

export const appointmentService = {
  book: async (req: AppointmentRequest): Promise<Appointment> => {
    const { data } = await api.post<ApiResponse<Appointment>>('/appointments', req);
    return data.data!;
  },

  getById: async (id: number): Promise<Appointment> => {
    const { data } = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return data.data!;
  },

  getAll: async (page = 0, size = 20): Promise<PageResponse<Appointment>> => {
    const { data } = await api.get<ApiResponse<PageResponse<Appointment>>>('/appointments', {
      params: { page, size },
    });
    return data.data!;
  },

  getMy: async (): Promise<Appointment[]> => {
    const { data } = await api.get<ApiResponse<Appointment[]>>('/appointments/my');
    return data.data!;
  },

  getUpcoming: async (): Promise<Appointment[]> => {
    const { data } = await api.get<ApiResponse<Appointment[]>>('/appointments/upcoming');
    return data.data!;
  },

  getByDate: async (date: string): Promise<Appointment[]> => {
    const { data } = await api.get<ApiResponse<Appointment[]>>(`/appointments/date/${date}`);
    return data.data!;
  },

  getByRange: async (start: string, end: string): Promise<Appointment[]> => {
    const { data } = await api.get<ApiResponse<Appointment[]>>('/appointments/range', {
      params: { start, end },
    });
    return data.data!;
  },

  reschedule: async (id: number, req: RescheduleRequest): Promise<Appointment> => {
    const { data } = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, req);
    return data.data!;
  },

  cancel: async (id: number, req: CancelRequest): Promise<Appointment> => {
    const { data } = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, req);
    return data.data!;
  },

  updateStatus: async (id: number, status: AppointmentStatus): Promise<Appointment> => {
    const { data } = await api.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/status`,
      null,
      { params: { status } },
    );
    return data.data!;
  },

  getAvailability: async (
    providerId: number,
    date: string,
    serviceId?: number,
  ): Promise<AvailabilityResponse> => {
    const { data } = await api.get<ApiResponse<AvailabilityResponse>>(
      `/availability/provider/${providerId}`,
      { params: { date, serviceId } },
    );
    return data.data!;
  },
};
