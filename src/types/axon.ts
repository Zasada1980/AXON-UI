// Shared AXON backend types used by the adapter/client
export interface AxonHealth {
  ok: boolean;
  service?: string;
  version?: string;
  uptime?: number;
  timestamp?: string;
  details?: Record<string, any>;
}

export interface AxonAnalysisRequest {
  projectId: string;
  prompt: string;
  mode?: 'ikr' | 'kipling' | 'general';
  language?: 'en' | 'ru';
}

export interface AxonAnalysisResponse {
  id: string;
  createdAt: string;
  content: string;
  tokens?: number;
  model?: string;
  meta?: Record<string, any>;
}

export interface AxonChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AxonChatRequest {
  projectId: string;
  messages: AxonChatMessage[];
  model?: string;
  language?: 'en' | 'ru';
}

export interface AxonChatResponse {
  id: string;
  createdAt: string;
  message: AxonChatMessage;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
}
