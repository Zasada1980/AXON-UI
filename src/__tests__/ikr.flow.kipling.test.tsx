import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'

// Mock KiplingQuestionnaire to immediately call onQuestionnaireComplete after mount
vi.mock('@/components/KiplingQuestionnaire', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (props: any) => {
      React.useEffect(() => {
        props?.onQuestionnaireComplete?.({ summary: 'knowledge from Kipling' })
      }, [])
      return <div data-testid="kipling-mock">Kipling Mock</div>
    }
  }
})

import IKRDirectivePage from '@/pages/IKRDirectivePage'

describe('IKR flow integration - Knowledge (Kipling)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('updates Knowledge when Kipling completes', async () => {
    render(<IKRDirectivePage language="en" projectId="p-flow-kipling" onNavigate={() => {}} />)

    // Create IKR analysis
    fireEvent.click(screen.getByText('New IKR Analysis'))
    const dialog = screen.getByRole('dialog')
    const d = within(dialog)
    fireEvent.change(d.getByLabelText('Title'), { target: { value: 'Flow Test Kipling' } })
    fireEvent.change(d.getByLabelText('Description'), { target: { value: 'Desc' } })
    fireEvent.click(d.getByRole('button', { name: 'Create Analysis' }))

    // Wait for analysis overview
    await screen.findByText('Flow Test Kipling')

    // Kipling mock will trigger onQuestionnaireComplete; assert Knowledge content reflects it
    await waitFor(() => {
      expect(screen.getByText(/knowledge from Kipling/i)).toBeInTheDocument()
    })
  })
})
