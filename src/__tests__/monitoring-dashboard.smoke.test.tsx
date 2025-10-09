import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';

// Mock useKV hook
vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn(() => [[], vi.fn()])
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

import MonitoringDashboard from '@/components/MonitoringDashboard';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

const mockUseKV = useKV as any;
const mockToast = toast as any;

describe('MonitoringDashboard Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useKV to return empty arrays by default
    mockUseKV.mockReturnValue([[], vi.fn()]);
  });

  it('renders without crashing', () => {
    render(<MonitoringDashboard language="en" />);
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument();
  });

  it('renders with Russian language', () => {
    render(<MonitoringDashboard language="ru" />);
    expect(screen.getByText('Панель Мониторинга')).toBeInTheDocument();
  });

  it('handles language prop correctly', () => {
    const { rerender } = render(<MonitoringDashboard language="en" />);
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument();
    
    rerender(<MonitoringDashboard language="ru" />);
    expect(screen.getByText('Панель Мониторинга')).toBeInTheDocument();
  });

  it('handles project ID prop', () => {
    render(<MonitoringDashboard language="en" projectId="test-project" />);
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument();
  });

  it('handles callbacks correctly', () => {
    const mockOnAlertTriggered = vi.fn();
    const mockOnMetricThresholdExceeded = vi.fn();
    
    render(
      <MonitoringDashboard 
        language="en" 
        onAlertTriggered={mockOnAlertTriggered}
        onMetricThresholdExceeded={mockOnMetricThresholdExceeded}
      />
    );
    
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument();
  });

  it('renders basic interface elements', () => {
    render(<MonitoringDashboard language="en" />);
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument();
  });

  it('handles different project IDs', () => {
    const { rerender } = render(<MonitoringDashboard language="en" projectId="project1" />);
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument();
    
    rerender(<MonitoringDashboard language="en" projectId="project2" />);
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument();
  });
});