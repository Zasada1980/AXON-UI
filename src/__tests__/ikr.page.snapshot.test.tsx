import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import IKRDirectivePage from '@/pages/IKRDirectivePage'

// Minimal render test: asserts header texts without invoking network

describe('IKRDirectivePage render', () => {
  it('renders RU header strings', () => {
    const { getByText } = render(
      <IKRDirectivePage language="ru" projectId="test" onNavigate={() => {}} />
    )
    expect(getByText('Директива IKR')).toBeTruthy()
  })
})
