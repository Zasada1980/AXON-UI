import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useKV hook with proper resource usage data
vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn((key: string, defaultValue: any) => {
    // Return proper resourceUsage object for resource-usage key
    if (key.includes('resource-usage')) {
      return [{
        cpu: { percentage: 25, cores: 4, processes: [] },
        memory: { used: 4, total: 16, percentage: 25, available: 12 },
        network: { upload: 100, download: 1000, latency: 50, packets: { sent: 100, received: 98, lost: 2 } },
        storage: { used: 400, total: 1000, percentage: 40, readSpeed: 400, writeSpeed: 300 }
      }, vi.fn()];
    }
    // Return empty arrays for other keys
    return [defaultValue !== undefined ? defaultValue : [], vi.fn()];
  })
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

import PerformanceMonitor from '@/components/PerformanceMonitor';

describe('PerformanceMonitor Smoke Tests', () => {
  it('renders without crashing', () => {
    render(<PerformanceMonitor language="en" />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('renders with Russian language', () => {
    render(<PerformanceMonitor language="ru" />);
    expect(screen.getByText('Монитор Производительности')).toBeInTheDocument();
  });

  it('displays basic structure', () => {
    render(<PerformanceMonitor language="en" />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('handles language prop correctly', () => {
    const { rerender } = render(<PerformanceMonitor language="en" />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
    
    rerender(<PerformanceMonitor language="ru" />);
    expect(screen.getByText('Монитор Производительности')).toBeInTheDocument();
  });

  it('handles project ID prop', () => {
    render(<PerformanceMonitor language="en" projectId="test-project" />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('handles callbacks correctly', () => {
    const mockOnPerformanceAlert = vi.fn();
    const mockOnBottleneckDetected = vi.fn();
    
    render(
      <PerformanceMonitor 
        language="en" 
        onPerformanceAlert={mockOnPerformanceAlert}
        onBottleneckDetected={mockOnBottleneckDetected}
      />
    );
    
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('renders basic interface elements', () => {
    render(<PerformanceMonitor language="en" />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('handles different language settings', () => {
    const { rerender } = render(<PerformanceMonitor language="en" />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
    
    rerender(<PerformanceMonitor language="ru" />);
    expect(screen.getByText('Монитор Производительности')).toBeInTheDocument();
  });
});
