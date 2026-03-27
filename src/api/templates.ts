import { apiClient } from './client';
import type { Template } from '@/types';

export const templatesApi = {
  list: (params?: { tab?: string; search?: string; category?: string }) =>
    apiClient.get<{ data: Template[] }>('/templates', { params }),

  create: (body: { name: string; description: string; canvas_data: object; is_public: boolean }) =>
    apiClient.post<{ data: Template }>('/templates', body),

  delete: (id: string) =>
    apiClient.delete(`/templates/${id}`),

  apply: (id: string, projectId: string) =>
    apiClient.post(`/templates/${id}/apply`, { project_id: projectId }),
};
