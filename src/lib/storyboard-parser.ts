// ---------------------------------------------------------------------------
// Storyboard / Novel Parser
// Parses long-form text into scenes, extracts characters, generates prompts
// Supports Chinese and English text
// ---------------------------------------------------------------------------

export interface StoryCharacter {
  name: string;
  description: string;
  appearances: number[];  // Scene indices
}

export interface StoryScene {
  index: number;
  title: string;
  content: string;
  setting: string;
  characters: string[];
  dialogue: string[];
  mood: string;
  imagePrompt: string;
  cameraShot: string;
}

export interface StoryboardData {
  title: string;
  scenes: StoryScene[];
  characters: StoryCharacter[];
  totalScenes: number;
}

// ---------------------------------------------------------------------------
// Scene Splitting
// ---------------------------------------------------------------------------

const SCENE_DELIMITERS_EN = [
  /^#{1,3}\s+/m,                     // Markdown headers
  /^chapter\s+\d+/im,               // "Chapter 1"
  /^scene\s+\d+/im,                 // "Scene 1"
  /^act\s+\w+/im,                   // "Act I"
  /\n{3,}/,                         // Triple newlines
  /^---+$/m,                        // Horizontal rules
  /^\*\*\*+$/m,                     // Star separators
  /^INT\.|^EXT\./m,                 // Screenplay format
];

const SCENE_DELIMITERS_CN = [
  /^第[一二三四五六七八九十百千\d]+[章节幕回]/m,  // 第一章, 第1节
  /^[（(][\d一二三四五六七八九十]+[)）]/m,        // (一), (1)
  /^场景[\d一二三四五六七八九十]+/m,              // 场景1
  /\n{3,}/,                                      // Triple newlines
  /^——+$/m,                                       // Chinese dashes
];

function detectLanguage(text: string): 'zh' | 'en' {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = text.length;
  return chineseChars / totalChars > 0.15 ? 'zh' : 'en';
}

function splitIntoScenes(text: string, language: 'zh' | 'en'): string[] {
  const delimiters = language === 'zh'
    ? [...SCENE_DELIMITERS_CN, ...SCENE_DELIMITERS_EN]
    : [...SCENE_DELIMITERS_EN, ...SCENE_DELIMITERS_CN];

  // Try each delimiter and use the one that gives the most reasonable split
  let bestSplit: string[] = [text];
  let bestScore = 0;

  for (const delimiter of delimiters) {
    const parts = text.split(delimiter).filter((p) => p.trim().length > 20);
    if (parts.length > 1 && parts.length > bestScore && parts.length <= 50) {
      bestSplit = parts;
      bestScore = parts.length;
    }
  }

  // If no delimiter worked, split by paragraphs and group them
  if (bestSplit.length <= 1) {
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
    if (paragraphs.length <= 6) {
      bestSplit = paragraphs;
    } else {
      // Group paragraphs into scenes of ~3 paragraphs each
      const grouped: string[] = [];
      const groupSize = Math.ceil(paragraphs.length / Math.ceil(paragraphs.length / 3));
      for (let i = 0; i < paragraphs.length; i += groupSize) {
        grouped.push(paragraphs.slice(i, i + groupSize).join('\n\n'));
      }
      bestSplit = grouped;
    }
  }

  return bestSplit.map((s) => s.trim()).filter((s) => s.length > 0);
}

// ---------------------------------------------------------------------------
// Character Extraction
// ---------------------------------------------------------------------------

const NAME_PATTERNS_EN = [
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:said|spoke|whispered|shouted|asked|replied|exclaimed|muttered)/g,
  /[""]([^""]+)[""]\s+(?:said|spoke)\s+([A-Z][a-z]+)/g,
  /\b([A-Z][a-z]{2,})\s+(?:walked|ran|looked|turned|smiled|frowned|nodded)/g,
];

const NAME_PATTERNS_CN = [
  /[""「].*?[""」].*?([^\s，。！？,.\d]{2,4})(?:说|道|问|答|叫|喊|笑)/g,
  /([^\s，。！？,.\d]{2,4})(?:走|跑|看|转身|微笑|皱眉|点头|摇头|站|坐)/g,
];

// Common words to exclude from character names
const EXCLUDE_EN = new Set([
  'The', 'This', 'That', 'They', 'Then', 'There', 'Their', 'These', 'Those',
  'What', 'When', 'Where', 'While', 'Which', 'With', 'Would', 'Will',
  'She', 'Her', 'His', 'Him', 'Its', 'Our', 'You', 'Your',
  'But', 'And', 'Not', 'For', 'From', 'Into', 'Over', 'Upon',
  'One', 'Two', 'Three', 'Four', 'Five',
  'Chapter', 'Scene', 'Act', 'Part',
]);

const EXCLUDE_CN = new Set([
  '这个', '那个', '他们', '她们', '我们', '你们',
  '然后', '但是', '因为', '所以', '如果', '虽然',
  '一个', '一些', '这里', '那里', '什么', '怎么',
]);

