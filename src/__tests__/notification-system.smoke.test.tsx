import { render, screen } from '@testing-library/react'
import NotificationSystem from '@/components/NotificationSystem'

describe('NotificationSystem smoke', () => {
  it('renders notification interface', async () => {
    render(
      <NotificationSystem 
        language="en" 
        projectId="test-project"
        onNotificationClick={() => {}}
      />
    )

    // Should render main sections  
    expect(await screen.findByText(/Notification System/i)).toBeInTheDocument()
    expect(screen.getByText(/Notification Settings/i)).toBeInTheDocument()
    
    // Should have notification controls
    expect(screen.getByText(/All Notifications/i)).toBeInTheDocument()
    expect(screen.getByText(/Unread Notifications/i)).toBeInTheDocument()
  })

  it('renders with Russian language', async () => {
    render(
      <NotificationSystem 
        language="ru" 
        projectId="test-project"
        onNotificationClick={() => {}}
      />
    )

    // Should render in Russian
    expect(await screen.findByText(/Система Уведомлений/i)).toBeInTheDocument()
    expect(screen.getByText(/Настройки Уведомлений/i)).toBeInTheDocument()
    expect(screen.getByText(/Все Уведомления/i)).toBeInTheDocument()
  })
})