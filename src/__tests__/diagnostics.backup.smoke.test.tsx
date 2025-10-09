import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AutoBackupSystem from '@/components/AutoBackupSystem'

describe('AutoBackupSystem – manual backup smoke', () => {
  it('creates a manual backup and calls onBackupCreated', async () => {
    const onBackupCreated = vi.fn()
    
    // Disable auto backup to avoid background intervals interfering with fake timers
    const projectId = 'proj-test'
    const defaultSettings = {
      autoBackupEnabled: false,
      backupInterval: 30,
      maxBackups: 10,
      compressionEnabled: true,
      encryptionEnabled: false,
      cloudSyncEnabled: false,
      retentionDays: 30,
      backupLocation: 'local',
      excludePatterns: ['*.tmp', '*.log'],
      includeModules: ['kipling', 'ikr', 'audit', 'chat'],
      backupOnChange: true,
      minimumChangeThreshold: 5
    }
    localStorage.setItem(`backup-settings-${projectId}`, JSON.stringify(defaultSettings))
    render(
      <AutoBackupSystem
        language="en"
        projectId={projectId}
        onBackupCreated={onBackupCreated}
        onRestoreCompleted={vi.fn()}
        testMode
      />
    )

    const createBtn = screen.getByRole('button', { name: /Create Backup/i })
    await act(async () => {
      fireEvent.click(createBtn)
    })

    await waitFor(() => expect(onBackupCreated).toHaveBeenCalled())

    // The list should show at least one backup card
  expect(screen.getByRole('tab', { name: /Backups/i })).toBeInTheDocument()
  }, 15000)
})
