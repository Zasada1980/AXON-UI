import { render, screen } from '@testing-library/react'
import ProjectReportsPage from '@/pages/ProjectReportsPage'

describe('ProjectReportsPage smoke', () => {
  it('renders tabs and default Requirements tab', async () => {
    render(
      <ProjectReportsPage
        language="en"
        projectId="test-project"
        onNavigate={() => {}}
      />
    )
    expect(screen.getByText('Project Reports')).toBeInTheDocument()
    // Tabs presence
    expect(screen.getByRole('tab', { name: /Requirements/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Work Status/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Master Journal/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /System Completion/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /UI Evolution Audit/i })).toBeInTheDocument()
  })
})
