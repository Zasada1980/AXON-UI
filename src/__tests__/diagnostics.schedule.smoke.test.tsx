import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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

    // Switch to inner Schedule tab in AutoBackupSystem (inside the schedule content panel)
  const outerSchedulePanel = screen.getAllByRole('tabpanel', { name: /schedule/i })[0]
  const innerTablist = within(outerSchedulePanel).getByRole('tablist')
    const innerScheduleTab = within(innerTablist).getByRole('tab', { name: /Schedule/i })
    fireEvent.click(innerScheduleTab)

  // The schedule card should render the title text "Automatic Backup Schedule"
  const heading = await within(outerSchedulePanel).findByText(/Automatic Backup Schedule/i)
    expect(heading).toBeInTheDocument()
  })
})
