import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AutoRecovery from '@/components/AutoRecovery'

describe('AutoRecovery – repair scheduling smoke', () => {
  it('schedules a repair for a component with issues', async () => {
    vi.useFakeTimers()
    const onRepairCompleted = vi.fn()
    render(<AutoRecovery language="en" onRepairCompleted={onRepairCompleted} />)

    // Find a Repair button (should exist for components with issues)
    const repairButtons = screen.getAllByRole('button', { name: /Repair/i })
    fireEvent.click(repairButtons[0])

    // Fast-forward simulated progress
    vi.runAllTimers()

    await waitFor(() => {
      expect(onRepairCompleted).toHaveBeenCalled()
    })
    vi.useRealTimers()
  })
})
