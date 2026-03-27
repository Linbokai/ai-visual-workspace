import { apiClient } from './client';
import type { Project, CanvasData } from '@/types';

export const projectsApi = {
  list: (params?: { tab?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get<{ data: Project[]; total: number }>('/projects', { params }),

  get: (id: string) =>
    apiClient.get<{ data: Project }>(`/projects/${id}`),

  create: (body: { name: string; template_id?: string }) =>
    apiClient.post<{ data: Project }>('/projects', body),

  update: (id: string, body: { name?: string; canvas_data?: CanvasData }) =>
    apiClient.put(`/projects/${id}`, body),

  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),

  duplicate: (id: string) =>
    apiClient.post<{ data: Project }>(`/projects/${id}/duplicate`),

  saveCanvas: (id: string, canvas_data: CanvasData) =>
    apiClient.put(`/projects/${id}/canvas`, { canvas_data }),
};
