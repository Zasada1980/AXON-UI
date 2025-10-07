import { AxonHealth, AxonAnalysisRequest, AxonAnalysisResponse, AxonChatRequest, AxonChatResponse } from '@/types/axon'

const AXON_BASE_URL = (import.meta.env.VITE_AXON_BASE_URL as string) || '/api/axon'

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

  async analyze(body: AxonAnalysisRequest): Promise<AxonAnalysisResponse> {
    return await http<AxonAnalysisResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  async chat(body: AxonChatRequest): Promise<AxonChatResponse> {
    return await http<AxonChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}

// Mock fallback utilities for local-only mode
export const axonMock = {
  async health(): Promise<AxonHealth> {
    return { ok: true, service: 'axon-mock', version: '0.0.0', uptime: 1, timestamp: new Date().toISOString() }
  },
  async analyze(req: AxonAnalysisRequest): Promise<AxonAnalysisResponse> {
    return {
      id: `mock-${Date.now()}`,
      createdAt: new Date().toISOString(),
      content: `Mock analysis (${req.mode || 'general'}) for project ${req.projectId}:\n${req.prompt.substring(0, 200)}...`,
      tokens: 128,
      model: 'mock-ai',
    }
  },
  async chat(req: AxonChatRequest): Promise<AxonChatResponse> {
    const last = req.messages[req.messages.length - 1]
    return {
      id: `mock-chat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      message: { role: 'assistant', content: `Echo: ${last?.content || ''}` },
      usage: { promptTokens: 32, completionTokens: 16, totalTokens: 48 },
    }
  },
}
