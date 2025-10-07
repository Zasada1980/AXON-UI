import { axonClient, axonMock } from '@/lib/axonClient'
import { AxonHealth, AxonAnalysisRequest, AxonAnalysisResponse, AxonChatRequest, AxonChatResponse } from '@/types/axon'

let healthCache: { last: AxonHealth; ts: number } | null = null
const HEALTH_TTL = 15_000

const useMock = () => {
  const mode = (import.meta.env.VITE_AXON_MODE as string) || 'auto'
  return mode === 'mock'
}

async function getHealth(): Promise<AxonHealth> {
  const now = Date.now()
  if (healthCache && now - healthCache.ts < HEALTH_TTL) return healthCache.last

  let health: AxonHealth
  if (useMock()) {
    health = await axonMock.health()
  } else {
    const res = await axonClient.health()
    health = res.ok ? res : await axonMock.health()
  }
  healthCache = { last: health, ts: now }
  return health
}

export const axon = {
  async health(): Promise<AxonHealth> {
    return getHealth()
  },

  async analyze(req: AxonAnalysisRequest): Promise<AxonAnalysisResponse> {
    if (useMock()) return axonMock.analyze(req)
    try {
      return await axonClient.analyze(req)
    } catch {
      return axonMock.analyze(req)
    }
  },

  async chat(req: AxonChatRequest): Promise<AxonChatResponse> {
    if (useMock()) return axonMock.chat(req)
    try {
      return await axonClient.chat(req)
    } catch {
      return axonMock.chat(req)
    }
  },
}
