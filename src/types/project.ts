import type { Node, Edge } from '@xyflow/react';

export interface Project {
  id: string;
  name: string;
  thumbnail: string | null;
  owner_id: string;
  team_id: string | null;
  created_at: string;
  updated_at: string;
  canvas_data: CanvasData;
}

export interface CanvasData {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export type NodeType =
  | 'image'
  | 'video'
  | 'text'
  | 'audio'
  | 'group'
  | 'image-editor'
  | 'pose-generator'
  | 'doodle-video'
  | 'doodle-image'
  | 'compare';

export type NodeStatus = 'idle' | 'processing' | 'completed' | 'error';

export type ImageModel = 'midjourney' | 'dall-e-3' | 'flux' | 'jimeng' | 'sdxl';
export type VideoModel = 'sora' | 'veo' | 'runway' | 'pika' | 'kling';

export type ResolutionPreset = '512x512' | '768x768' | '1024x1024' | '1024x768' | '768x1024' | '1920x1080' | '1080x1920';

export type CameraMotion = 'none' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'zoom-in' | 'zoom-out' | 'orbit' | 'dolly-in' | 'dolly-out' | 'tilt-up' | 'tilt-down';

export interface ImageNodeData extends Record<string, unknown> {
  label: string;
  imageUrl: string | null;
  originalUrl?: string;
  referenceImageUrl?: string;
  prompt?: string;
  negativePrompt?: string;
  width: number;
  height: number;
  format: string;
  model?: ImageModel;
  resolutionPreset?: ResolutionPreset;
  samplingSteps?: number;
  cfgScale?: number;
  seed?: number;
  denoisingStrength?: number;
  progress?: number;
  showComparison?: boolean;
}

export interface VideoNodeData extends Record<string, unknown> {
  label: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  prompt?: string;
  model?: VideoModel;
  fps?: number;
  resolution?: string;
  cameraMotion?: CameraMotion;
  keyframes?: Array<{ time: number; label: string }>;
  progress?: number;
}

export interface TextNodeData extends Record<string, unknown> {
  label: string;
  content: string;
  prompt?: string;
  fontSize?: number;
  maxWidth?: number;
}

export interface AudioNodeData extends Record<string, unknown> {
  label: string;
  audioUrl: string | null;
  duration: number;
  prompt?: string;
  voiceStyle?: string;
  speed?: number;
}

export interface ImageEditorNodeData extends Record<string, unknown> {
  label: string;
  imageUrl: string | null;
  originalUrl?: string;
  prompt?: string;
  width: number;
  height: number;
  format: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  activeFilter?: string;
}

export interface DoodleNodeData extends Record<string, unknown> {
  label: string;
  imageUrl: string | null;
  doodleDataUrl?: string;
  prompt?: string;
  width: number;
  height: number;
  format: string;
  brushSize?: number;
  brushColor?: string;
}

export interface CompareNodeData extends Record<string, unknown> {
  label: string;
  imageUrlA: string | null;
  imageUrlB: string | null;
  labelA?: string;
  labelB?: string;
  splitPosition?: number;
  prompt?: string;
}

export type NodeData =
  | ImageNodeData
  | VideoNodeData
  | TextNodeData
  | AudioNodeData
  | ImageEditorNodeData
  | DoodleNodeData
  | CompareNodeData;

// Extend React Flow's Node type with our status field
export type CanvasNode = Node<NodeData, NodeType> & {
  status: NodeStatus;
};

// Extend React Flow's Edge type
export type CanvasEdge = Edge & {
  type: 'process';
  data?: {
    operation: string;
  };
};
