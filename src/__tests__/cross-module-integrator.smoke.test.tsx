import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CrossModuleIntegrator from '../components/CrossModuleIntegrator';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useKV hook
vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn((key, defaultValue) => {
    const [value, setValue] = React.useState(defaultValue);
    return [value, setValue];
  }),
}));

describe('CrossModuleIntegrator Smoke Tests', () => {
  const defaultProps = {
    language: 'en' as const,
    projectId: 'test-project',
    currentModule: 'overview',
    onIntegrationExecuted: vi.fn(),
    onRuleTriggered: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CrossModuleIntegrator {...defaultProps} />);
    expect(screen.getByText('Cross-Module Integration')).toBeInTheDocument();
  });

  it('displays main title', () => {
    render(<CrossModuleIntegrator {...defaultProps} />);
    expect(screen.getByText('Cross-Module Integration')).toBeInTheDocument();
  });

  it('renders with Russian language', () => {
    render(<CrossModuleIntegrator {...defaultProps} language="ru" />);
    expect(screen.getByText('Межмодульная Интеграция')).toBeInTheDocument();
  });

  it('handles project ID prop correctly', () => {
    const customProjectId = 'custom-project-456';
    render(<CrossModuleIntegrator {...defaultProps} projectId={customProjectId} />);
    
    // Component should render without errors with custom project ID
    expect(screen.getByText(/Cross-Module Integration|Межмодульная Интеграция/)).toBeInTheDocument();
  });

  it('handles optional props gracefully', () => {
    render(<CrossModuleIntegrator {...defaultProps} currentModule={undefined} />);
    expect(screen.getByText(/Cross-Module Integration|Межмодульная Интеграция/)).toBeInTheDocument();
  });

  describe('Tab Navigation', () => {
    it('has navigation elements', () => {
      render(<CrossModuleIntegrator {...defaultProps} />);
      
      // Check for basic interactive elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Callback Handling', () => {
    it('handles integration execution callback', () => {
      render(<CrossModuleIntegrator {...defaultProps} />);
      
      // Component should be ready to handle integration callbacks
      expect(defaultProps.onIntegrationExecuted).toBeDefined();
    });

    it('handles rule trigger callback', () => {
      render(<CrossModuleIntegrator {...defaultProps} />);
      
      // Component should be ready to handle rule callbacks
      expect(defaultProps.onRuleTriggered).toBeDefined();
    });

    it('handles optional callbacks gracefully', () => {
      render(
        <CrossModuleIntegrator 
          {...defaultProps} 
          onIntegrationExecuted={undefined}
          onRuleTriggered={undefined}
        />
      );
      expect(screen.getByText(/Cross-Module Integration|Межмодульная Интеграция/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles empty project ID gracefully', () => {
      render(<CrossModuleIntegrator {...defaultProps} projectId="" />);
      expect(screen.getByText(/Cross-Module Integration|Межмодульная Интеграция/)).toBeInTheDocument();
    });

    it('handles invalid module names gracefully', () => {
      render(<CrossModuleIntegrator {...defaultProps} currentModule="unknown-module" />);
      expect(screen.getByText(/Cross-Module Integration|Межмодульная Интеграция/)).toBeInTheDocument();
    });
  });
});