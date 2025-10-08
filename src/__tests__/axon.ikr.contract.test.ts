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
    expect(Array.isArray(body.messages)).toBe(true)
    expect(body.messages[0].role).toBe('system')
    expect(String(body.messages[0].content)).toContain('mode=ikr')
    expect(body.messages[1].role).toBe('user')
    expect(String(body.messages[1].content)).toBe('Run IKR')
  })
})
