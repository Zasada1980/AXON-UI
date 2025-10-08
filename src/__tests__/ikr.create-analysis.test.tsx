import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, fireEvent, waitFor, within } from '@testing-library/react'
import IKRDirectivePage from '@/pages/IKRDirectivePage'

describe('IKRDirectivePage create analysis flow', () => {
  it('allows creating a new analysis and shows I/K/R cards', async () => {
    const { getByText, getByLabelText, queryByText, getByRole } = render(
      <IKRDirectivePage language="en" projectId="test" onNavigate={() => {}} />
    )
    // Open create dialog
    fireEvent.click(getByText('New IKR Analysis'))
    // Scope actions within the dialog
    const dialog = getByRole('dialog')
    const dialogUtils = within(dialog)
    // Fill title and description
    fireEvent.change(dialogUtils.getByLabelText('Title'), { target: { value: 'Test Analysis' } })
    fireEvent.change(dialogUtils.getByLabelText('Description'), { target: { value: 'Test description' } })
    // Save
    fireEvent.click(dialogUtils.getByRole('button', { name: 'Create Analysis' }))
    // Wait for overview to appear
    await waitFor(() => expect(getByText('Test Analysis')).toBeTruthy())
    // Check I/K/R cards
    expect(getByText('Intelligence')).toBeTruthy()
    expect(getByText('Knowledge')).toBeTruthy()
    expect(getByText('Reasoning')).toBeTruthy()
    // Should not show create dialog anymore
    expect(queryByText('Create Analysis')).not.toBeInTheDocument()
  })
})
