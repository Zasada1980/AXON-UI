import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axonClient } from '@/lib/axonClient'

// Note: We test only normalize/health path via mocking fetch and calling client.health

describe('AXON health widget integration (client)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    global.fetch = originalFetch as any
  })

  it('returns ok on 200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, service: 'axon', version: '1.0.0' }) }) as any
    const res = await axonClient.health()
    expect(res.ok).toBe(true)
    expect(res.service).toBe('axon')
  })

  it('returns ok=false on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network')) as any
    const res = await axonClient.health()
    expect(res.ok).toBe(false)
    expect(res.details?.error).toBeTypeOf('string')
  })
})
