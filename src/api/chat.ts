import type { Attachment } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const chatApi = {
  sendMessage: (body: {
    project_id: string;
    message: string;
    context_nodes: string[];
    attachments: Attachment[];
  }) => {
    // Returns EventSource for SSE streaming
    const params = new URLSearchParams({
      project_id: body.project_id,
      message: body.message,
    });
    return new EventSource(`${API_BASE_URL}/chat/message?${params}`);
  },
};
