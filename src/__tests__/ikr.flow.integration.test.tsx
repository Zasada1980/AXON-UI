import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'

// Mock ACA to immediately call onAnalysisCompleted after mount
vi.mock('@/components/AdvancedCognitiveAnalysis', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (props: any) => {
      React.useEffect(() => {
        props?.onAnalysisCompleted?.({
          id: 'session-x',
          frameworkId: 'systems-thinking',
          title: 'Mock Session',
          description: 'desc',
          status: 'completed',
          currentDimension: 0,
          results: {},
          insights: ['i1 from ACA'],
          recommendations: ['r1'],
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          confidence: 90,
        })
      }, [])
      return <div data-testid="aca-mock">ACA Mock</div>
    }
  }
})

import IKRDirectivePage from '@/pages/IKRDirectivePage'

describe('IKR flow integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('updates Reasoning when ACA completes and passes insights/confidence', async () => {
    render(<IKRDirectivePage language="en" projectId="p-flow" onNavigate={() => {}} />)

    // Create IKR analysis
    fireEvent.click(screen.getByText('New IKR Analysis'))
    const dialog = screen.getByRole('dialog')
    const d = within(dialog)
    fireEvent.change(d.getByLabelText('Title'), { target: { value: 'Flow Test' } })
    fireEvent.change(d.getByLabelText('Description'), { target: { value: 'Desc' } })
    fireEvent.click(d.getByRole('button', { name: 'Create Analysis' }))

    // Wait for analysis overview
    await screen.findByText('Flow Test')

    // ACA mock will trigger onAnalysisCompleted; assert Reasoning content reflects it
    await waitFor(() => {
      expect(screen.getByText(/confidence: 90%/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/i1 from ACA/i)).toBeInTheDocument()
  })
})
