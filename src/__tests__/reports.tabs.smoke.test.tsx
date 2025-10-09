import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectReportsPage from '@/pages/ProjectReportsPage'

describe('ProjectReportsPage tabs smoke', () => {
  it('switches tabs and shows key headers and actions', async () => {
    const user = userEvent.setup()
    render(
      <ProjectReportsPage language="en" projectId="p1" onNavigate={() => {}} />
    )

    // Default Requirements tab
    expect(await screen.findByRole('tab', { name: /Requirements/i })).toBeInTheDocument()

    // Work Status
    await user.click(screen.getByRole('tab', { name: /Work Status/i }))
    expect(await screen.findByText(/Enhanced Work Metrics/i)).toBeInTheDocument()

    // Journal
    await user.click(screen.getByRole('tab', { name: /Master Journal/i }))
    expect(await screen.findByText(/Master Report Journal/i)).toBeInTheDocument()
    // Export Journal button present
    expect(screen.getByRole('button', { name: /Export Journal/i })).toBeInTheDocument()

    // System Completion
    await user.click(screen.getByRole('tab', { name: /System Completion/i }))
    expect(await screen.findByText(/System Completion Report/i)).toBeInTheDocument()
    // Generate and Export buttons present
    expect(screen.getByRole('button', { name: /Generate Complete Report/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export Report/i })).toBeInTheDocument()

    // UI Audit
    await user.click(screen.getByRole('tab', { name: /UI Evolution Audit/i }))
    const matches = await screen.findAllByText(/UI Evolution Audit/i)
    expect(matches.length).toBeGreaterThan(0)
  })
})
