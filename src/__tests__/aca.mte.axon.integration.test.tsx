import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('ACA starts analysis and posts to /v1/chat/completions', async () => {
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

    render(
      <Primer>
        <AdvancedCognitiveAnalysis language="en" projectId="p1" />
      </Primer>
    )

  // Создаем сессию через builder (framework подставится автоматически), затем запускаем анализ
  await userEvent.click(screen.getByTestId('aca-tab-builder'))
  await userEvent.type(screen.getByTestId('aca-session-title'), 'S1')
  await userEvent.click(screen.getByTestId('aca-create-session'))
  await userEvent.click(screen.getByTestId('aca-tab-sessions'))
  const card = await screen.findByTestId('aca-session-card')
  const startBtn = within(card).getByTestId('aca-start-analysis')
  await userEvent.click(startBtn)

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
  await userEvent.click(trigger)
    const dialog = await screen.findByRole('dialog')
  await userEvent.type(within(dialog).getByLabelText(/Title/i), 'Big Task')
  await userEvent.type(within(dialog).getByLabelText(/Description/i), 'Desc')
    const genBtn = within(dialog).getByRole('button', { name: /Generate Breakdown/i })
  await userEvent.click(genBtn)

    expect(fetchMock).toHaveBeenCalled()
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/v1/chat/completions')
    expect((init as RequestInit)?.method).toBe('POST')
  })
})
