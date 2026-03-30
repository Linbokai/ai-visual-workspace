// ---------------------------------------------------------------------------
// Prompt Template Library
// Organized templates for common image generation scenarios
// ---------------------------------------------------------------------------

export interface PromptParameter {
  name: string;
  label: string;
  type: 'select' | 'text';
  options?: string[];
  default: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  category: PromptCategory;
  basePrompt: string;
  parameters: PromptParameter[];
  tags: string[];
  preview?: string; // emoji or icon hint
}

export type PromptCategory =
  | 'photography'
  | 'illustration'
  | '3d'
  | 'anime'
  | 'abstract'
  | 'composite';

export const CATEGORY_INFO: Record<PromptCategory, { label: string; labelCn: string; color: string }> = {
  photography: { label: 'Photography', labelCn: '摄影', color: '#4ade80' },
  illustration: { label: 'Illustration', labelCn: '插画', color: '#60a5fa' },
  '3d': { label: '3D Render', labelCn: '3D渲染', color: '#c084fc' },
  anime: { label: 'Anime', labelCn: '动漫', color: '#fb923c' },
  abstract: { label: 'Abstract', labelCn: '抽象', color: '#f472b6' },
  composite: { label: 'Composite', labelCn: '合成排版', color: '#facc15' },
};

// ---------------------------------------------------------------------------
// Prompt Building Blocks
// ---------------------------------------------------------------------------

export interface PromptTag {
  label: string;  // Chinese display label
  value: string;  // English prompt value
}

export const PROMPT_SUBJECTS: PromptTag[] = [
  { label: '人像', value: 'portrait of a person' },
  { label: '风景', value: 'landscape' },
  { label: '城市景观', value: 'cityscape' },
  { label: '静物', value: 'still life' },
  { label: '动物', value: 'animal' },
  { label: '建筑', value: 'architecture' },
  { label: '美食', value: 'food' },
  { label: '车辆', value: 'vehicle' },
  { label: '幻想生物', value: 'fantasy creature' },
  { label: '机器人', value: 'robot' },
  { label: '花卉', value: 'flower' },
  { label: '海洋场景', value: 'ocean scene' },
  { label: '山景', value: 'mountain scene' },
  { label: '森林场景', value: 'forest scene' },
];

export const PROMPT_STYLES: PromptTag[] = [
  { label: '写实', value: 'photorealistic' },
  { label: '油画', value: 'oil painting' },
  { label: '水彩', value: 'watercolor' },
  { label: '数字艺术', value: 'digital art' },
  { label: '铅笔素描', value: 'pencil sketch' },
  { label: '水墨画', value: 'ink drawing' },
  { label: '波普艺术', value: 'pop art' },
  { label: '极简主义', value: 'minimalist' },
  { label: '新艺术', value: 'art nouveau' },
  { label: '印象派', value: 'impressionist' },
  { label: '超现实', value: 'surrealist' },
  { label: '赛博朋克', value: 'cyberpunk' },
  { label: '蒸汽朋克', value: 'steampunk' },
  { label: '哥特风', value: 'gothic' },
  { label: '复古', value: 'retro' },
  { label: '蒸汽波', value: 'vaporwave' },
];

export const PROMPT_LIGHTING: PromptTag[] = [
  { label: '自然光', value: 'natural light' },
  { label: '黄金时刻', value: 'golden hour' },
  { label: '蓝调时刻', value: 'blue hour' },
  { label: '棚拍灯光', value: 'studio lighting' },
  { label: '戏剧灯光', value: 'dramatic lighting' },
  { label: '逆光', value: 'backlit' },
  { label: '轮廓光', value: 'rim lighting' },
  { label: '霓虹灯光', value: 'neon lighting' },
  { label: '烛光', value: 'candlelight' },
  { label: '月光', value: 'moonlight' },
  { label: '阴天', value: 'overcast' },
  { label: '强烈阴影', value: 'harsh shadows' },
  { label: '柔和漫射', value: 'soft diffused' },
  { label: '体积光', value: 'volumetric lighting' },
  { label: '明暗法', value: 'chiaroscuro' },
];

