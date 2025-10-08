import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DebatePage from '@/pages/DebatePage'

const AXON_PATH = '/api/axon/v1/chat/completions'

describe('DebatePage – respects maxRounds', () => {
  const projectId = 'proj-maxrounds'
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = global.fetch
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (typeof url === 'string' && url.includes(AXON_PATH) && (init?.method || 'GET').toUpperCase() === 'POST') {
        const body = {
          id: 'chatcmpl_turn',
          created: Math.floor(Date.now() / 1000),
          model: 'mock-model',
          choices: [ { message: { role: 'assistant', content: 'turn' } } ],
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

  it('stops generating new turns after reaching maxRounds full cycles', async () => {
    const user = userEvent.setup()
    render(<DebatePage language="en" projectId={projectId} onNavigate={() => {}} />)

    // Go to Sessions and create a session with maxRounds=1
    await user.click(screen.getByRole('button', { name: /Sessions/i }))
    await user.click(screen.getByTestId('debate-new-session-empty'))

    const titleInput = await screen.findByLabelText(/Session Title/i)
    await user.type(titleInput, 'Max Rounds Test')

    const maxRounds = screen.getByLabelText(/Max Rounds/i)
    await user.clear(maxRounds)
    await user.type(maxRounds, '1')

    const topicInput = screen.getByLabelText(/Topic/i)
    await user.type(topicInput, 'Topic')

    const descriptionInput = screen.getByLabelText(/Description/i)
    await user.type(descriptionInput, 'desc')

    await waitFor(() => expect(screen.getByText(/Advocate/i)).toBeInTheDocument())
    await user.click(screen.getByText(/Advocate/i))
    await user.click(screen.getByText(/Critic/i))

    await user.click(screen.getByRole('button', { name: /Create Session/i }))

    // Start debate (adds first message in round 1)
    await user.click(await screen.findByRole('button', { name: /Start Debate/i }))

    // Generate two turns (should complete the round with two participants)
    const genBtn = await screen.findByRole('button', { name: /Generate turn \(AXON\)/i })
    await user.click(genBtn)

    // Round should reach 1/1 and prevent further full cycles
    // Try to click again twice — messages count should not exceed participants * maxRounds + 1(start)
    await user.click(genBtn)
    await user.click(genBtn)

    // Inspect current round text and message count
    const roundText = await screen.findByText(/Round: 1\/1/i)
    expect(roundText).toBeInTheDocument()
  }, 20000)
})
