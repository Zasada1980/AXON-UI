import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, fireEvent, waitFor, within } from '@testing-library/react'
import IKRDirectivePage from '@/pages/IKRDirectivePage'

// Verifies that after creating an analysis, IKR tools sections are present

describe('IKRDirectivePage tools presence after analysis creation', () => {
  it('shows Intelligence Gathering, Kipling Questionnaire and Micro-Task Executor', async () => {
    const { getByText, getByRole } = render(
      <IKRDirectivePage language="en" projectId="test-tools" onNavigate={() => {}} />
    )

    // Open create dialog
    fireEvent.click(getByText('New IKR Analysis'))
    const dialog = getByRole('dialog')
    const $ = within(dialog)

    // Fill and create
    fireEvent.change($.getByLabelText('Title'), { target: { value: 'Tools Analysis' } })
    fireEvent.change($.getByLabelText('Description'), { target: { value: 'Check tools integration' } })
    fireEvent.click($.getByRole('button', { name: 'Create Analysis' }))

    // Wait for analysis view
    await waitFor(() => expect(getByText('Tools Analysis')).toBeTruthy())

    // Assert tools headings are rendered
    expect(getByText('Intelligence Gathering')).toBeTruthy()
    expect(getByText('Kipling Questionnaire')).toBeTruthy()
    expect(getByText('Micro-Task Executor')).toBeTruthy()
    expect(getByText('Advanced Cognitive Analysis')).toBeTruthy()
  })
})
