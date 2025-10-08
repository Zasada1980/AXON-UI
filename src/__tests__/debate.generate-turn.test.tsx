import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DebatePage from '@/pages/DebatePage'

const AXON_PATH = '/api/axon/v1/chat/completions'

describe('DebatePage – generate next turn (AXON backend via adapter)', () => {
  const projectId = 'proj-test-2'
  let originalFetch: typeof fetch
  let callCount = 0

  beforeEach(() => {
    callCount = 0
    originalFetch = global.fetch
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (typeof url === 'string' && url.includes(AXON_PATH) && (init?.method || 'GET').toUpperCase() === 'POST') {
        callCount += 1
        const content = callCount === 1
          ? 'Opening argument: This is a test message.'
          : 'Counter: Next turn from AXON.'
        const body = {
          id: `chatcmpl_test_${callCount}`,
          created: Math.floor(Date.now() / 1000),
          model: 'mock-model',
          choices: [ { message: { role: 'assistant', content } } ],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
        }
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return originalFetch(input as any, init)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds a new message after clicking Generate turn (AXON)', async () => {
    const user = userEvent.setup()
    render(<DebatePage language="en" projectId={projectId} onNavigate={() => {}} />)

    // Ensure Sessions tab is active
    const sessionsTab = screen.getByRole('button', { name: /Sessions/i })
    await user.click(sessionsTab)

    // Create new session via empty-state button
    const newSessionBtn = screen.getByTestId('debate-new-session-empty')
    await user.click(newSessionBtn)

    // Fill session form
    const titleInput = await screen.findByLabelText(/Session Title/i)
    await user.type(titleInput, 'Turn Test Session')

    const topicInput = screen.getByLabelText(/Topic/i)
    await user.type(topicInput, 'Turn Topic')

    const descriptionInput = screen.getByLabelText(/Description/i)
    await user.type(descriptionInput, 'Turn description context')

    // Pick participants
    await waitFor(() => expect(screen.getByText(/Advocate/i)).toBeInTheDocument())
    await user.click(screen.getByText(/Advocate/i))
    await user.click(screen.getByText(/Critic/i))

    // Create session
    await user.click(screen.getByRole('button', { name: /Create Session/i }))

    // Start debate – first AXON call
    const startBtn = await screen.findByRole('button', { name: /Start Debate/i })
    await user.click(startBtn)

    await waitFor(() => expect(screen.getByText(/Opening argument: This is a test message\./i)).toBeInTheDocument())

    // Generate next turn – second AXON call
    const genBtn = screen.getByRole('button', { name: /Generate turn \(AXON\)/i })
    await user.click(genBtn)

    await waitFor(() => expect(screen.getByText(/Counter: Next turn from AXON\./i)).toBeInTheDocument())
  }, 20000)
})
