import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AutoBackupSystem from '@/components/AutoBackupSystem'

describe('AutoBackupSystem – manual backup smoke', () => {
  it('creates a manual backup and calls onBackupCreated', async () => {
    const onBackupCreated = vi.fn()
    render(
      <AutoBackupSystem
        language="en"
        projectId="proj-test"
        onBackupCreated={onBackupCreated}
        onRestoreCompleted={vi.fn()}
      />
    )

    const createBtn = screen.getByRole('button', { name: /Create Backup/i })
    fireEvent.click(createBtn)

    await waitFor(() => {
      expect(onBackupCreated).toHaveBeenCalled()
    })

    // The list should show at least one backup card
    expect(screen.getByText(/Backups/i)).toBeInTheDocument()
  })
})
