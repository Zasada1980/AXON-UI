import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axon } from '@/services/axonAdapter'

describe('AXON IKR contract', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch as any
  })

  it('sends analyze request with mode="ikr" via /v1/chat/completions', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', createdAt: new Date().toISOString(), content: 'ok' }),
    })
    global.fetch = fetchMock as any

    const req = {
      projectId: 'test-project',
      prompt: 'Run IKR',
      mode: 'ikr' as const,
      language: 'ru' as const,
    }

  await axon.analyze(req)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
  expect(String(url)).toContain('/v1/chat/completions')
    expect((init as RequestInit)?.method).toBe('POST')
    const body = JSON.parse(String((init as RequestInit)?.body))
    expect(body.mode).toBe('ikr')
    expect(body.projectId).toBe('test-project')
    expect(body.prompt).toBe('Run IKR')
  })
})
