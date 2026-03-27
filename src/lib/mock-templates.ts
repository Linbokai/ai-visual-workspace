import type { Template, HistoryItem } from '@/types';

export const templateCategories = [
  { id: 'all', label: 'All' },
  { id: 'generation', label: 'Generation' },
  { id: 'enhancement', label: 'Enhancement' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'production', label: 'Production' },
] as const;

export type TemplateCategory = (typeof templateCategories)[number]['id'];

export const mockTemplates: Template[] = [
  // 1. Text to Image (文生图)
  {
    id: 'tmpl-001',
    name: 'Text to Image',
    thumbnail: '',
    description: '文生图 - Generate images from text prompts. Start with a descriptive text and produce a stunning AI-generated image.',
    category: 'Generation',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't1-n1',
          type: 'text' as const,
          position: { x: 100, y: 150 },
          data: {
            label: 'Prompt',
            content: 'A majestic mountain landscape at golden hour, with dramatic clouds and a crystal-clear lake reflecting the peaks, photorealistic, 8K resolution',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't1-n2',
          type: 'image' as const,
          position: { x: 500, y: 120 },
          data: {
            label: 'Generated Image',
            imageUrl: null,
            width: 1024,
            height: 1024,
            format: 'png',
            prompt: '',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't1-e1', source: 't1-n1', target: 't1-n2', type: 'process' as const, data: { operation: 'generate' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },

  // 2. Image to Video (图生视频)
  {
    id: 'tmpl-002',
    name: 'Image to Video',
    thumbnail: '',
    description: '图生视频 - Animate a still image into a dynamic video clip. Perfect for creating motion content from static visuals.',
    category: 'Generation',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't2-n1',
          type: 'image' as const,
          position: { x: 100, y: 150 },
          data: {
            label: 'Source Image',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: 'Upload or generate the base image to animate',
          },
          status: 'idle' as const,
        },
        {
          id: 't2-n2',
          type: 'text' as const,
          position: { x: 100, y: 380 },
          data: {
            label: 'Motion Prompt',
            content: 'Gentle camera pan to the right, clouds drifting slowly, water rippling softly',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't2-n3',
          type: 'video' as const,
          position: { x: 520, y: 200 },
          data: {
            label: 'Generated Video',
            videoUrl: null,
            thumbnailUrl: null,
            duration: 5,
            prompt: '',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't2-e1', source: 't2-n1', target: 't2-n3', type: 'process' as const, data: { operation: 'animate' } },
        { id: 't2-e2', source: 't2-n2', target: 't2-n3', type: 'process' as const, data: { operation: 'motion_guide' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },

  // 3. Style Transfer (风格迁移)
  {
    id: 'tmpl-003',
    name: 'Style Transfer',
    thumbnail: '',
    description: '风格迁移 - Combine a source image with an artistic style reference to create a stylized output.',
    category: 'Enhancement',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't3-n1',
          type: 'image' as const,
          position: { x: 100, y: 80 },
          data: {
            label: 'Source Image',
            imageUrl: null,
            width: 1024,
            height: 1024,
            format: 'png',
            prompt: 'The content image you want to stylize',
          },
          status: 'idle' as const,
        },
        {
          id: 't3-n2',
          type: 'image' as const,
          position: { x: 100, y: 340 },
          data: {
            label: 'Style Reference',
            imageUrl: null,
            width: 512,
            height: 512,
            format: 'png',
            prompt: 'Reference image whose artistic style will be applied (e.g. Van Gogh, watercolor, anime)',
          },
          status: 'idle' as const,
        },
        {
          id: 't3-n3',
          type: 'image' as const,
          position: { x: 550, y: 200 },
          data: {
            label: 'Stylized Output',
            imageUrl: null,
            width: 1024,
            height: 1024,
            format: 'png',
            prompt: '',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't3-e1', source: 't3-n1', target: 't3-n3', type: 'process' as const, data: { operation: 'style_transfer' } },
        { id: 't3-e2', source: 't3-n2', target: 't3-n3', type: 'process' as const, data: { operation: 'style_reference' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },

  // 4. Image Enhancement Pipeline (图片增强)
  {
    id: 'tmpl-004',
    name: 'Image Enhancement Pipeline',
    thumbnail: '',
    description: '图片增强 - A three-stage pipeline: upscale resolution, then apply color correction for professional-quality results.',
    category: 'Enhancement',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't4-n1',
          type: 'image' as const,
          position: { x: 80, y: 160 },
          data: {
            label: 'Original Image',
            imageUrl: null,
            width: 512,
            height: 512,
            format: 'png',
            prompt: 'Upload the image you want to enhance',
          },
          status: 'idle' as const,
        },
        {
          id: 't4-n2',
          type: 'image' as const,
          position: { x: 420, y: 160 },
          data: {
            label: 'Upscaled (4x)',
            imageUrl: null,
            width: 2048,
            height: 2048,
            format: 'png',
            prompt: 'AI upscale to 4x resolution with detail enhancement',
          },
          status: 'idle' as const,
        },
        {
          id: 't4-n3',
          type: 'image' as const,
          position: { x: 760, y: 160 },
          data: {
            label: 'Color Corrected',
            imageUrl: null,
            width: 2048,
            height: 2048,
            format: 'png',
            prompt: 'Auto white balance, contrast boost, vibrance adjustment',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't4-e1', source: 't4-n1', target: 't4-n2', type: 'process' as const, data: { operation: 'upscale' } },
        { id: 't4-e2', source: 't4-n2', target: 't4-n3', type: 'process' as const, data: { operation: 'color_correct' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },

  // 5. Product Marketing (产品营销)
  {
    id: 'tmpl-005',
    name: 'Product Marketing',
    thumbnail: '',
    description: '产品营销 - From a single product photo, generate ad copy, a polished ad visual, and a short promo video.',
    category: 'Marketing',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't5-n1',
          type: 'image' as const,
          position: { x: 80, y: 200 },
          data: {
            label: 'Product Photo',
            imageUrl: null,
            width: 1024,
            height: 1024,
            format: 'png',
            prompt: 'Upload your product photo (clean background preferred)',
          },
          status: 'idle' as const,
        },
        {
          id: 't5-n2',
          type: 'text' as const,
          position: { x: 480, y: 50 },
          data: {
            label: 'Ad Copy',
            content: '',
            prompt: 'Generate compelling marketing copy: headline, tagline, and product description',
          },
          status: 'idle' as const,
        },
        {
          id: 't5-n3',
          type: 'image' as const,
          position: { x: 480, y: 230 },
          data: {
            label: 'Ad Visual',
            imageUrl: null,
            width: 1200,
            height: 628,
            format: 'png',
            prompt: 'Professional product advertisement with branded background and lighting effects',
          },
          status: 'idle' as const,
        },
        {
          id: 't5-n4',
          type: 'video' as const,
          position: { x: 480, y: 430 },
          data: {
            label: 'Promo Video',
            videoUrl: null,
            thumbnailUrl: null,
            duration: 15,
            prompt: 'Dynamic product showcase with zoom, rotation, and text overlay',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't5-e1', source: 't5-n1', target: 't5-n2', type: 'process' as const, data: { operation: 'generate_copy' } },
        { id: 't5-e2', source: 't5-n1', target: 't5-n3', type: 'process' as const, data: { operation: 'create_ad' } },
        { id: 't5-e3', source: 't5-n1', target: 't5-n4', type: 'process' as const, data: { operation: 'create_promo' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },

  // 6. Podcast Production (播客制作)
  {
    id: 'tmpl-006',
    name: 'Podcast Production',
    thumbnail: '',
    description: '播客制作 - Turn a script into a full podcast episode: generate voice narration, background music, then mix them together.',
    category: 'Production',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't6-n1',
          type: 'text' as const,
          position: { x: 80, y: 200 },
          data: {
            label: 'Script',
            content: 'Welcome to our podcast! Today we explore the fascinating world of AI-generated content and how it is transforming creative workflows...',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't6-n2',
          type: 'audio' as const,
          position: { x: 460, y: 100 },
          data: {
            label: 'Voice Narration',
            audioUrl: null,
            duration: 0,
            prompt: 'Natural, warm voice narration with clear enunciation, conversational tone',
          },
          status: 'idle' as const,
        },
        {
          id: 't6-n3',
          type: 'audio' as const,
          position: { x: 460, y: 320 },
          data: {
            label: 'Background Music',
            audioUrl: null,
            duration: 0,
            prompt: 'Soft ambient lo-fi music, suitable for podcast background, non-intrusive',
          },
          status: 'idle' as const,
        },
        {
          id: 't6-n4',
          type: 'audio' as const,
          position: { x: 820, y: 200 },
          data: {
            label: 'Mixed Episode',
            audioUrl: null,
            duration: 0,
            prompt: 'Final mix: voice at 100% volume, BGM at 20% volume, fade in/out',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't6-e1', source: 't6-n1', target: 't6-n2', type: 'process' as const, data: { operation: 'text_to_speech' } },
        { id: 't6-e2', source: 't6-n1', target: 't6-n3', type: 'process' as const, data: { operation: 'generate_bgm' } },
        { id: 't6-e3', source: 't6-n2', target: 't6-n4', type: 'process' as const, data: { operation: 'mix_audio' } },
        { id: 't6-e4', source: 't6-n3', target: 't6-n4', type: 'process' as const, data: { operation: 'mix_audio' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },

  // 7. Social Media Kit (社交媒体)
  {
    id: 'tmpl-007',
    name: 'Social Media Kit',
    thumbnail: '',
    description: '社交媒体 - From one hero image, generate optimized versions for Instagram square, Stories, and web banners.',
    category: 'Marketing',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't7-n1',
          type: 'image' as const,
          position: { x: 80, y: 200 },
          data: {
            label: 'Hero Image',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: 'Your primary high-resolution image',
          },
          status: 'idle' as const,
        },
        {
          id: 't7-n2',
          type: 'image' as const,
          position: { x: 480, y: 50 },
          data: {
            label: 'Square (1:1)',
            imageUrl: null,
            width: 1080,
            height: 1080,
            format: 'png',
            prompt: 'Center-crop to square for Instagram feed and Facebook posts',
          },
          status: 'idle' as const,
        },
        {
          id: 't7-n3',
          type: 'image' as const,
          position: { x: 480, y: 240 },
          data: {
            label: 'Story (9:16)',
            imageUrl: null,
            width: 1080,
            height: 1920,
            format: 'png',
            prompt: 'Vertical crop with background extension for Instagram/TikTok Stories',
          },
          status: 'idle' as const,
        },
        {
          id: 't7-n4',
          type: 'image' as const,
          position: { x: 480, y: 430 },
          data: {
            label: 'Banner (3:1)',
            imageUrl: null,
            width: 1500,
            height: 500,
            format: 'png',
            prompt: 'Wide crop for Twitter/LinkedIn banner and website header',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't7-e1', source: 't7-n1', target: 't7-n2', type: 'process' as const, data: { operation: 'resize_crop' } },
        { id: 't7-e2', source: 't7-n1', target: 't7-n3', type: 'process' as const, data: { operation: 'resize_extend' } },
        { id: 't7-e3', source: 't7-n1', target: 't7-n4', type: 'process' as const, data: { operation: 'resize_crop' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },

  // 8. AI Storyboard (AI 分镜)
  {
    id: 'tmpl-008',
    name: 'AI Storyboard',
    thumbnail: '',
    description: 'AI 分镜 - Transform a script into a visual storyboard: generate scene-by-scene images, then compile into a final video.',
    category: 'Production',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't8-n1',
          type: 'text' as const,
          position: { x: 80, y: 180 },
          data: {
            label: 'Script',
            content: 'Scene 1: Wide establishing shot of a futuristic city at dawn.\nScene 2: Close-up of the main character walking through neon-lit streets.\nScene 3: Dramatic reveal of the towering AI headquarters building.',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n2',
          type: 'image' as const,
          position: { x: 440, y: 60 },
          data: {
            label: 'Scene 1 - Establishing',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: 'Wide establishing shot, futuristic city skyline, dawn lighting, cinematic composition',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n3',
          type: 'image' as const,
          position: { x: 440, y: 250 },
          data: {
            label: 'Scene 2 - Character',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: 'Close-up portrait, character in neon-lit cyberpunk street, rain reflections, moody atmosphere',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n4',
          type: 'image' as const,
          position: { x: 440, y: 440 },
          data: {
            label: 'Scene 3 - Reveal',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: 'Low-angle dramatic shot, massive glass tower, holographic signage, volumetric lighting',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n5',
          type: 'video' as const,
          position: { x: 820, y: 240 },
          data: {
            label: 'Final Video',
            videoUrl: null,
            thumbnailUrl: null,
            duration: 30,
            prompt: 'Compile scenes with smooth transitions, cinematic color grading, ambient soundtrack',
          },
          status: 'idle' as const,
        },
      ],
      edges: [
        { id: 't8-e1', source: 't8-n1', target: 't8-n2', type: 'process' as const, data: { operation: 'generate_scene' } },
        { id: 't8-e2', source: 't8-n1', target: 't8-n3', type: 'process' as const, data: { operation: 'generate_scene' } },
        { id: 't8-e3', source: 't8-n1', target: 't8-n4', type: 'process' as const, data: { operation: 'generate_scene' } },
        { id: 't8-e4', source: 't8-n2', target: 't8-n5', type: 'process' as const, data: { operation: 'compose' } },
        { id: 't8-e5', source: 't8-n3', target: 't8-n5', type: 'process' as const, data: { operation: 'compose' } },
        { id: 't8-e6', source: 't8-n4', target: 't8-n5', type: 'process' as const, data: { operation: 'compose' } },
      ],
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const mockHistory: HistoryItem[] = [
  { id: 'h1', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: 'Product shot with white background', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'h2', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: 'Enhanced product photo', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'h3', project_id: 'proj-002', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: 'Social media hero banner', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'h4', project_id: 'proj-002', node_id: 'n3', type: 'video', url: '', thumbnail: '', prompt: 'Promo reel first draft', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'h5', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: 'Alternate lighting setup', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'h6', project_id: 'proj-002', node_id: 'n2', type: 'image', url: '', thumbnail: '', prompt: 'Square crop version', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'h7', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: 'Initial concept', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
];