function extractCharacters(text: string, language: 'zh' | 'en'): Map<string, number> {
  const characterCounts = new Map<string, number>();
  const patterns = language === 'zh' ? NAME_PATTERNS_CN : NAME_PATTERNS_EN;
  const excludeSet = language === 'zh' ? EXCLUDE_CN : EXCLUDE_EN;

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      // Get the last capture group (the name)
      const name = match[match.length - 1]?.trim();
      if (name && name.length >= 2 && !excludeSet.has(name)) {
        characterCounts.set(name, (characterCounts.get(name) || 0) + 1);
      }
    }
  }

  return characterCounts;
}

// ---------------------------------------------------------------------------
// Dialogue Extraction
// ---------------------------------------------------------------------------

function extractDialogue(text: string): string[] {
  const dialogues: string[] = [];

  // English quotes
  const enQuotes = text.match(/[""]([^""]+)[""]/g);
  if (enQuotes) {
    dialogues.push(...enQuotes.map((q) => q.replace(/[""\""]/g, '').trim()));
  }

  // Chinese quotes
  const cnQuotes = text.match(/[「『]([^」』]+)[」』]/g);
  if (cnQuotes) {
    dialogues.push(...cnQuotes.map((q) => q.replace(/[「『」』]/g, '').trim()));
  }

  // Additional Chinese quotation marks
  const cnQuotes2 = text.match(/[""]([^""]+)[""]/g);
  if (cnQuotes2) {
    dialogues.push(...cnQuotes2.map((q) => q.replace(/[""]/g, '').trim()));
  }

  return dialogues.filter((d) => d.length > 2);
}

// ---------------------------------------------------------------------------
// Mood Detection
// ---------------------------------------------------------------------------

const MOOD_KEYWORDS: Record<string, { en: string[]; zh: string[] }> = {
  tense: {
    en: ['danger', 'threat', 'fear', 'dark', 'shadow', 'storm', 'run', 'escape', 'scream'],
    zh: ['危险', '威胁', '恐惧', '黑暗', '阴影', '暴风', '逃跑', '尖叫', '紧张'],
  },
  romantic: {
    en: ['love', 'kiss', 'heart', 'tender', 'warm', 'embrace', 'gentle', 'blush'],
    zh: ['爱', '吻', '心', '温柔', '温暖', '拥抱', '脸红', '浪漫'],
  },
  melancholy: {
    en: ['sad', 'tears', 'rain', 'lonely', 'lost', 'grief', 'sorrow', 'memory'],
    zh: ['悲伤', '眼泪', '雨', '孤独', '失落', '悲痛', '回忆', '忧郁'],
  },
  joyful: {
    en: ['happy', 'laugh', 'smile', 'bright', 'sun', 'celebrate', 'dance', 'joy'],
    zh: ['快乐', '笑', '微笑', '明亮', '阳光', '庆祝', '跳舞', '欢乐'],
  },
  mysterious: {
    en: ['secret', 'hidden', 'unknown', 'fog', 'mist', 'whisper', 'ancient', 'strange'],
    zh: ['秘密', '隐藏', '未知', '迷雾', '低语', '古老', '奇怪', '神秘'],
  },
  epic: {
    en: ['battle', 'war', 'sword', 'army', 'hero', 'power', 'glory', 'fire'],
    zh: ['战斗', '战争', '剑', '军队', '英雄', '力量', '荣耀', '火焰'],
  },
};

