import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'

// Mock axon adapter
vi.mock('@/services/axonAdapter', () => {
  return {
    __esModule: true,
    axon: {
      analyze: vi.fn(async () => ({ content: 'INTEL\n\nKNOW\n\nREASON' })),
      health: vi.fn(async () => ({ status: 'ok' }))
    }
  }
})

import IKRDirectivePage from '@/pages/IKRDirectivePage'
import { axon } from '@/services/axonAdapter'

describe('IKR flow integration - AXON apply to I/K/R', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('applies AXON analysis result to all components', async () => {
    render(<IKRDirectivePage language="en" projectId="p-flow-axon" onNavigate={() => {}} />)

    // Create IKR analysis
    fireEvent.click(screen.getByText('New IKR Analysis'))
    const dialog = screen.getByRole('dialog')
    const d = within(dialog)
    fireEvent.change(d.getByLabelText('Title'), { target: { value: 'Flow Test AXON' } })
    fireEvent.change(d.getByLabelText('Description'), { target: { value: 'Desc' } })
    fireEvent.click(d.getByRole('button', { name: 'Create Analysis' }))

    // Wait for analysis overview
    await screen.findByText('Flow Test AXON')

    // Trigger AXON analyze
    fireEvent.click(screen.getByText(/AXON анализ/i))

    await waitFor(() => {
      expect(axon.analyze).toHaveBeenCalled()
    })

    // Wait for the result block and apply it
    await screen.findByText(/Результат AXON:/i)
    fireEvent.click(screen.getByRole('button', { name: /Apply to I\/K\/R/i }))

    // All three sections should get content (scope within each card)
    await waitFor(() => {
      const intelCard = (screen.getByText('Intelligence') as HTMLElement).closest('[data-slot="card"]') as HTMLElement
      const knowCard = (screen.getByText('Knowledge') as HTMLElement).closest('[data-slot="card"]') as HTMLElement
      const reasonCard = (screen.getByText('Reasoning') as HTMLElement).closest('[data-slot="card"]') as HTMLElement

      expect(intelCard).toBeTruthy()
      expect(knowCard).toBeTruthy()
      expect(reasonCard).toBeTruthy()

      expect(within(intelCard).getByText(/^INTEL$/)).toBeInTheDocument()
      expect(within(knowCard).getByText(/^KNOW$/)).toBeInTheDocument()
      expect(within(reasonCard).getByText(/^REASON$/)).toBeInTheDocument()
    })
  })
})
