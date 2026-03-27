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
  | 'abstract';

export const CATEGORY_INFO: Record<PromptCategory, { label: string; labelCn: string; color: string }> = {
  photography: { label: 'Photography', labelCn: '摄影', color: '#4ade80' },
  illustration: { label: 'Illustration', labelCn: '插画', color: '#60a5fa' },
  '3d': { label: '3D Render', labelCn: '3D渲染', color: '#c084fc' },
  anime: { label: 'Anime', labelCn: '动漫', color: '#fb923c' },
  abstract: { label: 'Abstract', labelCn: '抽象', color: '#f472b6' },
};

// ---------------------------------------------------------------------------
// Prompt Building Blocks
// ---------------------------------------------------------------------------

export const PROMPT_SUBJECTS = [
  'portrait of a person', 'landscape', 'cityscape', 'still life',
  'animal', 'architecture', 'food', 'vehicle', 'fantasy creature',
  'robot', 'flower', 'ocean scene', 'mountain scene', 'forest scene',
];

export const PROMPT_STYLES = [
  'photorealistic', 'oil painting', 'watercolor', 'digital art',
  'pencil sketch', 'ink drawing', 'pop art', 'minimalist',
  'art nouveau', 'impressionist', 'surrealist', 'cyberpunk',
  'steampunk', 'gothic', 'retro', 'vaporwave',
];

export const PROMPT_LIGHTING = [
  'natural light', 'golden hour', 'blue hour', 'studio lighting',
  'dramatic lighting', 'backlit', 'rim lighting', 'neon lighting',
  'candlelight', 'moonlight', 'overcast', 'harsh shadows',
  'soft diffused', 'volumetric lighting', 'chiaroscuro',
];

export const PROMPT_CAMERA_ANGLES = [
  'eye level', 'low angle', 'high angle', 'bird\'s eye view',
  'worm\'s eye view', 'dutch angle', 'over the shoulder',
  'close-up', 'extreme close-up', 'wide shot', 'medium shot',
  'aerial view', 'fisheye', 'macro', 'panoramic',
];

export const PROMPT_COLOR_PALETTES = [
  'warm tones', 'cool tones', 'monochrome', 'pastel colors',
  'vibrant colors', 'muted colors', 'earth tones', 'neon colors',
  'black and white', 'sepia', 'high contrast', 'complementary colors',
  'analogous colors', 'triadic colors',
];

export const PROMPT_MOODS = [
  'serene', 'dramatic', 'mysterious', 'joyful', 'melancholic',
  'nostalgic', 'epic', 'cozy', 'eerie', 'romantic',
  'powerful', 'peaceful', 'chaotic', 'dreamy', 'energetic',
];

export const PROMPT_QUALITY_TAGS = [
  'masterpiece', 'best quality', 'highly detailed', '8k',
  'ultra-realistic', 'professional', 'award-winning',
  'trending on artstation', 'sharp focus', 'intricate details',
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
