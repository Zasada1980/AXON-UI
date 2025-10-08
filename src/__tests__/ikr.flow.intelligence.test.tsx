import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'

// Mock IntelligenceGathering to immediately call onIntelligenceGathered after mount
vi.mock('@/components/IntelligenceGathering', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (props: any) => {
      React.useEffect(() => {
        props?.onIntelligenceGathered?.('intel from IG')
      }, [])
      return <div data-testid="ig-mock">IG Mock</div>
    }
  }
})

import IKRDirectivePage from '@/pages/IKRDirectivePage'

describe('IKR flow integration - Intelligence', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('updates Intelligence when IG completes', async () => {
    render(<IKRDirectivePage language="en" projectId="p-flow-ig" onNavigate={() => {}} />)

    // Create IKR analysis
    fireEvent.click(screen.getByText('New IKR Analysis'))
    const dialog = screen.getByRole('dialog')
    const d = within(dialog)
    fireEvent.change(d.getByLabelText('Title'), { target: { value: 'Flow Test IG' } })
    fireEvent.change(d.getByLabelText('Description'), { target: { value: 'Desc' } })
    fireEvent.click(d.getByRole('button', { name: 'Create Analysis' }))

    // Wait for analysis overview
    await screen.findByText('Flow Test IG')

    // IG mock will trigger onIntelligenceGathered; assert Intelligence content reflects it
    await waitFor(() => {
      expect(screen.getByText(/intel from IG/i)).toBeInTheDocument()
    })
  })
})
