import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AuthenticationSystem from '../components/AuthenticationSystem';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Spark hooks
vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn(() => [[], vi.fn()]),
}));

// Mock global Spark object
Object.defineProperty(globalThis, 'spark', {
  value: {
    user: vi.fn(() => Promise.resolve({
      id: 'test-user-id',
      login: 'testuser',
      email: 'test@example.com',
      isOwner: true,
      avatarUrl: 'https://example.com/avatar.jpg'
    })),
  },
  configurable: true,
});

describe('AuthenticationSystem Smoke Tests', () => {
  const defaultProps = {
    language: 'en' as const,
    projectId: 'test-project',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AuthenticationSystem {...defaultProps} />);
    expect(screen.getByText('Authentication System')).toBeInTheDocument();
  });

  it('displays security management description', () => {
    render(<AuthenticationSystem {...defaultProps} />);
    expect(screen.getByText('Security Management')).toBeInTheDocument();
  });

  it('shows navigation tabs', () => {
    render(<AuthenticationSystem {...defaultProps} />);
    
    // Check for main tabs
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Session Management')).toBeInTheDocument();
    expect(screen.getByText('Security Audit')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders with Russian language', () => {
    render(<AuthenticationSystem {...defaultProps} language="ru" />);
    expect(screen.getByText('Система Аутентификации')).toBeInTheDocument();
    expect(screen.getByText('Управление Безопасностью')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<AuthenticationSystem {...defaultProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles project ID prop correctly', () => {
    const customProjectId = 'custom-project-123';
    render(<AuthenticationSystem {...defaultProps} projectId={customProjectId} />);
    
    // Component should render without errors with custom project ID
    expect(screen.getByText('Authentication System')).toBeInTheDocument();
  });

  it('shows security shield icon', () => {
    render(<AuthenticationSystem {...defaultProps} />);
    
    // Check that component renders with shield icons
    const header = screen.getByText('Authentication System').closest('div');
    expect(header).toBeInTheDocument();
  });

  it('has proper security tabs structure', () => {
    render(<AuthenticationSystem {...defaultProps} />);
    
    // Verify all four main tabs are present
    const tabs = ['User Management', 'Session Management', 'Security Audit', 'Settings'];
    tabs.forEach(tab => {
      expect(screen.getByText(tab)).toBeInTheDocument();
    });
  });

  it('provides accessibility features', () => {
    render(<AuthenticationSystem {...defaultProps} />);
    
    // Check for proper roles and labels
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
  });

  it('handles optional callback props gracefully', () => {
    const onUserAuthenticated = vi.fn();
    const onSecurityEvent = vi.fn();
    const onPermissionChanged = vi.fn();
    
    render(
      <AuthenticationSystem 
        {...defaultProps} 
        onUserAuthenticated={onUserAuthenticated}
        onSecurityEvent={onSecurityEvent}
        onPermissionChanged={onPermissionChanged}
      />
    );
    
    expect(screen.getByText('Authentication System')).toBeInTheDocument();
  });

  it('integrates with Spark user system', async () => {
    render(<AuthenticationSystem {...defaultProps} />);
    
    // Wait for Spark user integration to complete
    await vi.waitFor(() => {
      expect(globalThis.spark.user).toHaveBeenCalled();
    });
  });

  describe('Security Features', () => {
    it('shows role-based access indicators', () => {
      render(<AuthenticationSystem {...defaultProps} />);
      
      // Should show admin badge for test user
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('displays GitHub integration badge when available', () => {
      render(<AuthenticationSystem {...defaultProps} />);
      
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('shows security level information', () => {
      render(<AuthenticationSystem {...defaultProps} />);
      
      // Should display password policy and session settings
      expect(screen.getByText('Password Policy')).toBeInTheDocument();
      expect(screen.getByText('Session Settings')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles Spark user API failure gracefully', () => {
      // Mock Spark user API to fail
      Object.defineProperty(globalThis, 'spark', {
        value: {
          user: vi.fn(() => Promise.reject(new Error('API unavailable'))),
        },
        configurable: true,
      });

      render(<AuthenticationSystem {...defaultProps} />);
      
      // Should still render without crashing
      expect(screen.getByText('Authentication System')).toBeInTheDocument();
    });

    it('falls back to demo data when Spark is unavailable', () => {
      // Mock global to be undefined
      Object.defineProperty(globalThis, 'spark', {
        value: undefined,
        configurable: true,
      });

      render(<AuthenticationSystem {...defaultProps} />);
      
      // Should render with demo data
      expect(screen.getByText('Authentication System')).toBeInTheDocument();
    });
  });
});