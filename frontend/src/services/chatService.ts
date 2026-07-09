import api from './api';
import type { ChatRequest, ChatResponse, ApiResponse } from '@/types';

export const chatService = {
  sendMessage: async (req: ChatRequest): Promise<ChatResponse> => {
    const { data } = await api.post<ApiResponse<ChatResponse>>('/chat/message', req);
    return data.data!;
  },
};
