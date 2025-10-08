import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { useKV } from '@github/spark/hooks'
import AdvancedCognitiveAnalysis from '@/components/AdvancedCognitiveAnalysis'
import MicroTaskExecutor from '@/components/MicroTaskExecutor'

describe('ACA & MTE use AXON analyze', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch as any
  })

  it.skip('ACA starts analysis and posts to /v1/chat/completions', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', created: Math.floor(Date.now() / 1000), choices: [{ message: { content: '{"analysis":"ok","key_findings":[],"confidence":80,"patterns":[],"implications":[],"next_steps":[]}' } }] }),
    })
    global.fetch = fetchMock as any

    // Prime KV store with a framework and a planning session
    const Primer = ({ children }: { children: React.ReactNode }) => {
      const [frameworks, setFrameworks] = useKV<any[]>('cognitive-frameworks', [])
      const [sessions, setSessions] = useKV<any[]>('analysis-sessions', [])
      React.useEffect(() => {
        if (!frameworks || frameworks.length === 0) {
          setFrameworks([{ id: 'systems-thinking', name: 'Systems Thinking Analysis', methodology: 'x', dimensions: [{ id: 'system-structure', name: 'System Structure', question: 'Q', analysisMethod: 'm', output: null, confidence: 0, dependencies: [], completeness: 0 }] }])
        }
      }, [frameworks, setFrameworks])
      React.useEffect(() => {
        if (!sessions || sessions.length === 0) {
          setSessions([{ id: 'session-1', frameworkId: 'systems-thinking', title: 'S1', description: 'D', status: 'planning', currentDimension: 0, results: {}, insights: [], recommendations: [], startTime: new Date().toISOString(), confidence: 0 }])
        }
      }, [sessions, setSessions])
      return <>{children}</>
    }

    const { container } = render(
      <Primer>
        <AdvancedCognitiveAnalysis language="en" projectId="p1" />
      </Primer>
    )

  // Wait for sessions list presence and click the Start button
  await screen.findByText(/Active Analysis Sessions/i)
  const startBtn = await screen.findByRole('button', { name: /Start Analysis/i })
    fireEvent.click(startBtn)

    expect(fetchMock).toHaveBeenCalled()
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/v1/chat/completions')
    expect((init as RequestInit)?.method).toBe('POST')
  })

  it('MTE generates breakdown via AXON analyze', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '2', created: Math.floor(Date.now() / 1000), choices: [{ message: { content: '{"microTasks":[{"title":"T1","description":"D","estimatedMinutes":30,"priority":"high","category":"implementation","complexity":"moderate","dependencies":[],"checkpoints":[{"title":"C1","description":"V"}]}]}' } }] }),
    })
    global.fetch = fetchMock as any

    render(<MicroTaskExecutor language="en" projectId="p2" />)

    const trigger = screen.getByRole('button', { name: /Create Breakdown/i })
    fireEvent.click(trigger)
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/Title/i), { target: { value: 'Big Task' } })
    fireEvent.change(within(dialog).getByLabelText(/Description/i), { target: { value: 'Desc' } })
    const genBtn = within(dialog).getByRole('button', { name: /Generate Breakdown/i })
    fireEvent.click(genBtn)

    expect(fetchMock).toHaveBeenCalled()
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/v1/chat/completions')
    expect((init as RequestInit)?.method).toBe('POST')
  })
})
