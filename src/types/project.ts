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
  | 'compare'
  | 'novel-input'
  | 'video-analyze'
  | 'extract-characters-scenes'
  | 'character-description'
  | 'scene-description'
  | 'gen-image'
  | 'gen-video'
  | 'generate-character-image'
  | 'generate-character-video'
  | 'generate-scene-image'
  | 'generate-scene-video'
  | 'create-character'
  | 'create-scene'
  | 'storyboard-node'
  | 'preview'
  | 'local-save'
  | 'mask-editor';

export type NodeStatus = 'idle' | 'processing' | 'completed' | 'error';

export type ImageModel = 'midjourney' | 'dall-e-3' | 'flux' | 'jimeng' | 'sdxl' | 'jimeng-4.5' | 'jimeng-3.0' | 'nanobananapro' | 'gpt-4o-image' | 'gemini-image';
export type VideoModel = 'sora' | 'veo' | 'runway' | 'pika' | 'kling' | 'sora-2' | 'jimeng-video-3.5' | 'grok-video' | 'veo3';

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

export interface NovelInputNodeData extends Record<string, unknown> {
  label: string;
  content: string;
  prompt?: string;
  wordCount: number;
}

export interface VideoAnalyzeNodeData extends Record<string, unknown> {
  label: string;
  videoUrl: string | null;
  scenes: Array<{ timestamp: number; description: string; thumbnailUrl: string | null }>;
  keyframes: Array<{ time: number; imageUrl: string | null }>;
  analysisStatus: 'idle' | 'extracting' | 'detecting' | 'selecting' | 'done';
}

export interface CharacterData {
  name: string;
  identity: string;
  appearance: string;
  age: string;
  gender: string;
  imageUrl: string | null;
}

export interface SceneData {
  name: string;
  environment: string;
  description: string;
  mood: string;
  imageUrl: string | null;
}

export interface ExtractCharactersScenesNodeData extends Record<string, unknown> {
  label: string;
  sourceText: string;
  characters: CharacterData[];
  scenes: SceneData[];
  prompt?: string;
}

export interface CharacterDescriptionNodeData extends Record<string, unknown> {
  label: string;
  character: CharacterData | null;
  description: string;
  prompt?: string;
}

export interface SceneDescriptionNodeData extends Record<string, unknown> {
  label: string;
  scene: SceneData | null;
  description: string;
  prompt?: string;
}

export interface GenerateCharacterImageNodeData extends Record<string, unknown> {
  label: string;
  character: CharacterData | null;
  imageUrl: string | null;
  prompt?: string;
  model: ImageModel;
  progress: number;
}

export interface GenerateCharacterVideoNodeData extends Record<string, unknown> {
  label: string;
  character: CharacterData | null;
  videoUrl: string | null;
  prompt?: string;
  model: VideoModel;
  duration: number;
  progress: number;
}

export interface GenerateSceneImageNodeData extends Record<string, unknown> {
  label: string;
  scene: SceneData | null;
  imageUrl: string | null;
  prompt?: string;
  model: ImageModel;
  progress: number;
}

export interface GenerateSceneVideoNodeData extends Record<string, unknown> {
  label: string;
  scene: SceneData | null;
  videoUrl: string | null;
  prompt?: string;
  model: VideoModel;
  duration: number;
  progress: number;
}

export interface CreateCharacterNodeData extends Record<string, unknown> {
  label: string;
  character: CharacterData | null;
  referenceImages: string[];
  notes: string;
  prompt?: string;
}

export interface CreateSceneNodeData extends Record<string, unknown> {
  label: string;
  scene: SceneData | null;
  referenceImages: string[];
  notes: string;
  prompt?: string;
}

export interface StoryboardNodeData extends Record<string, unknown> {
  label: string;
  shots: Array<{
    id: string;
    shotNumber: number;
    description: string;
    imageUrl: string | null;
    prompt: string;
    cameraAngle: string;
    duration: number;
  }>;
  prompt?: string;
}

export interface PreviewNodeData extends Record<string, unknown> {
  label: string;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | 'audio';
  prompt?: string;
}

export interface LocalSaveNodeData extends Record<string, unknown> {
  label: string;
  savePath: string;
  format: string;
  autoSave: boolean;
  lastSavedAt: string | null;
  prompt?: string;
}

export interface MaskEditorNodeData extends Record<string, unknown> {
  label: string;
  imageUrl: string | null;
  maskDataUrl: string | null;
  brushSize: number;
  prompt?: string;
  width: number;
  height: number;
}

export type NodeData =
  | ImageNodeData
  | VideoNodeData
  | TextNodeData
  | AudioNodeData
  | ImageEditorNodeData
  | DoodleNodeData
  | CompareNodeData
  | NovelInputNodeData
  | VideoAnalyzeNodeData
  | ExtractCharactersScenesNodeData
  | CharacterDescriptionNodeData
  | SceneDescriptionNodeData
  | GenerateCharacterImageNodeData
  | GenerateCharacterVideoNodeData
  | GenerateSceneImageNodeData
  | GenerateSceneVideoNodeData
  | CreateCharacterNodeData
  | CreateSceneNodeData
  | StoryboardNodeData
  | PreviewNodeData
  | LocalSaveNodeData
  | MaskEditorNodeData;

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
