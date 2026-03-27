import type { CanvasData } from './project';

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  category: string;
  canvas_data: CanvasData;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  project_id: string;
  node_id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  prompt?: string;
  created_at: string;
}
