import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DebatePage from '@/pages/DebatePage'

// Helper: AXON path constant
const AXON_PATH = '/api/axon/v1/chat/completions'

describe('DebatePage – deep-link opens read-only session', () => {
  const projectId = 'proj-deeplink-1'
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = global.fetch
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (typeof url === 'string' && url.includes(AXON_PATH) && (init?.method || 'GET').toUpperCase() === 'POST') {
        const body = {
          id: 'chatcmpl_test_2',
          created: Math.floor(Date.now() / 1000),
          model: 'mock-model',
          choices: [ { message: { role: 'assistant', content: 'Test reply' } } ],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
        }
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return originalFetch(input as any, init)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // reset hash after each test
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  })

  it('navigates to session by #session=<id> and disables actions', async () => {
    const user = userEvent.setup()
    render(<DebatePage language="en" projectId={projectId} onNavigate={() => {}} />)

    // Ensure Sessions view is active
    await user.click(screen.getByRole('button', { name: /Sessions/i }))

    // Create a session
    const emptyBtn = screen.queryByTestId('debate-new-session-empty')
    const headerBtn = screen.queryByTestId('debate-new-session-header')
    const newSessionBtn = emptyBtn ?? headerBtn
    expect(newSessionBtn).toBeTruthy()
    await user.click(newSessionBtn as HTMLElement)

    const titleInput = await screen.findByLabelText(/Session Title/i)
    await user.type(titleInput, 'DeepLink Session')
    await user.type(screen.getByLabelText(/Topic/i), 'DeepLink Topic')
    await user.type(screen.getByLabelText(/Description/i), 'DeepLink Description')

    // Select two default agents
    await waitFor(() => expect(screen.getByText(/Advocate/i)).toBeInTheDocument())
    await user.click(screen.getByText(/Advocate/i))
    await user.click(screen.getByText(/Critic/i))

    // Create session
    await user.click(screen.getByRole('button', { name: /Create Session/i }))

  // Grab session id from attribute on the debate view
    const withAttr = document.querySelector('[data-session-id]') as HTMLElement | null
    expect(withAttr).not.toBeNull()
    const sessionId = withAttr!.getAttribute('data-session-id')!
    expect(sessionId).toMatch(/^session-/)

    // Switch to Sessions and then simulate opening via hash (read-only)
    await user.click(screen.getByRole('button', { name: /Sessions/i }))
    window.history.replaceState(null, '', `${window.location.pathname}#session=${encodeURIComponent(sessionId)}`)
    // Trigger hashchange
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    // Should auto-open debate view for that session
    await waitFor(() => {
      const el = document.querySelector(`[data-session-id="${sessionId}"]`)
      expect(el).not.toBeNull()
    })

    // Action buttons must be disabled in read-only mode
    const startBtn = screen.getByRole('button', { name: /Start Debate/i })
    const pauseBtn = screen.getByRole('button', { name: /Pause Debate/i })
    const stopBtn = screen.getByRole('button', { name: /Stop Debate/i })
    const genBtn = screen.getByRole('button', { name: /Generate turn \(AXON\)/i })
    expect(startBtn).toBeDisabled()
    expect(pauseBtn).toBeDisabled()
    expect(stopBtn).toBeDisabled()
    expect(genBtn).toBeDisabled()

    // Copy link button present
    expect(screen.getByTestId('debate-copy-link')).toBeInTheDocument()
  }, 30000)
})
