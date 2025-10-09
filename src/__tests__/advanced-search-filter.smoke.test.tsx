import { render, screen } from '@testing-library/react'
import AdvancedSearchFilter from '@/components/AdvancedSearchFilter'

describe('AdvancedSearchFilter smoke', () => {
  it('renders search interface', async () => {
    render(
      <AdvancedSearchFilter 
        language="en" 
        projectId="test-project"
        onSearchResults={() => {}}
        onFilterSaved={() => {}}
      />
    )

    // Should render main sections  
    expect(await screen.findByText(/Advanced Search & Filtering/i)).toBeInTheDocument()
    
    // Should have search functionality
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter search query/i)).toBeInTheDocument()
  })

  it('renders with Russian language', async () => {
    render(
      <AdvancedSearchFilter 
        language="ru" 
        projectId="test-project"
        onSearchResults={() => {}}
        onFilterSaved={() => {}}
      />
    )

    // Should render in Russian
    expect(await screen.findByText(/Продвинутый поиск и фильтрация/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Поиск/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Фильтры/i })).toBeInTheDocument()
  })
})