export const PROMPT_CAMERA_ANGLES: PromptTag[] = [
  { label: '平视', value: 'eye level' },
  { label: '低角度', value: 'low angle' },
  { label: '高角度', value: 'high angle' },
  { label: '鸟瞰', value: "bird's eye view" },
  { label: '仰视', value: "worm's eye view" },
  { label: '荷兰角', value: 'dutch angle' },
  { label: '过肩', value: 'over the shoulder' },
  { label: '近景', value: 'close-up' },
  { label: '极近景', value: 'extreme close-up' },
  { label: '广角', value: 'wide shot' },
  { label: '中景', value: 'medium shot' },
  { label: '航拍', value: 'aerial view' },
  { label: '鱼眼', value: 'fisheye' },
  { label: '微距', value: 'macro' },
  { label: '全景', value: 'panoramic' },
];

export const PROMPT_COLOR_PALETTES: PromptTag[] = [
  { label: '暖色调', value: 'warm tones' },
  { label: '冷色调', value: 'cool tones' },
  { label: '单色', value: 'monochrome' },
  { label: '粉彩', value: 'pastel colors' },
  { label: '鲜艳色彩', value: 'vibrant colors' },
  { label: '柔和色彩', value: 'muted colors' },
  { label: '大地色', value: 'earth tones' },
  { label: '霓虹色', value: 'neon colors' },
  { label: '黑白', value: 'black and white' },
  { label: '复古棕', value: 'sepia' },
  { label: '高对比', value: 'high contrast' },
  { label: '互补色', value: 'complementary colors' },
  { label: '类似色', value: 'analogous colors' },
  { label: '三色组', value: 'triadic colors' },
];

export const PROMPT_MOODS: PromptTag[] = [
  { label: '宁静', value: 'serene' },
  { label: '戏剧性', value: 'dramatic' },
  { label: '神秘', value: 'mysterious' },
  { label: '欢快', value: 'joyful' },
  { label: '忧郁', value: 'melancholic' },
  { label: '怀旧', value: 'nostalgic' },
  { label: '史诗', value: 'epic' },
  { label: '温馨', value: 'cozy' },
  { label: '诡异', value: 'eerie' },
  { label: '浪漫', value: 'romantic' },
  { label: '力量感', value: 'powerful' },
  { label: '平和', value: 'peaceful' },
  { label: '混乱', value: 'chaotic' },
  { label: '梦幻', value: 'dreamy' },
  { label: '活力', value: 'energetic' },
];

export const PROMPT_QUALITY_TAGS: PromptTag[] = [
  { label: '杰作', value: 'masterpiece' },
  { label: '最佳质量', value: 'best quality' },
  { label: '高度详细', value: 'highly detailed' },
  { label: '8K', value: '8k' },
  { label: '超写实', value: 'ultra-realistic' },
  { label: '专业级', value: 'professional' },
  { label: '获奖作品', value: 'award-winning' },
  { label: 'A站热门', value: 'trending on artstation' },
  { label: '锐利对焦', value: 'sharp focus' },
  { label: '精细细节', value: 'intricate details' },
];

