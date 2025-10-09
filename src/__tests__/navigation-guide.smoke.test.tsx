import { render, screen } from '@testing-library/react'
import NavigationGuide from '@/components/NavigationGuide'

describe('NavigationGuide smoke', () => {
  it('renders guide interface', async () => {
    render(
      <NavigationGuide 
        language="en" 
        currentModule="overview"
      />
    )

    // Should render main sections  
    expect(await screen.findByText(/AXON User Guide/i)).toBeInTheDocument()
    
    // Should have guide content
    expect(screen.getByText(/Current Module Tip/i)).toBeInTheDocument()
    expect(screen.getByText(/Complete guide to using/i)).toBeInTheDocument()
  })

  it('renders with Russian language', async () => {
    render(
      <NavigationGuide 
        language="ru" 
        currentModule="overview"
      />
    )

    // Should render in Russian
    expect(await screen.findByText(/Руководство пользователя AXON/i)).toBeInTheDocument()
    expect(screen.getByText(/Совет для текущего модуля/i)).toBeInTheDocument()
    expect(screen.getByText(/Полное руководство по использованию/i)).toBeInTheDocument()
  })
})