import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlagsManager } from '../components/FeatureFlagsManager';

// Mock useKV hook with proper state management
let mockKVStore: Record<string, any> = {};

vi.mock('@github/spark/hooks', () => ({
  useKV: (key: string, defaultValue: any) => {
    if (!(key in mockKVStore)) {
      mockKVStore[key] = defaultValue;
    }
    const setValue = (newValue: any) => {
      mockKVStore[key] = typeof newValue === 'function' ? newValue(mockKVStore[key]) : newValue;
    };
    return [mockKVStore[key], setValue];
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FeatureFlagsManager - Smoke Tests', () => {
  beforeEach(() => {
    // Clear mock store before each test
    mockKVStore = {};
  });

  const defaultProps = {
    projectId: 'test-project',
    locale: 'en' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    expect(screen.getByText(/Feature Flags Manager/i)).toBeInTheDocument();
  });

  it('displays subtitle text', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    expect(screen.getByText(/Control feature rollouts/i)).toBeInTheDocument();
  });

  it('shows "Add Flag" button', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    expect(addButton).toBeInTheDocument();
  });

  it('displays tabs for Flags and Audit Log', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /Feature Flags/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Audit Log/i })).toBeInTheDocument();
  });

  it('shows search input placeholder', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Search flags/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('displays filter dropdowns', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    // Check for combobox roles (Select components)
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
  });

  it('shows export button', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    const exportButton = screen.getByRole('button', { name: /Export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('shows import button', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    // Import is a label wrapping input, so check for text
    expect(screen.getByText(/Import/i)).toBeInTheDocument();
  });

  it('displays empty state when no flags exist', () => {
    render(<FeatureFlagsManager {...defaultProps} />);
    expect(screen.getByText(/No feature flags found/i)).toBeInTheDocument();
    expect(screen.getByText(/Create your first feature flag/i)).toBeInTheDocument();
  });

  it('opens create dialog when "Add Flag" is clicked', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('displays flag name input in create dialog', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Flag Name/i)).toBeInTheDocument();
    });
  });

  it('displays description textarea in create dialog', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });
  });

  it('has status select in create dialog', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });
  });

  it('has category select in create dialog', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    });
  });

  it('has environment select in create dialog', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Environment/i)).toBeInTheDocument();
    });
  });

  it('shows Save button in create dialog', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      const saveButtons = screen.getAllByRole('button', { name: /Save/i });
      expect(saveButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows Cancel button in create dialog', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Flag/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  it('renders with Russian locale', () => {
    render(<FeatureFlagsManager {...defaultProps} locale="ru" />);
    expect(screen.getByText(/Менеджер Feature Flags/i)).toBeInTheDocument();
  });

  it('displays audit log tab', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const auditTab = screen.getByRole('tab', { name: /Audit Log/i });
    await user.click(auditTab);

    await waitFor(() => {
      expect(screen.getByText(/Track all changes/i)).toBeInTheDocument();
    });
  });

  it('shows empty audit log message', async () => {
    const user = userEvent.setup();
    render(<FeatureFlagsManager {...defaultProps} />);
    
    const auditTab = screen.getByRole('tab', { name: /Audit Log/i });
    await user.click(auditTab);

    await waitFor(() => {
      expect(screen.getByText(/No audit entries yet/i)).toBeInTheDocument();
    });
  });
});
