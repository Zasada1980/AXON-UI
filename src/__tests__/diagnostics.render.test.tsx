import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DiagnosticsPage from '@/pages/DiagnosticsPage'

vi.mock('@/services/axonAdapter', () => ({
  axon: {
    health: vi.fn(async () => ({ ok: true, version: 'test' })),
  },
}))

describe('DiagnosticsPage', () => {
  const props = {
    language: 'en' as const,
    projectId: 'test-project',
    onNavigate: vi.fn(),
  }

  beforeEach(() => {
    props.onNavigate.mockClear()
  })

  it('renders header and tabs', () => {
    render(<DiagnosticsPage {...props} />)

  // There are two headings with same text (page h1 and inner h2). Accept either.
  expect(screen.getAllByText('System Diagnostics').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Monitor system health and performance metrics')).toBeInTheDocument()

  // Tabs (role=tab) — avoid collision with Back to Overview button
  expect(screen.getAllByRole('tab', { name: /Overview/i }).length).toBeGreaterThanOrEqual(1)
  expect(screen.getAllByRole('tab', { name: /Monitoring & Recovery/i }).length).toBeGreaterThanOrEqual(1)
  expect(screen.getAllByRole('tab', { name: /Backups/i }).length).toBeGreaterThanOrEqual(1)
  expect(screen.getAllByRole('tab', { name: /Checkpoints/i }).length).toBeGreaterThanOrEqual(1)
  })
})
