import { AxonHealth, AxonAnalysisRequest, AxonAnalysisResponse, AxonChatRequest, AxonChatResponse } from '@/types/axon'

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
// No mock export: client is real-only in this setup
