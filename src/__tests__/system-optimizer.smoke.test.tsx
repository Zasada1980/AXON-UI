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

import SystemOptimizer from '@/components/SystemOptimizer';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

const mockUseKV = useKV as any;
const mockToast = toast as any;

describe('SystemOptimizer Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useKV to return empty arrays by default
    mockUseKV.mockReturnValue([[], vi.fn()]);
  });

  it('renders without crashing', () => {
    render(<SystemOptimizer language="en" />);
    expect(screen.getByText('System Optimizer')).toBeInTheDocument();
  });

  it('renders with Russian language', () => {
    render(<SystemOptimizer language="ru" />);
    expect(screen.getByText('Оптимизатор Системы')).toBeInTheDocument();
  });

  it('handles language prop correctly', () => {
    const { rerender } = render(<SystemOptimizer language="en" />);
    expect(screen.getByText('System Optimizer')).toBeInTheDocument();
    
    rerender(<SystemOptimizer language="ru" />);
    expect(screen.getByText('Оптимизатор Системы')).toBeInTheDocument();
  });

  it('handles project ID prop', () => {
    render(<SystemOptimizer language="en" projectId="test-project" />);
    expect(screen.getByText('System Optimizer')).toBeInTheDocument();
  });

  it('handles callbacks correctly', () => {
    const mockOnOptimizationComplete = vi.fn();
    const mockOnTaskComplete = vi.fn();
    
    render(
      <SystemOptimizer 
        language="en" 
        onOptimizationComplete={mockOnOptimizationComplete}
        onTaskComplete={mockOnTaskComplete}
      />
    );
    
    expect(screen.getByText('System Optimizer')).toBeInTheDocument();
  });

  it('renders basic interface elements', () => {
    render(<SystemOptimizer language="en" />);
    expect(screen.getByText('System Optimizer')).toBeInTheDocument();
  });

  it('handles different project IDs', () => {
    const { rerender } = render(<SystemOptimizer language="en" projectId="project1" />);
    expect(screen.getByText('System Optimizer')).toBeInTheDocument();
    
    rerender(<SystemOptimizer language="en" projectId="project2" />);
    expect(screen.getByText('System Optimizer')).toBeInTheDocument();
  });
});