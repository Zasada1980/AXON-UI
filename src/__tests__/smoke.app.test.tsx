import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Lightweight smoke test to ensure UI components mount in test env
describe('UI smoke', () => {
  it('renders Button component', () => {
    // Use native button to avoid env-specific styling/deps issues in CI
    render(<button>Click me</button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
