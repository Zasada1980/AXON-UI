import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Button } from '@/components/ui/button'

// Lightweight smoke test to ensure UI components mount in test env
describe('UI smoke', () => {
  it('renders Button component', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
