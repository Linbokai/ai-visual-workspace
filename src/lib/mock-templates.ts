import type { Template, HistoryItem } from '@/types';

export const templateCategories = [
  { id: 'all', label: '全部' },
  { id: 'generation', label: '生成' },
  { id: 'enhancement', label: '增强' },
  { id: 'marketing', label: '营销' },
  { id: 'production', label: '制作' },
] as const;

export type TemplateCategory = (typeof templateCategories)[number]['id'];

export const mockTemplates: Template[] = [
  // 1. 文生图
  {
    id: 'tmpl-001',
    name: '文生图',
    thumbnail: '',
    description: '通过文本提示词生成图片。从描述性文字开始，生成令人惊叹的 AI 图片。',
    category: 'Generation',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't1-n1',
          type: 'text' as const,
          position: { x: 100, y: 150 },
          data: {
            label: '提示词',
            content: '金色时分的壮丽山景，戏剧性的云层和清澈的湖面倒映着山峰，写实风格，8K 分辨率',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't1-n2',
          type: 'image' as const,
          position: { x: 500, y: 120 },
          data: {
            label: '生成图片',
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

  // 2. 图生视频
  {
    id: 'tmpl-002',
    name: '图生视频',
    thumbnail: '',
    description: '将静态图片转化为动态视频。非常适合从静态素材创建动态内容。',
    category: 'Generation',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't2-n1',
          type: 'image' as const,
          position: { x: 100, y: 150 },
          data: {
            label: '源图片',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: '上传或生成要动画化的基础图片',
          },
          status: 'idle' as const,
        },
        {
          id: 't2-n2',
          type: 'text' as const,
          position: { x: 100, y: 380 },
          data: {
            label: '运动提示词',
            content: '缓慢向右平移镜头，云朵缓缓漂浮，水面轻轻泛起涟漪',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't2-n3',
          type: 'video' as const,
          position: { x: 520, y: 200 },
          data: {
            label: '生成视频',
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

  // 3. 风格迁移
  {
    id: 'tmpl-003',
    name: '风格迁移',
    thumbnail: '',
    description: '将源图片与艺术风格参考结合，创建风格化的输出作品。',
    category: 'Enhancement',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't3-n1',
          type: 'image' as const,
          position: { x: 100, y: 80 },
          data: {
            label: '源图片',
            imageUrl: null,
            width: 1024,
            height: 1024,
            format: 'png',
            prompt: '要进行风格化的内容图片',
          },
          status: 'idle' as const,
        },
        {
          id: 't3-n2',
          type: 'image' as const,
          position: { x: 100, y: 340 },
          data: {
            label: '风格参考',
            imageUrl: null,
            width: 512,
            height: 512,
            format: 'png',
            prompt: '将应用其艺术风格的参考图片（如梵高、水彩、动漫）',
          },
          status: 'idle' as const,
        },
        {
          id: 't3-n3',
          type: 'image' as const,
          position: { x: 550, y: 200 },
          data: {
            label: '风格化输出',
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

  // 4. 图片增强流水线
  {
    id: 'tmpl-004',
    name: '图片增强流水线',
    thumbnail: '',
    description: '三阶段流水线：提升分辨率，然后进行色彩校正，获得专业品质的结果。',
    category: 'Enhancement',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't4-n1',
          type: 'image' as const,
          position: { x: 80, y: 160 },
          data: {
            label: '原始图片',
            imageUrl: null,
            width: 512,
            height: 512,
            format: 'png',
            prompt: '上传要增强的图片',
          },
          status: 'idle' as const,
        },
        {
          id: 't4-n2',
          type: 'image' as const,
          position: { x: 420, y: 160 },
          data: {
            label: '超分辨率 (4x)',
            imageUrl: null,
            width: 2048,
            height: 2048,
            format: 'png',
            prompt: 'AI 超分辨率放大至 4 倍，增强细节',
          },
          status: 'idle' as const,
        },
        {
          id: 't4-n3',
          type: 'image' as const,
          position: { x: 760, y: 160 },
          data: {
            label: '色彩校正',
            imageUrl: null,
            width: 2048,
            height: 2048,
            format: 'png',
            prompt: '自动白平衡、对比度增强、饱和度调整',
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

  // 5. 产品营销
  {
    id: 'tmpl-005',
    name: '产品营销',
    thumbnail: '',
    description: '从一张产品照片出发，生成广告文案、精美广告图和短视频。',
    category: 'Marketing',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't5-n1',
          type: 'image' as const,
          position: { x: 80, y: 200 },
          data: {
            label: '产品照片',
            imageUrl: null,
            width: 1024,
            height: 1024,
            format: 'png',
            prompt: '上传产品照片（建议干净背景）',
          },
          status: 'idle' as const,
        },
        {
          id: 't5-n2',
          type: 'text' as const,
          position: { x: 480, y: 50 },
          data: {
            label: '广告文案',
            content: '',
            prompt: '生成吸引人的营销文案：标题、标语和产品描述',
          },
          status: 'idle' as const,
        },
        {
          id: 't5-n3',
          type: 'image' as const,
          position: { x: 480, y: 230 },
          data: {
            label: '广告视觉',
            imageUrl: null,
            width: 1200,
            height: 628,
            format: 'png',
            prompt: '专业产品广告，带品牌背景和灯光效果',
          },
          status: 'idle' as const,
        },
        {
          id: 't5-n4',
          type: 'video' as const,
          position: { x: 480, y: 430 },
          data: {
            label: '宣传视频',
            videoUrl: null,
            thumbnailUrl: null,
            duration: 15,
            prompt: '动感产品展示，包含缩放、旋转和文字叠加',
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

  // 6. 播客制作
  {
    id: 'tmpl-006',
    name: '播客制作',
    thumbnail: '',
    description: '将脚本转化为完整的播客节目：生成语音旁白、背景音乐，然后混音合成。',
    category: 'Production',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't6-n1',
          type: 'text' as const,
          position: { x: 80, y: 200 },
          data: {
            label: '脚本',
            content: '欢迎收听我们的播客！今天我们将探索 AI 生成内容的精彩世界，以及它是如何改变创意工作流程的...',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't6-n2',
          type: 'audio' as const,
          position: { x: 460, y: 100 },
          data: {
            label: '语音旁白',
            audioUrl: null,
            duration: 0,
            prompt: '自然温暖的语音旁白，吐字清晰，对话式语气',
          },
          status: 'idle' as const,
        },
        {
          id: 't6-n3',
          type: 'audio' as const,
          position: { x: 460, y: 320 },
          data: {
            label: '背景音乐',
            audioUrl: null,
            duration: 0,
            prompt: '柔和的 Lo-fi 氛围音乐，适合播客背景，不喧宾夺主',
          },
          status: 'idle' as const,
        },
        {
          id: 't6-n4',
          type: 'audio' as const,
          position: { x: 820, y: 200 },
          data: {
            label: '混音成品',
            audioUrl: null,
            duration: 0,
            prompt: '最终混音：语音 100% 音量，背景音乐 20% 音量，淡入淡出',
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

  // 7. 社交媒体套件
  {
    id: 'tmpl-007',
    name: '社交媒体套件',
    thumbnail: '',
    description: '从一张主图出发，生成适用于 Instagram 方形图、故事和网页横幅的优化版本。',
    category: 'Marketing',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't7-n1',
          type: 'image' as const,
          position: { x: 80, y: 200 },
          data: {
            label: '主图',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: '您的主要高分辨率图片',
          },
          status: 'idle' as const,
        },
        {
          id: 't7-n2',
          type: 'image' as const,
          position: { x: 480, y: 50 },
          data: {
            label: '方形 (1:1)',
            imageUrl: null,
            width: 1080,
            height: 1080,
            format: 'png',
            prompt: '居中裁剪为方形，用于 Instagram 动态和 Facebook 帖子',
          },
          status: 'idle' as const,
        },
        {
          id: 't7-n3',
          type: 'image' as const,
          position: { x: 480, y: 240 },
          data: {
            label: '故事 (9:16)',
            imageUrl: null,
            width: 1080,
            height: 1920,
            format: 'png',
            prompt: '竖版裁剪并扩展背景，用于 Instagram/抖音故事',
          },
          status: 'idle' as const,
        },
        {
          id: 't7-n4',
          type: 'image' as const,
          position: { x: 480, y: 430 },
          data: {
            label: '横幅 (3:1)',
            imageUrl: null,
            width: 1500,
            height: 500,
            format: 'png',
            prompt: '宽幅裁剪，用于社交平台横幅和网站头图',
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

  // 8. AI 分镜
  {
    id: 'tmpl-008',
    name: 'AI 分镜',
    thumbnail: '',
    description: '将脚本转化为视觉分镜：逐场景生成图片，然后编排成最终视频。',
    category: 'Production',
    canvas_data: {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 't8-n1',
          type: 'text' as const,
          position: { x: 80, y: 180 },
          data: {
            label: '脚本',
            content: '场景一：黎明时分未来城市的宽景全景。\n场景二：主角穿行于霓虹灯街道的特写。\n场景三：AI 总部大楼的戏剧性揭幕镜头。',
            prompt: '',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n2',
          type: 'image' as const,
          position: { x: 440, y: 60 },
          data: {
            label: '场景一 - 全景',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: '宽景全景，未来城市天际线，黎明光线，电影构图',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n3',
          type: 'image' as const,
          position: { x: 440, y: 250 },
          data: {
            label: '场景二 - 角色',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: '特写肖像，赛博朋克霓虹街道中的角色，雨水反射，氛围感',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n4',
          type: 'image' as const,
          position: { x: 440, y: 440 },
          data: {
            label: '场景三 - 揭幕',
            imageUrl: null,
            width: 1920,
            height: 1080,
            format: 'png',
            prompt: '低角度戏剧镜头，巨大玻璃塔楼，全息标牌，体积光',
          },
          status: 'idle' as const,
        },
        {
          id: 't8-n5',
          type: 'video' as const,
          position: { x: 820, y: 240 },
          data: {
            label: '最终视频',
            videoUrl: null,
            thumbnailUrl: null,
            duration: 30,
            prompt: '编排场景，流畅转场，电影调色，环境音乐',
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
  { id: 'h1', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: '白色背景的产品照片', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'h2', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: '增强后的产品照片', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'h3', project_id: 'proj-002', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: '社交媒体主视觉横幅', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'h4', project_id: 'proj-002', node_id: 'n3', type: 'video', url: '', thumbnail: '', prompt: '宣传短片初稿', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'h5', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: '替换布光方案', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'h6', project_id: 'proj-002', node_id: 'n2', type: 'image', url: '', thumbnail: '', prompt: '方形裁剪版本', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'h7', project_id: 'proj-001', node_id: 'n1', type: 'image', url: '', thumbnail: '', prompt: '初始概念', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
];
