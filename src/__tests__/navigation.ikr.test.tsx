import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import NavigationMenu from '@/components/NavigationMenu'

describe('NavigationMenu → IKR entry', () => {
  it('renders IKR item (RU) and navigates on click', async () => {
    const onNavigate = vi.fn()
    render(
      <NavigationMenu
        language="ru"
        currentPage="overview"
        onNavigate={onNavigate}
        onBack={() => {}}
        systemHealth={{ overall: 100, components: { storage: 100, ai: 100, ui: 100, memory: 100 }, issues: [] }}
        projectTitle="Тестовый проект"
      />
    )

    // Должен присутствовать пункт "Директива IKR"
    const ikrNode = await screen.findByText('Директива IKR')
    expect(ikrNode).toBeInTheDocument()

    // Клик по элементу инициирует навигацию на 'ikr'
    fireEvent.click(ikrNode)
    expect(onNavigate).toHaveBeenCalledWith('ikr')
  })
})
