import type { NodeType, NodeData } from '@/types';

// ---------------------------------------------------------------------------
// Action types that the AI can return alongside a chat message
// ---------------------------------------------------------------------------

export type AIAction =
  | { type: 'create_node'; nodeType: NodeType; data: Partial<NodeData>; createdNodeId?: string }
  | { type: 'update_node'; nodeId: string; data: Partial<NodeData> }
  | { type: 'generate_image'; prompt: string; width?: number; height?: number }
  | { type: 'generate_video'; prompt: string; duration?: number }
  | { type: 'modify_prompt'; nodeId: string; prompt: string };

export interface AIResponse {
  message: string;
  actions: AIAction[];
}

// ---------------------------------------------------------------------------
// Keyword-based mock parser
// ---------------------------------------------------------------------------

/**
 * Parses a user message and returns a mock AI response with structured actions.
 * Uses simple keyword matching to decide what kind of action to produce.
 */
export function parseMockResponse(
  userMessage: string,
  contextNodeIds: string[],
): AIResponse {
  const msg = userMessage.toLowerCase();

  // --- Image generation ---
  if (
    msg.includes('生成图片') ||
    msg.includes('generate image') ||
    msg.includes('create image') ||
    msg.includes('generate a') && (msg.includes('image') || msg.includes('landscape') || msg.includes('portrait') || msg.includes('photo'))
  ) {
    const prompt = extractPrompt(userMessage, [
      '生成图片',
      'generate image',
      'create image',
      'generate an image of',
      'generate a',
    ]);
    return {
      message: `Sure! I'll create an image node with the prompt: "${prompt}". Click "Apply to Canvas" to add it.`,
      actions: [
        {
          type: 'create_node',
          nodeType: 'image',
          data: {
            label: truncate(prompt, 30),
            prompt,
            width: 512,
            height: 512,
            format: 'png',
            imageUrl: null,
          },
        },
      ],
    };
  }

  // --- Video generation ---
  if (
    msg.includes('生成视频') ||
    msg.includes('create video') ||
    msg.includes('generate video') ||
    msg.includes('create a') && msg.includes('video')
  ) {
    const durationMatch = msg.match(/(\d+)\s*(?:秒|second|sec|s\b)/);
    const duration = durationMatch ? parseInt(durationMatch[1], 10) : 5;
    const prompt = extractPrompt(userMessage, [
      '生成视频',
      'generate video',
      'create video',
      'create a',
    ]);
    return {
      message: `I'll create a ${duration}-second video node with the prompt: "${prompt}". Click "Apply to Canvas" to add it.`,
      actions: [
        {
          type: 'create_node',
          nodeType: 'video',
          data: {
            label: truncate(prompt, 30),
            prompt,
            duration,
            videoUrl: null,
            thumbnailUrl: null,
          },
        },
      ],
    };
  }

  // --- Text / copy generation ---
  if (
    msg.includes('write') ||
    msg.includes('写') ||
    msg.includes('marketing copy') ||
    msg.includes('文案') ||
    msg.includes('text node') ||
    msg.includes('create text')
  ) {
    const prompt = extractPrompt(userMessage, [
      'write',
      '写',
      'create text',
    ]);
    return {
      message: `I'll create a text node for: "${prompt}". Click "Apply to Canvas" to add it.`,
      actions: [
        {
          type: 'create_node',
          nodeType: 'text',
          data: {
            label: truncate(prompt, 30),
            content: `[AI-generated content for: ${prompt}]`,
            prompt,
          },
        },
      ],
    };
  }

  // --- Audio generation ---
  if (
    msg.includes('generate music') ||
    msg.includes('background music') ||
    msg.includes('音乐') ||
    msg.includes('audio') ||
    msg.includes('generate audio')
  ) {
    const prompt = extractPrompt(userMessage, [
      'generate music',
      'generate audio',
      'background music',
      '音乐',
    ]);
    return {
      message: `I'll create an audio node for: "${prompt}". Click "Apply to Canvas" to add it.`,
      actions: [
        {
          type: 'create_node',
          nodeType: 'audio',
          data: {
            label: truncate(prompt, 30),
            prompt,
            duration: 30,
            audioUrl: null,
          },
        },
      ],
    };
  }

  // --- Update / modify existing node ---
  if (
    (msg.includes('修改') || msg.includes('change') || msg.includes('update') || msg.includes('modify')) &&
    contextNodeIds.length > 0
  ) {
    const prompt = extractPrompt(userMessage, [
      '修改',
      'change',
      'update',
      'modify',
    ]);
    return {
      message: `I'll update the selected node with: "${prompt}".`,
      actions: contextNodeIds.map((nodeId) => ({
        type: 'update_node' as const,
        nodeId,
        data: { prompt, label: truncate(prompt, 30) },
      })),
    };
  }

  // --- Enhance / upscale ---
  if (
    (msg.includes('放大') || msg.includes('upscale') || msg.includes('enhance')) &&
    contextNodeIds.length > 0
  ) {
    const prompt = 'Enhanced version';
    return {
      message: `I'll enhance the selected node(s). The prompt will be updated for upscaling.`,
      actions: contextNodeIds.map((nodeId) => ({
        type: 'modify_prompt' as const,
        nodeId,
        prompt,
      })),
    };
  }

  // --- Default fallback ---
  return {
    message:
      'I can help you create and modify canvas nodes! Try asking me to generate an image, create a video, write marketing copy, or modify a selected node.',
    actions: [],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractPrompt(message: string, prefixes: string[]): string {
  let cleaned = message;
  for (const prefix of prefixes) {
    const idx = cleaned.toLowerCase().indexOf(prefix.toLowerCase());
    if (idx !== -1) {
      cleaned = cleaned.slice(idx + prefix.length);
    }
  }
  cleaned = cleaned.replace(/^[\s:：,，]+/, '').trim();
  return cleaned || message.trim();
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}
