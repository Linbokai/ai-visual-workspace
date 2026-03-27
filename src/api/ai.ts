import { apiClient } from './client';

export const aiApi = {
  generateImage: (body: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    model?: string;
  }) => apiClient.post<{ task_id: string }>('/ai/generate-image', body),

  enhanceImage: (body: {
    image_url: string;
    scale?: number;
    model?: string;
  }) => apiClient.post<{ task_id: string }>('/ai/enhance-image', body),

  imageToVideo: (body: {
    image_url: string;
    prompt?: string;
    duration?: number;
    model?: string;
  }) => apiClient.post<{ task_id: string }>('/ai/image-to-video', body),

  getTaskStatus: (taskId: string) =>
    apiClient.get<{ status: string; progress: number; result_url?: string }>(
      `/ai/task/${taskId}`
    ),
};