// ---------------------------------------------------------------------------
// Template Library
// ---------------------------------------------------------------------------

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Photography
  {
    id: 'product-photo',
    name: 'Product Photography',
    nameCn: '产品摄影',
    description: 'Clean product shots with professional lighting',
    category: 'photography',
    basePrompt: '{subject}, professional product photography, {lighting}, {background}, sharp focus, high resolution, commercial quality',
    parameters: [
      { name: 'subject', label: 'Product', type: 'text', default: 'a sleek smartphone' },
      { name: 'lighting', label: 'Lighting', type: 'select', options: ['studio lighting', 'natural light', 'dramatic rim lighting', 'soft diffused light'], default: 'studio lighting' },
      { name: 'background', label: 'Background', type: 'select', options: ['white background', 'gradient background', 'marble surface', 'wooden table', 'dark background'], default: 'white background' },
    ],
    tags: ['product', 'commercial', 'clean'],
  },
  {
    id: 'portrait-photo',
    name: 'Portrait Photography',
    nameCn: '人像摄影',
    description: 'Professional portrait with customizable style',
    category: 'photography',
    basePrompt: '{subject}, {style} portrait photography, {lighting}, {mood}, bokeh background, shot on Canon EOS R5, 85mm lens, f/1.4',
    parameters: [
      { name: 'subject', label: 'Subject', type: 'text', default: 'a young woman' },
      { name: 'style', label: 'Style', type: 'select', options: ['fashion', 'editorial', 'candid', 'cinematic', 'dramatic'], default: 'cinematic' },
      { name: 'lighting', label: 'Lighting', type: 'select', options: ['golden hour', 'studio lighting', 'natural light', 'rembrandt lighting', 'butterfly lighting'], default: 'golden hour' },
      { name: 'mood', label: 'Mood', type: 'select', options: ['confident', 'dreamy', 'intense', 'serene', 'powerful'], default: 'confident' },
    ],
    tags: ['portrait', 'people', 'fashion'],
  },
  {
    id: 'landscape-photo',
    name: 'Landscape Photography',
    nameCn: '风景摄影',
    description: 'Stunning landscape with dramatic atmosphere',
    category: 'photography',
    basePrompt: '{subject}, {time} landscape photography, {weather}, {style}, ultra wide angle, high dynamic range, National Geographic quality',
    parameters: [
      { name: 'subject', label: 'Scene', type: 'text', default: 'majestic mountain range' },
      { name: 'time', label: 'Time of Day', type: 'select', options: ['sunrise', 'golden hour', 'blue hour', 'sunset', 'night sky', 'midday'], default: 'golden hour' },
      { name: 'weather', label: 'Weather', type: 'select', options: ['clear sky', 'dramatic clouds', 'foggy', 'stormy', 'snowy', 'rainy'], default: 'dramatic clouds' },
      { name: 'style', label: 'Style', type: 'select', options: ['epic', 'serene', 'moody', 'vibrant', 'minimalist'], default: 'epic' },
    ],
    tags: ['landscape', 'nature', 'scenery'],
  },
  {
    id: 'food-photo',
    name: 'Food Photography',
    nameCn: '美食摄影',
    description: 'Appetizing food shots with styled presentation',
    category: 'photography',
    basePrompt: '{subject}, professional food photography, {lighting}, {style}, appetizing presentation, garnished, styled plating, shallow depth of field',
    parameters: [
      { name: 'subject', label: 'Dish', type: 'text', default: 'gourmet pasta dish' },
      { name: 'lighting', label: 'Lighting', type: 'select', options: ['natural window light', 'soft studio light', 'warm candlelight', 'bright and airy'], default: 'natural window light' },
      { name: 'style', label: 'Style', type: 'select', options: ['rustic', 'modern minimalist', 'dark moody', 'bright editorial', 'overhead flat lay'], default: 'rustic' },
    ],
    tags: ['food', 'culinary', 'restaurant'],
  },

  // Illustration
  {
    id: 'fantasy-illustration',
    name: 'Fantasy Illustration',
    nameCn: '奇幻插画',
    description: 'Epic fantasy art with rich details',
    category: 'illustration',
    basePrompt: '{subject}, epic fantasy illustration, {style}, {lighting}, intricate details, rich colors, concept art, artstation trending',
    parameters: [
      { name: 'subject', label: 'Subject', type: 'text', default: 'a dragon flying over a castle' },
      { name: 'style', label: 'Style', type: 'select', options: ['realistic', 'painterly', 'comic book', 'art nouveau', 'dark fantasy'], default: 'painterly' },
      { name: 'lighting', label: 'Lighting', type: 'select', options: ['dramatic lighting', 'magical glow', 'moonlight', 'sunset', 'fire light'], default: 'dramatic lighting' },
    ],
    tags: ['fantasy', 'epic', 'concept art'],
  },
  {
    id: 'character-design',
    name: 'Character Design',
    nameCn: '角色设计',
    description: 'Character concept art for games and animation',
    category: 'illustration',
    basePrompt: '{subject}, character design sheet, {style}, full body, multiple angles, {palette}, detailed outfit design, concept art',
    parameters: [
      { name: 'subject', label: 'Character', type: 'text', default: 'a cyberpunk warrior' },
      { name: 'style', label: 'Style', type: 'select', options: ['realistic', 'stylized', 'cartoon', 'anime-inspired', 'semi-realistic'], default: 'stylized' },
      { name: 'palette', label: 'Color Palette', type: 'select', options: ['vibrant colors', 'muted earth tones', 'monochrome', 'neon accents', 'pastel tones'], default: 'vibrant colors' },
    ],
    tags: ['character', 'design', 'concept'],
  },
  {
    id: 'book-cover',
    name: 'Book Cover',
    nameCn: '书籍封面',
    description: 'Eye-catching book cover illustration',
    category: 'illustration',
    basePrompt: '{subject}, book cover illustration, {genre} style, {mood}, cinematic composition, professional design, award-winning cover art',
    parameters: [
      { name: 'subject', label: 'Subject', type: 'text', default: 'mysterious forest with glowing portal' },
      { name: 'genre', label: 'Genre', type: 'select', options: ['fantasy', 'sci-fi', 'horror', 'romance', 'thriller', 'literary fiction'], default: 'fantasy' },
      { name: 'mood', label: 'Mood', type: 'select', options: ['mysterious', 'epic', 'romantic', 'dark', 'whimsical', 'dramatic'], default: 'mysterious' },
    ],
    tags: ['book', 'cover', 'publishing'],
  },

  // 3D
  {
    id: '3d-character',
    name: '3D Character',
    nameCn: '3D角色',
    description: 'High-quality 3D character render',
    category: '3d',
    basePrompt: '{subject}, 3D render, {style}, {lighting}, subsurface scattering, ambient occlusion, ray tracing, Octane render, Unreal Engine 5',
    parameters: [
      { name: 'subject', label: 'Character', type: 'text', default: 'a cute robot companion' },
      { name: 'style', label: 'Style', type: 'select', options: ['photorealistic', 'stylized', 'Pixar style', 'clay render', 'low poly'], default: 'Pixar style' },
      { name: 'lighting', label: 'Lighting', type: 'select', options: ['studio lighting', 'HDRI environment', 'dramatic three-point', 'neon rim light', 'natural outdoor'], default: 'studio lighting' },
    ],
    tags: ['3d', 'character', 'render'],
  },
  {
    id: '3d-environment',
    name: '3D Environment',
    nameCn: '3D场景',
    description: 'Detailed 3D environment scene',
    category: '3d',
    basePrompt: '{subject}, 3D environment render, {style}, {time}, volumetric fog, detailed textures, Unreal Engine 5, cinematic',
    parameters: [
      { name: 'subject', label: 'Scene', type: 'text', default: 'abandoned futuristic city' },
      { name: 'style', label: 'Style', type: 'select', options: ['realistic', 'stylized', 'isometric', 'diorama', 'architectural viz'], default: 'realistic' },
      { name: 'time', label: 'Time', type: 'select', options: ['daytime', 'sunset', 'night', 'overcast', 'dawn'], default: 'sunset' },
    ],
    tags: ['3d', 'environment', 'scene'],
  },

  // Anime
  {
    id: 'anime-character',
    name: 'Anime Character',
    nameCn: '动漫角色',
    description: 'Beautiful anime character illustration',
    category: 'anime',
    basePrompt: '{subject}, anime style, {quality}, {lighting}, {background}, detailed eyes, beautiful composition',
    parameters: [
      { name: 'subject', label: 'Character', type: 'text', default: 'a magical girl with flowing hair' },
      { name: 'quality', label: 'Quality', type: 'select', options: ['masterpiece, best quality', 'highly detailed', 'clean lines, sharp', 'professional illustration'], default: 'masterpiece, best quality' },
      { name: 'lighting', label: 'Lighting', type: 'select', options: ['soft lighting', 'dramatic backlighting', 'sakura petals, golden hour', 'moonlit, starry night', 'neon city lights'], default: 'soft lighting' },
      { name: 'background', label: 'Background', type: 'select', options: ['simple gradient', 'detailed cityscape', 'cherry blossom garden', 'starry sky', 'school rooftop'], default: 'simple gradient' },
    ],
    tags: ['anime', 'character', 'illustration'],
  },
  {
    id: 'anime-scene',
    name: 'Anime Scene',
    nameCn: '动漫场景',
    description: 'Atmospheric anime background and scene',
    category: 'anime',
    basePrompt: '{subject}, anime background, {style}, {mood}, Makoto Shinkai inspired, detailed scenery, beautiful sky, no people',
    parameters: [
      { name: 'subject', label: 'Scene', type: 'text', default: 'a train station at sunset' },
      { name: 'style', label: 'Style', type: 'select', options: ['Makoto Shinkai', 'Studio Ghibli', 'Kyoto Animation', 'realistic anime', 'watercolor anime'], default: 'Makoto Shinkai' },
      { name: 'mood', label: 'Mood', type: 'select', options: ['nostalgic', 'peaceful', 'melancholic', 'magical', 'adventurous'], default: 'nostalgic' },
    ],
    tags: ['anime', 'scene', 'background'],
  },

  // Abstract
  {
    id: 'abstract-art',
    name: 'Abstract Art',
    nameCn: '抽象艺术',
    description: 'Bold abstract art composition',
    category: 'abstract',
    basePrompt: '{subject}, abstract art, {style}, {palette}, dynamic composition, {texture}, gallery quality',
    parameters: [
      { name: 'subject', label: 'Theme', type: 'text', default: 'emotions and energy' },
      { name: 'style', label: 'Style', type: 'select', options: ['geometric', 'fluid', 'minimalist', 'expressionist', 'generative'], default: 'fluid' },
      { name: 'palette', label: 'Color Palette', type: 'select', options: ['bold primary colors', 'monochrome', 'pastel gradient', 'neon on black', 'earth tones', 'complementary contrast'], default: 'bold primary colors' },
      { name: 'texture', label: 'Texture', type: 'select', options: ['smooth', 'textured canvas', 'metallic', 'glass-like', 'grunge'], default: 'smooth' },
    ],
    tags: ['abstract', 'art', 'modern'],
  },
  {
    id: 'pattern-design',
    name: 'Pattern Design',
    nameCn: '图案设计',
    description: 'Seamless pattern for textiles and surfaces',
    category: 'abstract',
    basePrompt: '{subject}, seamless pattern, {style}, {palette}, tileable, surface design, textile print quality',
    parameters: [
      { name: 'subject', label: 'Motif', type: 'text', default: 'floral botanical elements' },
      { name: 'style', label: 'Style', type: 'select', options: ['botanical', 'geometric', 'art deco', 'tropical', 'Japanese wave', 'nordic'], default: 'botanical' },
      { name: 'palette', label: 'Colors', type: 'select', options: ['warm naturals', 'cool blues', 'vibrant mix', 'black and gold', 'pastel soft'], default: 'warm naturals' },
    ],
    tags: ['pattern', 'textile', 'design'],
  },

  // Composite / Layout Templates
  {
    id: 'storyboard',
    name: 'Storyboard',
    nameCn: '分镜故事板',
    description: 'Hollywood-style 3x3 storyboard grid with sequential shots',
    category: 'composite',
    basePrompt: 'Create a professional 3x3 storyboard grid showing sequential shots of {scene}. Each panel should have different camera angles: wide establishing shot, medium shot, close-up, over-the-shoulder, low angle, high angle, POV, tracking shot, final dramatic shot. {mood} mood progression, {style}, film grain, cinematic color grading',
    parameters: [
      { name: 'scene', label: 'Scene', type: 'text', default: 'a detective entering a dimly lit room' },
      { name: 'mood', label: 'Mood', type: 'select', options: ['tense', 'romantic', 'action-packed', 'mysterious', 'melancholic', 'triumphant'], default: 'tense' },
      { name: 'style', label: 'Style', type: 'select', options: ['noir film', 'modern blockbuster', 'indie drama', 'horror', 'sci-fi epic', 'animated feature'], default: 'modern blockbuster' },
    ],
    tags: ['storyboard', 'film', 'cinematic', 'grid'],
    preview: '🎬',
  },
  {
    id: 'grid-character-dynamics',
    name: 'Character Grid',
    nameCn: '九宫格角色动态',
    description: 'Character dynamic variations displayed in a 3x3 grid layout',
    category: 'composite',
    basePrompt: 'Character reference sheet for {character}, multiple poses and expressions in a 3x3 grid layout. Full body front view, side view, back view, facial expressions (happy, sad, angry, surprised), action pose, sitting pose. {style}, white background, professional character design, detailed annotations',
    parameters: [
      { name: 'character', label: 'Character', type: 'text', default: 'a fantasy elf ranger' },
      { name: 'style', label: 'Art Style', type: 'select', options: ['consistent anime style', 'semi-realistic digital art', 'cartoon illustration', 'concept art style', 'pixel art style'], default: 'semi-realistic digital art' },
    ],
    tags: ['grid', 'character', 'reference', 'poses'],
    preview: '🔲',
  },
  {
    id: 'upscale-enhance',
    name: 'Upscale Enhancement',
    nameCn: '超分辨率增强',
    description: 'High-resolution enhancement prompt for maximum detail and quality',
    category: 'composite',
    basePrompt: '{subject}, ultra high resolution, masterpiece quality, 8K UHD, extremely detailed, sharp focus, {style}, photorealistic, intricate details, maximum quality, best quality, absurdres, highres, {enhancement}',
    parameters: [
      { name: 'subject', label: 'Subject', type: 'text', default: 'the original image' },
      { name: 'style', label: 'Enhancement Style', type: 'select', options: ['professional photography', 'digital art render', 'film scan quality', 'studio master print', 'RAW photo processing'], default: 'professional photography' },
      { name: 'enhancement', label: 'Extra Detail', type: 'select', options: ['fine skin texture, pore detail', 'fabric weave detail, material texture', 'architectural detail, clean edges', 'foliage detail, natural textures', 'metallic reflections, surface detail'], default: 'fine skin texture, pore detail' },
    ],
    tags: ['upscale', 'enhance', 'quality', 'highres'],
    preview: '🔍',
  },
  {
    id: 'character-sheet',
    name: 'Character Sheet',
    nameCn: '角色设定图',
    description: 'Detailed character reference sheet with full annotations',
    category: 'composite',
    basePrompt: 'Detailed character reference sheet for {character}, professional character design document. Front view, three-quarter view, side profile, back view. Outfit details with callout annotations, color palette swatch, {extras}. {style}, clean white background, labeled reference sheet, production quality',
    parameters: [
      { name: 'character', label: 'Character', type: 'text', default: 'a steampunk inventor with goggles and mechanical arm' },
      { name: 'style', label: 'Art Style', type: 'select', options: ['game concept art', 'anime production art', 'western animation style', 'realistic illustration', 'comic book style'], default: 'game concept art' },
      { name: 'extras', label: 'Extra Elements', type: 'select', options: ['weapon/prop designs', 'facial expression lineup', 'accessories and gear detail', 'transformation stages', 'height comparison chart'], default: 'weapon/prop designs' },
    ],
    tags: ['character', 'sheet', 'reference', 'design'],
    preview: '📋',
  },
  {
    id: 'mood-board',
    name: 'Mood Board',
    nameCn: '情绪板',
    description: 'Cinematic 8-panel mood board for narrative composition',
    category: 'composite',
    basePrompt: 'Cinematic mood board, 8 panels showing {theme}. Include: establishing wide shot, character portrait, detail close-up, environmental texture, color palette swatch, typography sample, atmospheric scene, final composite. {style}, film photography aesthetic, {palette}',
    parameters: [
      { name: 'theme', label: 'Theme', type: 'text', default: 'a cozy autumn coffee shop story' },
      { name: 'style', label: 'Style', type: 'select', options: ['professional layout', 'collage style', 'editorial magazine', 'Pinterest aesthetic', 'film director lookbook'], default: 'professional layout' },
      { name: 'palette', label: 'Color Mood', type: 'select', options: ['warm golden tones', 'cool blue-grey tones', 'vibrant saturated', 'desaturated vintage', 'high contrast noir'], default: 'warm golden tones' },
    ],
    tags: ['mood board', 'narrative', 'composition', 'layout'],
    preview: '🎨',
  },
];

// ---------------------------------------------------------------------------
// Template Helpers
// ---------------------------------------------------------------------------

export function getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

export function buildPromptFromTemplate(
  template: PromptTemplate,
  paramValues: Record<string, string>,
): string {
  let prompt = template.basePrompt;
  for (const param of template.parameters) {
    const value = paramValues[param.name] || param.default;
    prompt = prompt.replace(`{${param.name}}`, value);
  }
  return prompt;
}

export function getAllCategories(): PromptCategory[] {
  return Object.keys(CATEGORY_INFO) as PromptCategory[];
}
