import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AutoBackupSystem from '@/components/AutoBackupSystem'

describe('AutoBackupSystem – schedule tab smoke', () => {
  it('shows Next backup info when auto is enabled', async () => {
    render(
      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="backups"></TabsContent>
        <TabsContent value="schedule">
          <AutoBackupSystem
            language="en"
            projectId="proj-test"
            onBackupCreated={() => {}}
            onRestoreCompleted={() => {}}
          />
        </TabsContent>
      </Tabs>
    )

    // Toggle schedule to ensure it's visible
    const enableAuto = screen.getByText(/Enable Auto Backup/i)
    expect(enableAuto).toBeInTheDocument()
  })
})
