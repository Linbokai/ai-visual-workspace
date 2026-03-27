export interface ChatMessageAction {
  type: string;
  description: string;
  nodeType?: string;
  nodeId?: string;
  applied?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  context_nodes?: string[];
  actions?: ChatMessageAction[];
  created_at: string;
  status: 'sending' | 'streaming' | 'done' | 'error';
}

export interface Attachment {
  type: 'image' | 'node_reference';
  url?: string;
  node_id?: string;
  thumbnail?: string;
}
