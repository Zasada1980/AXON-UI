import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useKV } from '@github/spark/hooks'
import AdvancedCognitiveAnalysis from '@/components/AdvancedCognitiveAnalysis'

describe('ACA synthesis phase uses overall_confidence and insights', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch as any
  })

  it('runs through dimensions and synthesis, applying insights and overall_confidence', async () => {
    // First N calls: dimensions; last call: synthesis
    const dimPayload = { id: 'd', created: Math.floor(Date.now()/1000), choices: [{ message: { content: '{"analysis":"ok","key_findings":["k"],"confidence":70,"patterns":[],"implications":[],"next_steps":[]}' } }] }
    const synthPayload = { id: 's', created: Math.floor(Date.now()/1000), choices: [{ message: { content: '{"insights":["i1","i2"],"recommendations":["r1"],"further_investigation":[],"overall_confidence":91,"synthesis_summary":"sum"}' } }] }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => dimPayload })
      .mockResolvedValueOnce({ ok: true, json: async () => dimPayload })
      .mockResolvedValueOnce({ ok: true, json: async () => dimPayload })
      .mockResolvedValueOnce({ ok: true, json: async () => dimPayload })
      .mockResolvedValueOnce({ ok: true, json: async () => synthPayload })
    global.fetch = fetchMock as any

    // Ensure frameworks exist with at least 4 dimensions
    const Primer = ({ children }: { children: React.ReactNode }) => {
      const [frameworks, setFrameworks] = useKV<any[]>('cognitive-frameworks', [])
      React.useEffect(() => {
        if (!frameworks || frameworks.length === 0) {
          setFrameworks([{
            id: 'systems-thinking', name: 'Systems Thinking Analysis', methodology: 'm',
            dimensions: [
              { id: 'a', name: 'A', question: 'q', analysisMethod: 'am', output: null, confidence: 0, dependencies: [], completeness: 0 },
              { id: 'b', name: 'B', question: 'q', analysisMethod: 'am', output: null, confidence: 0, dependencies: [], completeness: 0 },
              { id: 'c', name: 'C', question: 'q', analysisMethod: 'am', output: null, confidence: 0, dependencies: [], completeness: 0 },
              { id: 'd', name: 'D', question: 'q', analysisMethod: 'am', output: null, confidence: 0, dependencies: [], completeness: 0 },
            ]
          }])
        }
      }, [frameworks, setFrameworks])
      return <>{children}</>
    }

    render(
      <Primer>
        <AdvancedCognitiveAnalysis language="en" projectId="p3" />
      </Primer>
    )

    // Create and run session
    await userEvent.click(screen.getByTestId('aca-tab-builder'))
    await userEvent.type(screen.getByTestId('aca-session-title'), 'Synth Test')
    await userEvent.click(screen.getByTestId('aca-create-session'))
    await userEvent.click(screen.getByTestId('aca-tab-sessions'))

    const card = await screen.findByTestId('aca-session-card')
    const startBtn = within(card).getByTestId('aca-start-analysis')
    await userEvent.click(startBtn)

    // Wait until the synthesis result is reflected in UI (confidence badge appears)
    const updatedCard = await screen.findByTestId('aca-session-card')
    await vi.waitFor(() => {
      expect(within(updatedCard).getByText(/confidence/i)).toBeTruthy()
    })

    // After run, insights preview should show (we expect specific items i1 and i2)
    expect(within(updatedCard).getByText('i1')).toBeInTheDocument()
    expect(within(updatedCard).getByText('i2')).toBeInTheDocument()

    // Confidence badge should reflect 91% from synthesis (not the averaged 70)
    expect(within(updatedCard).getByText(/91% confidence/i)).toBeInTheDocument()
  })
})
