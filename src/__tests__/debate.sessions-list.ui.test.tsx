import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DebatePage from '@/pages/DebatePage'

const AXON_PATH = '/api/axon/v1/chat/completions'

describe('DebatePage – sessions list UI', () => {
  const projectId = 'proj-sessions-ui'
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = global.fetch
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (typeof url === 'string' && url.includes(AXON_PATH) && (init?.method || 'GET').toUpperCase() === 'POST') {
        const body = {
          id: 'chatcmpl_ui', created: Math.floor(Date.now() / 1000), model: 'mock-model',
          choices: [{ message: { role: 'assistant', content: 'Opening' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        }
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return originalFetch(input as any, init)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders status badge and turns-in-round indicator in sessions list', async () => {
    const user = userEvent.setup()
    render(<DebatePage language="en" projectId={projectId} onNavigate={() => {}} />)

    // Create a session with 2 participants
    await user.click(screen.getByRole('button', { name: /Sessions/i }))
    await user.click(screen.getByTestId('debate-new-session-empty'))

    const titleInput = await screen.findByLabelText(/Session Title/i)
    await user.type(titleInput, 'UI List Session')
    await user.type(screen.getByLabelText(/Topic/i), 'Topic')
    await user.type(screen.getByLabelText(/Description/i), 'desc')

    await waitFor(() => expect(screen.getByText(/Advocate/i)).toBeInTheDocument())
    await user.click(screen.getByText(/Advocate/i))
    await user.click(screen.getByText(/Critic/i))

    await user.click(screen.getByRole('button', { name: /Create Session/i }))

    // Back to sessions list
    await user.click(screen.getByRole('button', { name: /Sessions/i }))

    // Check status badge text matches Setup (initial)
    expect(screen.getByText(/Setup/i)).toBeInTheDocument()

    // Check turns in round indicator visible: 0/2 initially
    expect(screen.getByText(/Turns in round: 0\/2/i)).toBeInTheDocument()
  }, 20000)
})
