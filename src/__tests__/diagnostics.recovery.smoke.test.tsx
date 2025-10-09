import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AutoRecovery from '@/components/AutoRecovery'

describe('AutoRecovery – repair scheduling smoke', () => {
  it('schedules a repair for a component with issues', async () => {
    const onRepairCompleted = vi.fn()
    render(<AutoRecovery language="en" onRepairCompleted={onRepairCompleted} />)

    // Trigger a manual repair for a component with issues
    const repairButtons = screen.getAllByRole('button', { name: /Repair/i })
    fireEvent.click(repairButtons[0])

    await waitFor(() => expect(onRepairCompleted).toHaveBeenCalled(), { timeout: 10000 })
  }, 15000)
})
