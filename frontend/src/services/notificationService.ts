import api from './api';
import type { Notification, ApiResponse } from '@/types';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get<ApiResponse<Notification[]>>('/notifications');
    return data.data!;
  },

  getUnread: async (): Promise<Notification[]> => {
    const { data } = await api.get<ApiResponse<Notification[]>>('/notifications/unread');
    return data.data!;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<ApiResponse<{ count: number }>>('/notifications/unread/count');
    return data.data!.count;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const { data } = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return data.data!;
  },

  markAllAsRead: async (): Promise<number> => {
    const { data } = await api.patch<ApiResponse<{ updated: number }>>('/notifications/read-all');
    return data.data!.updated;
  },
};
