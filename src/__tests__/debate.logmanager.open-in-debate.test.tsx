import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DebateLogManager from '@/components/DebateLogManager'
import DebatePage from '@/pages/DebatePage'

describe('DebateLogManager – Open in Debate deep-links into DebatePage', () => {
  const projectId = 'proj-open-in-debate'

  it('creates a provisioned session for DebatePage and opens it read-only by hash', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <DebateLogManager language="en" projectId={projectId} />
        <DebatePage language="en" projectId={projectId} onNavigate={() => {}} />
      </div>
    )

    // Start new debate session in LogManager (active section)
    const startBtn = await screen.findByRole('button', { name: /Start New Debate/i })
    await user.click(startBtn)

    // Click Open in Debate on the active card
    const openBtn = await screen.findByRole('button', { name: /Open in Debate/i })
    await user.click(openBtn)

    // After hash set, DebatePage should open read-only session matching hash
    await waitFor(() => {
      expect(window.location.hash).toMatch(/#session=/)
    })
    const sessionId = decodeURIComponent(window.location.hash.replace('#session=', ''))
    await waitFor(() => {
      const container = document.querySelector(`[data-session-id="${sessionId}"]`)
      expect(container).not.toBeNull()
    })

    // Actions should be disabled (read-only)
    expect(screen.getByRole('button', { name: /Start Debate/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Pause Debate/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Stop Debate/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Generate turn \(AXON\)/i })).toBeDisabled()
  }, 20000)
})
