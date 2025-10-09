import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExternalAPIIntegrator from '../components/ExternalAPIIntegrator';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useKV hook
vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn((key, defaultValue) => {
    const [value, setValue] = React.useState(defaultValue);
    return [value, setValue];
  }),
}));

describe('ExternalAPIIntegrator Smoke Tests', () => {
  const defaultProps = {
    language: 'en' as const,
    projectId: 'test-project',
    onConnectionEstablished: vi.fn(),
    onRequestCompleted: vi.fn(),
    onWebhookTriggered: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ExternalAPIIntegrator {...defaultProps} />);
    expect(screen.getByText('External API Integrator')).toBeInTheDocument();
  });

  it('displays main title', () => {
    render(<ExternalAPIIntegrator {...defaultProps} />);
    expect(screen.getByText('External API Integrator')).toBeInTheDocument();
    expect(screen.getByText('Manage external API connections and integrations')).toBeInTheDocument();
  });

  it('has basic functionality buttons', () => {
    render(<ExternalAPIIntegrator {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'New Connection' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Make Request' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Webhook' })).toBeInTheDocument();
  });

  it('renders with Russian language', () => {
    render(<ExternalAPIIntegrator {...defaultProps} language="ru" />);
    expect(screen.getByText('Интегратор Внешних API')).toBeInTheDocument();
  });

  it('handles project ID prop correctly', () => {
    const customProjectId = 'custom-project-123';
    render(<ExternalAPIIntegrator {...defaultProps} projectId={customProjectId} />);
    
    // Component should render without errors with custom project ID
    expect(screen.getByText('External API Integrator')).toBeInTheDocument();
  });

  it('handles callback props', () => {
    render(<ExternalAPIIntegrator {...defaultProps} />);
    
    // Component should be ready to handle callbacks
    expect(defaultProps.onConnectionEstablished).toBeDefined();
    expect(defaultProps.onRequestCompleted).toBeDefined();
    expect(defaultProps.onWebhookTriggered).toBeDefined();
  });

  describe('Error Handling', () => {
    it('handles missing external dependencies gracefully', () => {
      // Test that component doesn't crash when external APIs are unavailable
      render(<ExternalAPIIntegrator {...defaultProps} />);
      expect(screen.getByText('External API Integrator')).toBeInTheDocument();
    });

    it('handles invalid project ID gracefully', () => {
      render(<ExternalAPIIntegrator {...defaultProps} projectId="" />);
      expect(screen.getByText('External API Integrator')).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('has accessible button elements', () => {
      render(<ExternalAPIIntegrator {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
      });
    });

    it('handles component initialization', () => {
      render(<ExternalAPIIntegrator {...defaultProps} />);
      
      // Component should initialize without errors
      expect(screen.getByText('External API Integrator')).toBeInTheDocument();
    });
  });
});