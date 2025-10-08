import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DebatePage from '@/pages/DebatePage'

// Helper: wrap fetch to intercept AXON chat while delegating to existing test fetch
const AXON_PATH = '/api/axon/v1/chat/completions'

describe('DebatePage – start debate flow (AXON backend via adapter)', () => {
  const projectId = 'proj-test-1'
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = global.fetch
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (typeof url === 'string' && url.includes(AXON_PATH) && (init?.method || 'GET').toUpperCase() === 'POST') {
        // Return minimal OpenAI-like response
        const body = {
          id: 'chatcmpl_test_1',
          created: Math.floor(Date.now() / 1000),
          model: 'mock-model',
          choices: [
            {
              message: { role: 'assistant', content: 'Opening argument: This is a test message.' },
            },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
        }
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      // Delegate to existing fetch (which handles KV shim and other test routes)
      return originalFetch(input as any, init)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a session and generates the first debate message via AXON', async () => {
    const user = userEvent.setup()
    render(<DebatePage language="en" projectId={projectId} onNavigate={() => {}} />)

    // Create a new session
    const newSessionBtn = await screen.findByRole('button', { name: /New Session/i })
    await user.click(newSessionBtn)

    const titleInput = await screen.findByLabelText(/Session Title/i)
    await user.type(titleInput, 'Test Session')

    const topicInput = screen.getByLabelText(/Topic/i)
    await user.type(topicInput, 'Test Topic')

    const descriptionInput = screen.getByLabelText(/Description/i)
    await user.type(descriptionInput, 'Context for the debate')

    // Select at least two participants (default agents are auto-created on mount)
    await waitFor(() => expect(screen.getByText(/Advocate/i)).toBeInTheDocument())
    await user.click(screen.getByText(/Advocate/i))
    await user.click(screen.getByText(/Critic/i))

    // Create session
    await user.click(screen.getByRole('button', { name: /Create Session/i }))

    // Start debate – this triggers axon.chat -> our mocked fetch
    const startBtn = await screen.findByRole('button', { name: /Start Debate/i })
    await user.click(startBtn)

    // Expect first generated message to appear
    await waitFor(() => expect(screen.getByText(/Opening argument: This is a test message\./i)).toBeInTheDocument())

    // Status badge should show Active
    expect(screen.getByText(/Active/i)).toBeInTheDocument()
  })
})