function detectMood(text: string, language: 'zh' | 'en'): string {
  const lower = text.toLowerCase();
  let bestMood = 'neutral';
  let bestScore = 0;

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    const wordList = language === 'zh' ? keywords.zh : keywords.en;
    let score = 0;
    for (const word of wordList) {
      if (lower.includes(word.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMood = mood;
    }
  }

  return bestMood;
}

// ---------------------------------------------------------------------------
// Camera Shot Suggestions
// ---------------------------------------------------------------------------

const CAMERA_SHOTS: Record<string, string> = {
  tense: 'Close-up, low angle, Dutch angle, tight framing',
  romantic: 'Soft focus, medium shot, two-shot, warm backlight',
  melancholy: 'Wide shot, high angle, silhouette, muted tones',
  joyful: 'Wide angle, eye-level, bright lighting, dynamic movement',
  mysterious: 'Extreme close-up, fog overlay, dark vignette, slow zoom',
  epic: 'Extreme wide shot, low angle, dramatic lighting, aerial view',
  neutral: 'Medium shot, eye-level, natural lighting',
};

// ---------------------------------------------------------------------------
// Image Prompt Generation
// ---------------------------------------------------------------------------

function generateImagePrompt(scene: {
  content: string;
  setting: string;
  mood: string;
  characters: string[];
}): string {
  const parts: string[] = [];

  // Setting
  if (scene.setting) {
    parts.push(scene.setting);
  }

  // Characters
  if (scene.characters.length > 0) {
    parts.push(scene.characters.slice(0, 2).join(' and '));
  }

  // Mood-based style
  const moodStyles: Record<string, string> = {
    tense: 'dramatic lighting, high contrast, cinematic',
    romantic: 'soft golden hour, warm tones, dreamy atmosphere',
    melancholy: 'overcast, muted colors, melancholic mood',
    joyful: 'bright and vibrant, warm sunlight, cheerful',
    mysterious: 'foggy, dark and moody, mystical atmosphere',
    epic: 'dramatic sky, epic composition, grand scale',
    neutral: 'natural lighting, balanced composition',
  };

  parts.push(moodStyles[scene.mood] || moodStyles.neutral);
  parts.push('highly detailed, professional illustration');

  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Setting Extraction
// ---------------------------------------------------------------------------

function extractSetting(text: string, language: 'zh' | 'en'): string {
  // Look for location indicators
  if (language === 'en') {
    // Screenplay format
    const screenplayMatch = text.match(/^(INT\.|EXT\.)\s*(.+?)(?:\s*-\s*|\n)/m);
    if (screenplayMatch) return screenplayMatch[2].trim();

    // Descriptive text
    const settingPhrases = text.match(
      /(?:in the|at the|inside|outside|within)\s+([^.,!?]+)/i
    );
    if (settingPhrases) return settingPhrases[1].trim();
  } else {
    // Chinese location patterns
    const cnSettingMatch = text.match(
      /(?:在|位于|来到|走进|进入)([^，。！？\n]{2,15})/
    );
    if (cnSettingMatch) return cnSettingMatch[1].trim();
  }

  // Extract first descriptive phrase as setting
  const firstSentence = text.split(/[.。!！?？\n]/)[0];
  return firstSentence.length > 60
    ? firstSentence.slice(0, 60) + '...'
    : firstSentence;
}

// ---------------------------------------------------------------------------
// Main Parse Function
// ---------------------------------------------------------------------------

export function parseStoryboard(
  text: string,
  customTitle?: string,
): StoryboardData {
  const language = detectLanguage(text);
  const rawScenes = splitIntoScenes(text, language);

  // Extract global characters
  const globalCharacters = extractCharacters(text, language);

  // Process each scene
  const scenes: StoryScene[] = rawScenes.map((content, index) => {
    const sceneChars = extractCharacters(content, language);
    const characterNames = Array.from(sceneChars.keys());
    const dialogue = extractDialogue(content);
    const mood = detectMood(content, language);
    const setting = extractSetting(content, language);
    const cameraShot = CAMERA_SHOTS[mood] || CAMERA_SHOTS.neutral;

    // Generate scene title
    const titleNum = language === 'zh' ? `场景 ${index + 1}` : `Scene ${index + 1}`;
    const firstLine = content.split('\n')[0].trim();
    const title = firstLine.length <= 40 ? firstLine : titleNum;

    const imagePrompt = generateImagePrompt({
      content,
      setting,
      mood,
      characters: characterNames,
    });

    return {
      index,
      title,
      content,
      setting,
      characters: characterNames,
      dialogue,
      mood,
      imagePrompt,
      cameraShot,
    };
  });

  // Build character list with appearances
  const characters: StoryCharacter[] = [];
  for (const [name, count] of globalCharacters) {
    if (count >= 2) {
      const appearances: number[] = [];
      scenes.forEach((scene, idx) => {
        if (scene.content.includes(name)) {
          appearances.push(idx);
        }
      });
      characters.push({
        name,
        description: `Appears in ${appearances.length} scene(s)`,
        appearances,
      });
    }
  }

  // Sort characters by number of appearances
  characters.sort((a, b) => b.appearances.length - a.appearances.length);

  // Determine title
  const title =
    customTitle ||
    (language === 'zh' ? '故事板分析' : 'Storyboard Analysis');

  return {
    title,
    scenes,
    characters,
    totalScenes: scenes.length,
  };
}

// ---------------------------------------------------------------------------
// AI-Powered Analysis (mock for now, sends structure for AI calls)
// ---------------------------------------------------------------------------

export interface AIAnalysisRequest {
  text: string;
  requestType: 'characters' | 'scenes' | 'visuals' | 'camera';
}

export function buildAIAnalysisPrompt(request: AIAnalysisRequest): string {
  switch (request.requestType) {
    case 'characters':
      return `Analyze the following text and extract all characters with their physical descriptions, personality traits, and key relationships. Return as a structured list.\n\nText:\n${request.text}`;
    case 'scenes':
      return `Break down the following text into distinct visual scenes. For each scene, describe: the setting, time of day, key action, and emotional tone.\n\nText:\n${request.text}`;
    case 'visuals':
      return `For each scene in the following text, generate a detailed image generation prompt suitable for AI art tools like Stable Diffusion or Midjourney. Include style, lighting, composition, and mood.\n\nText:\n${request.text}`;
    case 'camera':
      return `For each scene in the following text, suggest camera angles, shot types, and visual composition that would best convey the mood and story. Use cinematography terminology.\n\nText:\n${request.text}`;
    default:
      return request.text;
  }
}
