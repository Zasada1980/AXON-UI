import { AxonHealth, AxonAnalysisRequest, AxonAnalysisResponse, AxonChatRequest, AxonChatResponse } from '@/types/axon'
import { axonClient } from '@/lib/axonClient'

// Реальный клиент без заглушек. Требуется доступный AXON backend
export const axon = {
  async health(): Promise<AxonHealth> {
    return axonClient.health()
  },
  async analyze(req: AxonAnalysisRequest): Promise<AxonAnalysisResponse> {
    return axonClient.analyze(req)
  },
  async chat(req: AxonChatRequest): Promise<AxonChatResponse> {
    return axonClient.chat(req)
  },
}
