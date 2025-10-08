import { AxonHealth, AxonAnalysisRequest, AxonAnalysisResponse, AxonChatRequest, AxonChatResponse, AxonChatMessage } from '@/types/axon'

const readEnv = (k: string): string | undefined => {
  return (import.meta as any)?.env?.[k] ?? (process.env as any)?.[k]
}
const AXON_BASE_URL = (readEnv('VITE_AXON_BASE_URL') as string) || '/api/axon'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${AXON_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AXON ${path} failed: ${res.status} ${text}`)
  }
  return (await res.json()) as T
}

export const axonClient = {
  async health(): Promise<AxonHealth> {
    try {
      return await http<AxonHealth>('/health')
    } catch (e) {
      return { ok: false, details: { error: String(e) }, timestamp: new Date().toISOString() }
    }
  },

  async analyze(req: AxonAnalysisRequest): Promise<AxonAnalysisResponse> {
    // Map analysis to chat completions: single user message from prompt
    const body = toOpenAIChatBody({
      messages: [
        { role: 'system', content: `mode=${req.mode || 'general'}; language=${req.language || 'ru'};` },
        { role: 'user', content: req.prompt },
      ],
      model: undefined,
    })
    const data = await http<any>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const { id, created, model, content } = normalizeChatLikeResponse(data)
    return {
      id: id || cryptoId(),
      createdAt: created ? new Date(created * 1000).toISOString() : new Date().toISOString(),
      content: content || '',
      model,
      meta: { source: 'v1/chat/completions', projectId: req.projectId, mode: req.mode },
    }
  },

  async chat(req: AxonChatRequest): Promise<AxonChatResponse> {
    const body = toOpenAIChatBody(req)
    const data = await http<any>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const { id, created, message, usage } = normalizeChatResponse(data)
    return {
      id: id || cryptoId(),
      createdAt: created ? new Date(created * 1000).toISOString() : new Date().toISOString(),
      message,
      usage,
    }
  },
}

// Mock fallback utilities for local-only mode
// No mock export: client is real-only in this setup

// Helpers
function toOpenAIChatBody(req: { messages: AxonChatMessage[]; model?: string }) {
  // OpenAI-like request body
  return {
    model: req.model || 'mock',
    messages: req.messages?.map(m => ({ role: m.role, content: m.content })),
    stream: false,
  }
}

function normalizeChatLikeResponse(data: any): { id?: string; created?: number; model?: string; content?: string } {
  // Try OpenAI-ish shape first
  if (data && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
    return {
      id: data.id,
      created: data.created,
      model: data.model,
      content: data.choices[0].message.content,
    }
  }
  // Try AXON custom minimal shape
  if (data && data.message?.content) {
    return {
      id: data.id,
      created: data.created,
      model: data.model,
      content: data.message.content,
    }
  }
  // Fallback: stringify
  return { content: typeof data === 'string' ? data : JSON.stringify(data) }
}

function normalizeChatResponse(data: any): { id?: string; created?: number; message: AxonChatMessage; usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number } } {
  // OpenAI-style
  if (data && Array.isArray(data.choices) && data.choices[0]?.message) {
    const m = data.choices[0].message
    return {
      id: data.id,
      created: data.created,
      message: { role: m.role || 'assistant', content: m.content || '' },
      usage: data.usage || undefined,
    }
  }
  // AXON custom
  if (data && data.message) {
    return {
      id: data.id,
      created: data.created,
      message: data.message,
      usage: data.usage || undefined,
    }
  }
  // Fallback
  return { message: { role: 'assistant', content: typeof data === 'string' ? data : JSON.stringify(data) } }
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID()
  return 'id_' + Math.random().toString(36).slice(2)
}
